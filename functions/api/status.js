// GET /api/status?t=<token> -> { status, fileLabel } (+ link ONLY when approved)
import { json, getRequest, TOKEN_RE } from '../_lib/util.js';

export async function onRequestGet({ request, env }) {
  if (!env || !env.ARCHIVE) return json({ error: 'unavailable' }, 503);
  const token = new URL(request.url).searchParams.get('t') || '';
  if (!TOKEN_RE.test(token)) return json({ error: 'invalid' }, 400);

  const rec = await getRequest(env, token);
  if (!rec) return json({ error: 'not found' }, 404);

  const out = { status: rec.status, fileLabel: rec.fileLabel };
  if (rec.status === 'approved') {
    const link = await env.ARCHIVE.get(`link:${rec.id}`);
    if (link && link.startsWith('https://')) out.link = link;
  }
  return json(out);
}
