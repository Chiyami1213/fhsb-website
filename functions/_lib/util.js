// Shared helpers for the Pages Functions. Plain JS, no dependencies.

export const TOKEN_RE = /^[a-f0-9]{32}$/;
export const ID_RE = /^[a-z0-9-]{1,64}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const TTL_MS = 90 * 24 * 60 * 60 * 1000; // requests live 90 days
export const MAX_OUTSTANDING = 200;

const NO_STORE = { 'Cache-Control': 'no-store' };

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...NO_STORE },
  });
}

// Wrong password, no password and a missing server secret all look identical.
export function unauthorized() {
  return new Response('Unauthorized', { status: 401, headers: NO_STORE });
}

export function newToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

/** Trim, drop control characters, cap the length. */
export function clean(value, max) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

/** Read a small JSON object body; returns null when missing/invalid/too large. */
export async function readJson(request, max = 8192) {
  try {
    const text = await request.text();
    if (text.length > max) return null;
    const data = JSON.parse(text);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

/** Constant-time comparison (hashes first so length does not leak). */
export async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

export async function isAdmin(request, env) {
  const secret = env && env.ADMIN_PASSWORD;
  if (!secret || typeof secret !== 'string') return false;
  const header = request.headers.get('Authorization') || '';
  const m = /^Bearer (.*)$/.exec(header);
  if (!m) return false;
  return safeEqual(m[1], secret);
}

export const MAX_FAILS = 3; // wrong-password attempts allowed...
export const LOCK_SECONDS = 15 * 60; // ...before that visitor is locked out for this long

export function locked() {
  return new Response('Too many attempts. Try again later.', { status: 429, headers: NO_STORE });
}

async function visitorKey(request) {
  // Hash the IP so no raw address is stored; the record disappears when the lock expires.
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const h = await sha256(ip);
  return 'fail:' + [...h].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Admin gate. Returns null when the password is right, otherwise the Response to send:
 * 401 Unauthorized for a wrong/missing password or missing secret (all identical),
 * 429 once a visitor has used up MAX_FAILS attempts. While locked, even the correct
 * password is refused until the lock expires.
 */
export async function guard(request, env) {
  const kv = env && env.ARCHIVE;
  let key = '';
  let fails = 0;
  if (kv) {
    key = await visitorKey(request);
    fails = parseInt((await kv.get(key)) || '0', 10) || 0;
    if (fails >= MAX_FAILS) return locked();
  }
  if (await isAdmin(request, env)) {
    if (kv && fails > 0) await kv.delete(key);
    return null;
  }
  if (kv) await kv.put(key, String(fails + 1), { expirationTtl: LOCK_SECONDS });
  return unauthorized();
}

/** Persist a request record, keeping its original 90-day expiry. */
export function putRequest(env, token, record) {
  const minExp = Math.floor(Date.now() / 1000) + 60;
  const expiration = Math.max(minExp, Math.floor(record.expires / 1000));
  return env.ARCHIVE.put(`req:${token}`, JSON.stringify(record), { expiration });
}

export async function getRequest(env, token) {
  const raw = await env.ARCHIVE.get(`req:${token}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** All keys under a prefix (follows KV pagination, bounded). */
export async function listKeys(env, prefix) {
  const names = [];
  let cursor;
  for (let page = 0; page < 10; page++) {
    const res = await env.ARCHIVE.list({ prefix, cursor });
    for (const k of res.keys) names.push(k.name);
    if (res.list_complete || !res.cursor) break;
    cursor = res.cursor;
  }
  return names;
}
