// Run after `npm run build`: loads the BUILT pages in jsdom and checks the language system.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const DIST = path.resolve('dist');
const SRC = path.resolve('src');

function walk(dir, ext, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

// dictionary parsed from the source file (no TypeScript runtime needed)
const dictSrc = fs.readFileSync(path.join(SRC, 'i18n/dict.ts'), 'utf8');
const dictBody = dictSrc.slice(dictSrc.indexOf('export const DICT'), dictSrc.indexOf('/** English text'));
const DICT = new Function(
  `${dictBody.replace('export const DICT: Record<string, Entry> =', 'return')}`,
)();

const tick = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Loads a BUILT page in jsdom.
 *  saved   -> localStorage presets (explicit choice lives in 'fhsb-lang')
 *  session -> sessionStorage presets (cached automatic choice 'fhsb-autolang')
 *  api     -> what /api/lang does: 'zh' | 'en' | 'fail' | 'slow' (never answers) | 'late-en' | 'late-zh'
 *  navLang -> navigator.language
 */
async function load(page, { saved = {}, session = {}, api = 'en', navLang = 'en-US' } = {}) {
  const html = fs.readFileSync(path.join(DIST, page), 'utf8');
  let fetchCalls = 0;
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'https://example.test/' + page.replace('index.html', ''),
    beforeParse(w) {
      for (const [k, v] of Object.entries(saved)) w.localStorage.setItem(k, v);
      for (const [k, v] of Object.entries(session)) w.sessionStorage.setItem(k, v);
      Object.defineProperty(w.navigator, 'language', { value: navLang, configurable: true });
      const answer = (lang) => ({ ok: true, json: async () => ({ lang }) });
      w.fetch = (url) => {
        if (String(url).includes('/api/lang')) {
          fetchCalls++;
          if (api === 'fail') return Promise.reject(new Error('offline'));
          if (api === 'slow') return new Promise(() => {});
          if (api === 'late-en') return tick(200).then(() => answer('en'));
          if (api === 'late-zh') return tick(200).then(() => answer('zh'));
          return Promise.resolve(answer(api));
        }
        return Promise.reject(new Error('unexpected fetch ' + url));
      };
    },
  });
  dom.fetchCalls = () => fetchCalls;
  if (dom.window.document.readyState !== 'complete') {
    await new Promise((r) => dom.window.addEventListener('load', r));
  }
  if (!api.startsWith('late') && api !== 'slow') await tick(30); // let the region check settle
  return dom;
}
const text = (dom, sel) => dom.window.document.querySelector(sel).textContent;
const lang = (dom) => dom.window.document.documentElement.lang;

test('default language follows the visitor region: zh in Mandarin-speaking regions, en elsewhere', async () => {
  let dom = await load('settings/index.html', { api: 'zh' });
  assert.equal(lang(dom), 'zh-TW');
  assert.equal(text(dom, 'h1'), '設定');
  assert.equal(text(dom, '#langcode'), 'CN');
  assert.equal(dom.window.localStorage.getItem('fhsb-lang'), null, 'automatic choice is not saved as an explicit one');
  assert.equal(dom.window.sessionStorage.getItem('fhsb-autolang'), 'zh');
  assert.ok(!dom.window.document.documentElement.classList.contains('i18n-pending'));
  dom.window.close();

  dom = await load('settings/index.html', { api: 'en' });
  assert.equal(lang(dom), 'en');
  assert.equal(text(dom, 'h1'), 'Settings');
  assert.equal(text(dom, '#langcode'), 'EN');
  assert.equal(dom.window.sessionStorage.getItem('fhsb-autolang'), 'en');
  dom.window.close();
});

test('if the region check fails or is slow, the browser language decides (zh* -> zh, otherwise en)', async () => {
  for (const [navLang, expected] of [['zh-TW', 'zh-TW'], ['zh-CN', 'zh-TW'], ['en-US', 'en'], ['ja-JP', 'en'], ['', 'en']]) {
    const dom = await load('settings/index.html', { api: 'fail', navLang });
    assert.equal(lang(dom), expected, `fail + ${navLang}`);
    dom.window.close();
  }
  const slow = await load('settings/index.html', { api: 'slow', navLang: 'en-US' });
  await tick(1400); // the 1.2 s timeout fires
  assert.equal(lang(slow), 'en');
  assert.equal(text(slow, 'h1'), 'Settings');
  assert.ok(!slow.window.document.documentElement.classList.contains('i18n-pending'));
  slow.window.close();
});

test('an explicit choice beats the region check, is remembered, and skips the check', async () => {
  let dom = await load('settings/index.html', { saved: { 'fhsb-lang': 'en' }, api: 'zh' });
  assert.equal(lang(dom), 'en');
  assert.equal(text(dom, 'h1'), 'Settings');
  assert.equal(dom.fetchCalls(), 0);
  dom.window.close();

  dom = await load('settings/index.html', { saved: { 'fhsb-lang': 'zh' }, api: 'en' });
  assert.equal(lang(dom), 'zh-TW');
  assert.equal(text(dom, 'h1'), '設定');
  assert.equal(dom.fetchCalls(), 0);
  dom.window.close();
});

test('choosing a language before the region check answers wins over the late answer', async () => {
  const dom = await load('settings/index.html', { api: 'late-zh' });
  dom.window.setLang('en');
  await tick(350);
  assert.equal(lang(dom), 'en');
  assert.equal(text(dom, 'h1'), 'Settings');
  assert.equal(dom.window.localStorage.getItem('fhsb-lang'), 'en');
  dom.window.close();
});

test('a late region answer that changes the language fires langchange; the session caches the result', async () => {
  const dom = await load('settings/index.html', { api: 'late-en' });
  let fired = 0;
  dom.window.document.addEventListener('langchange', () => fired++);
  await tick(350);
  assert.equal(lang(dom), 'en');
  assert.equal(text(dom, 'h1'), 'Settings');
  assert.equal(fired, 1);
  dom.window.close();

  // a cached automatic choice is reused within the session: no new request
  for (const [cached, expected] of [['en', 'en'], ['zh', 'zh-TW']]) {
    const d = await load('settings/index.html', { session: { 'fhsb-autolang': cached }, api: cached === 'en' ? 'zh' : 'en' });
    assert.equal(lang(d), expected);
    assert.equal(d.fetchCalls(), 0);
    d.window.close();
  }
});

test('invalid saved or cached values are ignored; invalid setLang calls do nothing', async () => {
  for (const bad of ['ja', 'fr', '', '__proto__', 'constructor']) {
    let dom = await load('settings/index.html', { saved: { 'fhsb-lang': bad }, api: 'zh' });
    assert.equal(lang(dom), 'zh-TW', `saved ${bad} -> region check`);
    dom.window.close();
    dom = await load('settings/index.html', { session: { 'fhsb-autolang': bad }, api: 'en' });
    assert.equal(lang(dom), 'en', `cached ${bad} -> region check`);
    dom.window.close();
  }
  const dom = await load('settings/index.html', { api: 'en' });
  dom.window.setLang('ja');
  dom.window.setLang('__proto__');
  assert.equal(lang(dom), 'en');
  assert.equal(dom.window.localStorage.getItem('fhsb-lang'), null);
  dom.window.close();
});

test('switching EN -> CN -> EN, persistence and langchange event', async () => {
  const dom = await load('settings/index.html', { api: 'en' });
  const w = dom.window;
  let fired = 0;
  w.document.addEventListener('langchange', () => fired++);
  w.setLang('zh');
  assert.equal(lang(dom), 'zh-TW');
  assert.equal(text(dom, 'h1'), '設定');
  assert.equal(text(dom, '#langcode'), 'CN');
  assert.equal(w.localStorage.getItem('fhsb-lang'), 'zh');
  assert.equal(fired, 1);
  w.setLang('en');
  assert.equal(text(dom, 'h1'), 'Settings');
  assert.equal(w.localStorage.getItem('fhsb-lang'), 'en');
  w.close();
});

test('placeholders, {label} variables and attributes are translated', async () => {
  let dom = await load('search/index.html', { saved: { 'fhsb-lang': 'zh' } });
  assert.equal(dom.window.document.querySelector('#q').getAttribute('placeholder'), '搜尋…');
  dom.window.close();

  dom = await load('settings/index.html');
  assert.equal(dom.window.t('req.file', { label: 'Score A' }), 'File: Score A');
  dom.window.setLang('zh');
  assert.equal(dom.window.t('req.file', { label: 'Score A' }), '檔案：Score A');
  assert.equal(dom.window.t('req.file'), '檔案：{label}'); // unfilled stays visible
  assert.equal(dom.window.t('no.such.key'), 'no.such.key');
  assert.equal(dom.window.document.querySelector('#rail').getAttribute('aria-label'), '主選單');
  dom.window.close();
});

test('page title is translated and keeps its suffix', async () => {
  const dom = await load('about/index.html', { saved: { 'fhsb-lang': 'zh' } });
  assert.equal(dom.window.document.title, '關於我們 · FHSB');
  dom.window.close();
});

test('every key used in the built HTML and in client scripts exists in the dictionary with en + zh', async () => {
  const keys = new Set();
  const attr = /data-i18n(?:-html|-placeholder|-title|-label)?="([^"]+)"/g;
  for (const f of walk(DIST, '.html')) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(attr)) keys.add(m[1]);
  }
  // keys referenced from client-side code and templates
  const call = /\b(?:w\.|window\.)?t\(\s*'([\w.]+)'/g;
  const literal = /'((?:req|status|type|nav|theme|help|search|settings|contact|about|history|concerts|music|documents|entry|tags|notfound|menu|lang|loader|site)\.[\w.]+)'/g;
  for (const f of [...walk(SRC, '.astro'), ...walk(SRC, '.ts')]) {
    if (f.endsWith('dict.ts')) continue;
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(call)) keys.add(m[1]);
    for (const m of s.matchAll(literal)) keys.add(m[1]);
  }
  assert.ok(keys.size > 40, `only found ${keys.size} keys`);
  const missing = [...keys].filter((k) => !(k in DICT) && !k.startsWith('type.${'));
  assert.deepEqual(missing, []);
  for (const [k, v] of Object.entries(DICT)) {
    assert.ok(v.en && v.en.trim(), `${k}: en empty`);
    assert.ok(v.zh && v.zh.trim(), `${k}: zh empty`);
  }
  for (const t of ['project', 'writing', 'note', 'media', 'document']) assert.ok(`type.${t}` in DICT);
});

test('Chinese strings contain no Simplified-only characters', async () => {
  const simplified = '这们个为从东书买卖产亲会传优体国图过还进选发动问间关门队乐团专业区务录处网页档项请载览简语说读记让认应该么时现见觉观态义联设计热爱欢页献单显线统节选编维护环块组织权证资课负责师样观点';
  const bad = [];
  for (const [k, v] of Object.entries(DICT)) {
    for (const ch of v.zh) if (simplified.includes(ch)) bad.push(`${k}: ${ch}`);
  }
  assert.deepEqual(bad, []);
});

