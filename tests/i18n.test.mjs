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

async function load(page, saved = {}) {
  const html = fs.readFileSync(path.join(DIST, page), 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'https://example.test/' + page.replace('index.html', ''),
    beforeParse(w) {
      for (const [k, v] of Object.entries(saved)) w.localStorage.setItem(k, v);
    },
  });
  if (dom.window.document.readyState !== 'complete') await new Promise((r) => dom.window.addEventListener('load', r));
  return dom;
}
const text = (dom, sel) => dom.window.document.querySelector(sel).textContent;

test('English is the default (no browser-language guessing)', async () => {
  const dom = await load('settings/index.html');
  assert.equal(dom.window.document.documentElement.lang, 'en');
  assert.equal(text(dom, 'h1'), 'Settings');
  assert.equal(text(dom, '#langcode'), 'EN');
  dom.window.close();
});

test('switching EN -> CN -> EN, persistence and langchange event', async () => {
  const dom = await load('settings/index.html');
  const w = dom.window;
  let fired = 0;
  w.document.addEventListener('langchange', () => fired++);
  w.setLang('zh');
  assert.equal(w.document.documentElement.lang, 'zh-TW');
  assert.equal(text(dom, 'h1'), '設定');
  assert.equal(text(dom, '#langcode'), 'CN');
  assert.equal(w.localStorage.getItem('fhsb-lang'), 'zh');
  assert.equal(fired, 1);
  w.setLang('en');
  assert.equal(text(dom, 'h1'), 'Settings');
  assert.equal(w.localStorage.getItem('fhsb-lang'), 'en');
  w.close();
});

test('saved language is applied on load; unknown saved/selected values fall back to English', async () => {
  let dom = await load('settings/index.html', { 'fhsb-lang': 'zh' });
  assert.equal(dom.window.document.documentElement.lang, 'zh-TW');
  assert.equal(text(dom, 'h1'), '設定');
  dom.window.close();

  for (const bad of ['ja', 'fr', '', '__proto__', 'constructor']) {
    dom = await load('settings/index.html', { 'fhsb-lang': bad });
    assert.equal(dom.window.document.documentElement.lang, 'en', `saved ${bad}`);
    assert.equal(text(dom, 'h1'), 'Settings');
    dom.window.close();
  }
  dom = await load('settings/index.html');
  dom.window.setLang('ja');
  dom.window.setLang('__proto__');
  assert.equal(dom.window.document.documentElement.lang, 'en');
  assert.equal(dom.window.localStorage.getItem('fhsb-lang'), null);
  dom.window.close();
});

test('placeholders, {label} variables and attributes are translated', async () => {
  let dom = await load('archive/index.html', { 'fhsb-lang': 'zh' });
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
  const dom = await load('about/index.html', { 'fhsb-lang': 'zh' });
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
  const literal = /'((?:req|status|type|nav|theme|help|archive|settings|contact|about|history|concerts|music|documents|entry|tags|notfound|menu|lang|loader|site)\.[\w.]+)'/g;
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

