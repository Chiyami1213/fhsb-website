// POST /api/admin/delete { token }   (admin only) - removes one request only.
import { json, guard, readJson, TOKEN_RE } from '../../_lib/util.js';

export async function onRequestPost({ request, env }) {
  const denied = await guard(request, env);
  if (denied) return denied;
  if (!env.ARCHIVE) return json({ error: 'unavailable' }, 503);

  const body = await readJson(request);
  const token = body && typeof body.token === 'string' ? body.token : '';
  if (!TOKEN_RE.test(token)) return json({ error: 'invalid' }, 400);

  await env.ARCHIVE.delete(`req:${token}`);
  return json({ ok: true });
}
