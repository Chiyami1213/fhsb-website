// POST /api/request  { id, label, name, email, reason, website(honeypot) } -> { ok, token }
import {
  json, readJson, clean, newToken, putRequest, listKeys,
  ID_RE, EMAIL_RE, TTL_MS, MAX_OUTSTANDING,
} from '../_lib/util.js';

async function notify(env, r) {
  // Optional alert to the site admin only. Failures must never break the request.
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'FHSB <onboarding@resend.dev>',
        to: [env.NOTIFY_EMAIL],
        subject: `Access request: ${r.fileLabel}`,
        text: `${r.name} (${r.email}) asked for "${r.fileLabel}".\n\nReason: ${r.reason || '-'}\n\nOpen the admin page to approve or decline.`,
      }),
    });
  } catch {
    /* ignore */
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env || !env.ARCHIVE) return json({ error: 'unavailable' }, 503);

  const body = await readJson(request);
  if (!body) return json({ error: 'invalid' }, 400);

  // Honeypot: bots fill the hidden field. Pretend success, store nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json({ ok: true, token: newToken() });
  }

  const id = typeof body.id === 'string' ? body.id : '';
  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const reason = clean(body.reason, 500);
  const fileLabel = clean(body.label, 120) || id;
  if (!ID_RE.test(id) || !name || !EMAIL_RE.test(email)) return json({ error: 'invalid' }, 400);

  const outstanding = await listKeys(env, 'req:');
  if (outstanding.length >= MAX_OUTSTANDING) return json({ error: 'busy' }, 429);

  const now = Date.now();
  const token = newToken();
  const record = { id, fileLabel, name, email, reason, status: 'pending', created: now, expires: now + TTL_MS };
  await putRequest(env, token, record);

  const p = notify(env, record);
  if (typeof context.waitUntil === 'function') context.waitUntil(p);
  else await p;

  return json({ ok: true, token });
}
