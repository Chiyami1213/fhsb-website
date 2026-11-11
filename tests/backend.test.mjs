import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost as requestPost } from '../functions/api/request.js';
import { onRequestGet as statusGet } from '../functions/api/status.js';
import { onRequestGet as listGet } from '../functions/api/admin/list.js';
import { onRequestPost as decidePost } from '../functions/api/admin/decide.js';
import { onRequestPost as linkPost } from '../functions/api/admin/link.js';
import { onRequestPost as deletePost } from '../functions/api/admin/delete.js';

const PW = 'correct horse battery staple';
const LINK = 'https://drive.example.com/file/abc';

function fakeKV() {
  const m = new Map();
  return {
    m,
    async get(k) { return m.has(k) ? m.get(k).value : null; },
    async put(k, value, opts) { m.set(k, { value, opts }); },
    async delete(k) { m.delete(k); },
    async list({ prefix = '' } = {}) {
      return { keys: [...m.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true };
    },
  };
}
const post = (body, headers = {}) =>
  new Request('https://x.test/api', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const admin = { Authorization: `Bearer ${PW}` };
const good = { id: 'sample-score', label: 'Sample score', name: 'Ann', email: 'ann@example.org', reason: 'choir' };
const status = (env, t) => statusGet({ request: new Request(`https://x.test/api/status?t=${t}`), env });

async function submit(env, body = good) {
  const res = await requestPost({ request: post(body), env });
  return { res, data: await res.json() };
}

test('request: bad input is rejected', async () => {
  const env = { ARCHIVE: fakeKV() };
  for (const bad of [
    { ...good, email: 'nope' },
    { ...good, name: '   ' },
    { ...good, id: 'Bad ID!' },
    { ...good, id: '../x' },
    { ...good, id: undefined },
  ]) {
    assert.equal((await submit(env, bad)).res.status, 400);
  }
  const res = await requestPost({ request: new Request('https://x.test/api', { method: 'POST', body: 'not json' }), env });
  assert.equal(res.status, 400);
  assert.equal(env.ARCHIVE.m.size, 0);
});

test('request: honeypot stores nothing and looks successful', async () => {
  const env = { ARCHIVE: fakeKV() };
  const { res, data } = await submit(env, { ...good, website: 'http://spam' });
  assert.equal(res.status, 200);
  assert.match(data.token, /^[a-f0-9]{32}$/);
  assert.equal(env.ARCHIVE.m.size, 0);
  assert.equal((await status(env, data.token)).status, 404);
});

test('request: stores a pending record with 90-day expiry and 32-hex token', async () => {
  const env = { ARCHIVE: fakeKV() };
  const { res, data } = await submit(env);
  assert.equal(res.status, 200);
  assert.match(data.token, /^[a-f0-9]{32}$/);
  const stored = env.ARCHIVE.m.get(`req:${data.token}`);
  const days = (stored.opts.expiration * 1000 - Date.now()) / 86400000;
  assert.ok(days > 89 && days <= 90, `expiry ${days}`);
});

test('request: caps outstanding requests at 200', async () => {
  const env = { ARCHIVE: fakeKV() };
  for (let i = 0; i < 200; i++) env.ARCHIVE.m.set(`req:${String(i).padStart(32, '0')}`, { value: '{}' });
  assert.equal((await submit(env)).res.status, 429);
});

test('request: notification failure never breaks the request', async () => {
  const env = { ARCHIVE: fakeKV(), RESEND_API_KEY: 'k', NOTIFY_EMAIL: 'admin@example.org' };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('network down'); };
  try {
    assert.equal((await submit(env)).res.status, 200);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('admin: wrong, missing password and missing secret all return the same Unauthorized', async () => {
  const routes = [
    (env, h) => listGet({ request: new Request('https://x.test/a', { headers: h }), env }),
    (env, h) => decidePost({ request: post({}, h), env }),
    (env, h) => linkPost({ request: post({}, h), env }),
    (env, h) => deletePost({ request: post({}, h), env }),
  ];
  for (const route of routes) {
    for (const [env, h] of [
      [{ ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW }, {}],
      [{ ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW }, { Authorization: 'Bearer wrong' }],
      [{ ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW }, { Authorization: PW }],
      [{ ARCHIVE: fakeKV() }, admin], // secret not configured
      [{ ARCHIVE: fakeKV(), ADMIN_PASSWORD: '' }, { Authorization: 'Bearer ' }],
    ]) {
      const res = await route(env, h);
      assert.equal(res.status, 401);
      assert.equal(await res.text(), 'Unauthorized');
    }
  }
});

test('flow: approve shows no link until one is set; declined/pending never expose it', async () => {
  const env = { ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW };
  await env.ARCHIVE.put('link:sample-score', LINK); // link exists from the start
  const { data } = await submit(env);
  const t = data.token;

  let s = await (await status(env, t)).json();
  assert.deepEqual(s, { status: 'pending', fileLabel: 'Sample score' });

  const decide = (decision) => decidePost({ request: post({ token: t, decision }, admin), env });
  assert.equal((await decide('decline')).status, 200);
  s = await (await status(env, t)).json();
  assert.equal(s.status, 'declined');
  assert.equal(s.link, undefined);

  assert.equal((await decide('approve')).status, 200);
  s = await (await status(env, t)).json();
  assert.equal(s.status, 'approved');
  assert.equal(s.link, LINK);
  // expiry of the record is preserved on update
  assert.ok(env.ARCHIVE.m.get(`req:${t}`).opts.expiration);
  assert.equal((await decide('maybe')).status, 400);
});

test('flow: approved without a link shows no link', async () => {
  const env = { ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW };
  const { data } = await submit(env);
  await decidePost({ request: post({ token: data.token, decision: 'approve' }, admin), env });
  const s = await (await status(env, data.token)).json();
  assert.equal(s.status, 'approved');
  assert.equal(s.link, undefined);
});

test('link: must be https, can be removed', async () => {
  const env = { ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW };
  const set = (url, id = 'sample-score') => linkPost({ request: post({ id, url }, admin), env });
  for (const bad of ['http://x.test/a', 'javascript:alert(1)', 'ftp://x.test', 'not a url', '//x.test']) {
    assert.equal((await set(bad)).status, 400, bad);
  }
  assert.equal((await set(LINK, 'Bad Id')).status, 400);
  assert.equal(env.ARCHIVE.m.size, 0);
  assert.equal((await set(LINK)).status, 200);
  assert.equal(await env.ARCHIVE.get('link:sample-score'), LINK);
  assert.equal((await set('')).status, 200);
  assert.equal(await env.ARCHIVE.get('link:sample-score'), null);
});

test('status: malformed token rejected, unknown token 404', async () => {
  const env = { ARCHIVE: fakeKV() };
  for (const t of ['', 'abc', 'G'.repeat(32), 'a'.repeat(31), 'a'.repeat(33), '../../link:x']) {
    assert.equal((await status(env, t)).status, 400, t);
  }
  assert.equal((await status(env, 'a'.repeat(32))).status, 404);
});

test('list + delete: admin sees requests; delete removes only that request', async () => {
  const env = { ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW };
  await env.ARCHIVE.put('link:sample-score', LINK);
  const a = (await submit(env)).data.token;
  const b = (await submit(env, { ...good, name: 'Bo' })).data.token;

  const list = await (await listGet({ request: new Request('https://x.test/a', { headers: admin }), env })).json();
  assert.equal(list.requests.length, 2);
  assert.equal(list.links['sample-score'], LINK);

  assert.equal((await deletePost({ request: post({ token: 'zz' }, admin), env })).status, 400);
  assert.equal((await deletePost({ request: post({ token: a }, admin), env })).status, 200);
  assert.equal((await status(env, a)).status, 404);
  assert.equal((await status(env, b)).status, 200);
  assert.equal(await env.ARCHIVE.get('link:sample-score'), LINK);
});

test('responses are never cacheable', async () => {
  const env = { ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW };
  const { res } = await submit(env);
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
  const un = await listGet({ request: new Request('https://x.test/a'), env });
  assert.equal(un.headers.get('Cache-Control'), 'no-store');
});

// ---- admin lockout: 3 wrong attempts per visitor ----
const tryList = (env, pw, ip = '1.1.1.1') =>
  listGet({
    request: new Request('https://x.test/a', {
      headers: { 'CF-Connecting-IP': ip, ...(pw === null ? {} : { Authorization: `Bearer ${pw}` }) },
    }),
    env,
  });

test('lockout: 3 wrong attempts allowed, then even the correct password is refused (429)', async () => {
  const env = { ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW };
  for (let i = 0; i < 3; i++) {
    const res = await tryList(env, 'wrong');
    assert.equal(res.status, 401, `attempt ${i + 1}`);
    assert.equal(await res.text(), 'Unauthorized');
  }
  const locked = await tryList(env, PW); // correct password, but locked
  assert.equal(locked.status, 429);
  assert.equal((await tryList(env, 'wrong')).status, 429);
  assert.equal((await tryList(env, null)).status, 429);
});

test('lockout: applies to every admin route, and lock expires after 1 hour', async () => {
  const env = { ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW };
  for (let i = 0; i < 3; i++) await tryList(env, 'wrong');
  const h = { 'CF-Connecting-IP': '1.1.1.1', ...admin };
  for (const route of [decidePost, linkPost, deletePost]) {
    const res = await route({ request: post({}, h), env });
    assert.equal(res.status, 429);
  }
  const failKey = [...env.ARCHIVE.m.keys()].find((k) => k.startsWith('fail:'));
  assert.ok(failKey, 'counter stored');
  assert.ok(!failKey.includes('1.1.1.1'), 'raw IP is not stored');
  assert.equal(env.ARCHIVE.m.get(failKey).opts.expirationTtl, 3600);
  env.ARCHIVE.m.delete(failKey); // what KV does when the TTL runs out
  assert.equal((await tryList(env, PW)).status, 200);
});

test('lockout: a correct login resets the counter; other visitors are not affected', async () => {
  const env = { ARCHIVE: fakeKV(), ADMIN_PASSWORD: PW };
  await tryList(env, 'wrong');
  await tryList(env, 'wrong');
  assert.equal((await tryList(env, PW)).status, 200); // success resets
  assert.equal([...env.ARCHIVE.m.keys()].filter((k) => k.startsWith('fail:')).length, 0);
  for (let i = 0; i < 3; i++) assert.equal((await tryList(env, 'wrong')).status, 401);
  assert.equal((await tryList(env, 'wrong')).status, 429);
  assert.equal((await tryList(env, PW, '2.2.2.2')).status, 200); // different visitor
});

test('lockout: counts even when the secret is not configured, and never touches request data', async () => {
  const env = { ARCHIVE: fakeKV() }; // no ADMIN_PASSWORD
  for (let i = 0; i < 3; i++) assert.equal((await tryList(env, 'x')).status, 401);
  assert.equal((await tryList(env, 'x')).status, 429);
  const { data } = await submit(env);
  assert.equal((await status(env, data.token)).status, 200); // visitors unaffected by admin lock
});

// ---- default language by country ----
import { onRequestGet as langGet } from '../functions/api/lang.js';
import { pickLang } from '../functions/_lib/util.js';

test('lang: Mandarin-speaking regions get zh, everywhere else (and unknown) gets en', () => {
  for (const c of ['TW', 'CN', 'HK', 'MO', 'SG', 'tw', 'Cn']) assert.equal(pickLang(c), 'zh', c);
  for (const c of ['US', 'JP', 'GB', 'MY', 'KR', 'XX', 'T1', '', undefined, null, 'TWN']) {
    assert.equal(pickLang(c), 'en', String(c));
  }
});

test('lang: endpoint reads the country from request.cf or the CF-IPCountry header, returns only the language', async () => {
  const fromCf = new Request('https://x.test/api/lang');
  fromCf.cf = { country: 'TW' };
  let res = await langGet({ request: fromCf });
  assert.deepEqual(await res.json(), { lang: 'zh' });
  assert.equal(res.headers.get('Cache-Control'), 'no-store');

  res = await langGet({ request: new Request('https://x.test/api/lang', { headers: { 'CF-IPCountry': 'US' } }) });
  const body = await res.text();
  assert.equal(body, JSON.stringify({ lang: 'en' }));
  assert.ok(!body.includes('US'), 'country is not echoed');

  res = await langGet({ request: new Request('https://x.test/api/lang') }); // no country info at all
  assert.deepEqual(await res.json(), { lang: 'en' });
});
