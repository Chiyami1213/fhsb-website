// POST /api/admin/link { id, url }   (admin only)
// Sets the share link for a locked file id; an empty url removes it.
import { json, unauthorized, isAdmin, readJson, ID_RE } from '../../_lib/util.js';

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  if (!env.ARCHIVE) return json({ error: 'unavailable' }, 503);

  const body = await readJson(request);
  const id = body && typeof body.id === 'string' ? body.id : '';
  const url = body && typeof body.url === 'string' ? body.url.trim() : null;
  if (!ID_RE.test(id) || url === null) return json({ error: 'invalid' }, 400);

  if (url === '') {
    await env.ARCHIVE.delete(`link:${id}`);
    return json({ ok: true, removed: true });
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return json({ error: 'invalid' }, 400);
  }
  if (!url.startsWith('https://') || parsed.protocol !== 'https:' || url.length > 2000) {
    return json({ error: 'invalid' }, 400);
  }
  await env.ARCHIVE.put(`link:${id}`, url);
  return json({ ok: true });
}
