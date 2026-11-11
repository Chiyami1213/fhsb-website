// POST /api/admin/decide { token, decision: 'approve' | 'decline' }   (admin only)
import { json, guard, readJson, getRequest, putRequest, TOKEN_RE } from '../../_lib/util.js';

export async function onRequestPost({ request, env }) {
  const denied = await guard(request, env);
  if (denied) return denied;
  if (!env.ARCHIVE) return json({ error: 'unavailable' }, 503);

  const body = await readJson(request);
  const token = body && typeof body.token === 'string' ? body.token : '';
  const decision = body && body.decision;
  if (!TOKEN_RE.test(token) || (decision !== 'approve' && decision !== 'decline')) {
    return json({ error: 'invalid' }, 400);
  }
  const rec = await getRequest(env, token);
  if (!rec) return json({ error: 'not found' }, 404);

  rec.status = decision === 'approve' ? 'approved' : 'declined';
  await putRequest(env, token, rec);
  return json({ ok: true, status: rec.status });
}
