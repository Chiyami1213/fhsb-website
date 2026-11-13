// Imports the alumni spreadsheet (exported as CSV, UTF-8) into src/data/alumni.ts.
//
// usage: node design/tools/import_alumni.mjs <alumni.csv> [--out src/data/alumni.ts]
//
// Expected columns (header names are matched, order does not matter): 姓名 | 樂器 | 管樂團屆數
//   樂器 may list several instruments: "長笛, 短笛"  (commas of any kind are fine)
//   屆數 may be blank (the person is then listed after the numbered cohorts)
// Rows that list the same person (same name AND same cohort) several times are merged into one record.
// Anything the script cannot map to a known instrument is listed at the end and the exit code is 1.
import fs from 'node:fs';

const args = process.argv.slice(2);
const file = args[0];
if (!file) {
  console.error('usage: node design/tools/import_alumni.mjs <alumni.csv> [--out src/data/alumni.ts]');
  process.exit(2);
}
const outPath = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'src/data/alumni.ts';

// instrument names as the band writes them -> ids used by the site (see src/data/members.ts)
const MAP = {
  長笛: 'flute',
  短笛: 'piccolo',
  雙簧管: 'oboe',
  低音管: 'bassoon',
  巴松管: 'bassoon',
  巴頌管: 'bassoon',
  豎笛: 'clarinet',
  單簧管: 'clarinet',
  降E調豎笛: 'eb-clarinet',
  降E調單簧管: 'eb-clarinet',
  小豎笛: 'eb-clarinet',
  低音豎笛: 'bass-clarinet',
  低音單簧管: 'bass-clarinet',
  高音薩克斯風: 'soprano-saxophone',
  高音薩: 'soprano-saxophone',
  中音薩克斯風: 'alto-saxophone',
  中音薩: 'alto-saxophone',
  次中音薩克斯風: 'tenor-saxophone',
  次中音薩: 'tenor-saxophone',
  上低音薩克斯風: 'baritone-saxophone',
  上低音薩: 'baritone-saxophone',
  小號: 'trumpet',
  法國號: 'horn',
  長號: 'trombone',
  上低音號: 'euphonium',
  低音號: 'tuba',
  低音提琴: 'double-bass',
  低音大提琴: 'double-bass',
  打擊: 'percussion',
  打擊樂: 'percussion',
};
const norm = (s) => s.replace(/[（(][^）)]*[）)]/g, '').replace(/\s+/g, '').replace(/[♭b]/g, '').replace(/Eb/i, 'E');

// ---- CSV (quotes, commas inside quotes, BOM) ----
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim() !== ''));
}

const raw = fs.readFileSync(file);
let text;
let encoding = 'UTF-8';
try {
  text = new TextDecoder('utf-8', { fatal: true }).decode(raw);
} catch {
  text = new TextDecoder('big5').decode(raw); // Excel's plain "CSV" on a Traditional Chinese PC
  encoding = 'Big5 (old Excel CSV: characters it cannot store were already replaced by "?" in the file)';
}
const rows = parseCsv(text);
const hasHeader = rows[0].some((c) => /姓名|樂器|屆|name|instrument|cohort/i.test(c));
const header = hasHeader ? rows[0].map((h) => h.trim()) : [];
const dataRows = hasHeader ? rows.slice(1) : rows;
const col = (re, fallback) => {
  const i = header.findIndex((h) => re.test(h));
  return i >= 0 ? i : fallback;
};
const cName = col(/姓名|name/i, 0);
const cInst = col(/樂器|instrument/i, 1);
const cCohort = col(/屆|cohort/i, 2);

const problems = [];
const damaged = []; // names containing "?" (a character the file format could not store)
const unmapped = new Map(); // instrument text -> example names
const people = []; // { name, instruments:Set, cohort }
let blankCohort = 0;
let skipped = 0;

for (const r of dataRows) {
  const name = (r[cName] || '').trim();
  const instText = r[cInst] || '';
  const cohortText = (r[cCohort] || '').trim();
  if (!name) {
    skipped++;
    continue;
  }
  if (name.includes('?') && !args.includes('--keep-unknown')) {
    damaged.push(`${name}  (${instText.trim()}, 屆${cohortText || '-'})`);
    continue;
  }
  const ids = [];
  for (const part of instText.split(/[,，、;；/]/)) {
    const t = norm(part);
    if (!t) continue;
    const id = MAP[t];
    if (id) ids.push(id);
    else {
      if (!unmapped.has(part.trim())) unmapped.set(part.trim(), []);
      unmapped.get(part.trim()).push(name);
    }
  }
  const cohort = /^\d+$/.test(cohortText) ? Number(cohortText) : undefined;
  if (cohortText && cohort === undefined) problems.push(`cohort is not a number for ${name}: "${cohortText}"`);
  if (cohort === undefined) blankCohort++;
  if (ids.length === 0) {
    problems.push(`no usable instrument for ${name} ("${instText.trim()}")`);
    continue;
  }
  // same person listed on several rows (same name AND cohort): merge their instruments
  const same = cohort === undefined ? null : people.find((p) => p.name === name && p.cohort === cohort);
  if (same) ids.forEach((i) => same.instruments.add(i));
  else people.push({ name, instruments: new Set(ids), cohort });
}

// Same name on several rows: if exactly one row has a cohort and the others have none, it is the same person
// playing several instruments (the cohort is usually only filled in on one row): merge them and say so.
const merged = [];
for (const name of new Set(people.map((p) => p.name))) {
  const group = people.filter((p) => p.name === name);
  if (group.length < 2) continue;
  const withCohort = group.filter((p) => p.cohort !== undefined);
  const without = group.filter((p) => p.cohort === undefined);
  if (withCohort.length === 1 && without.length >= 1) {
    for (const o of without) {
      o.instruments.forEach((i) => withCohort[0].instruments.add(i));
      people.splice(people.indexOf(o), 1);
    }
    merged.push(name);
  }
}

const q = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const lines = people.map((p) => {
  const inst = [...p.instruments].map(q).join(', ');
  return `  { name: ${q(p.name)}, instruments: [${inst}]${p.cohort !== undefined ? `, cohort: ${p.cohort}` : ''} },`;
});

// keep everything above the list (model, cohort table) and replace only the ALUMNI array
const existing = fs.readFileSync(outPath, 'utf8');
// the whole list: an empty "[];" or everything up to the closing "];" on its own line, plus the stamp comment above it
const m = existing.match(/(?:\/\/ \d+ people, imported[^\n]*\n)?export const ALUMNI: Alumnus\[\] = \[(?:\];|[\s\S]*?\n\];)/);
if (!m) {
  console.error('could not find "export const ALUMNI: Alumnus[] = [ ... ];" in ' + outPath);
  process.exit(2);
}
const stamp = `// ${people.length} people, imported from the spreadsheet by design/tools/import_alumni.mjs. Re-run it to refresh; or edit by hand.`;
const next = existing.replace(m[0], `${stamp}\nexport const ALUMNI: Alumnus[] = [\n${lines.join('\n')}\n];`);
fs.writeFileSync(outPath, next, 'utf8');

const dupNames = [...people.reduce((m2, p) => m2.set(p.name, (m2.get(p.name) || 0) + 1), new Map())].filter(([, n]) => n > 1);
console.log(`encoding: ${encoding}`);
console.log(`rows read: ${dataRows.length}   people written: ${people.length}   skipped (no name): ${skipped}`);
console.log(`without a cohort (屆數 blank): ${blankCohort}`);
if (merged.length) console.log('merged (same name, one row had a cohort and the other did not: treated as one person with several instruments): ' + merged.join('、'));
if (dupNames.length) console.log('same name on several records (check these are different people): ' + dupNames.map(([n, c]) => `${n}×${c}`).join(', '));
if (damaged.length) {
  console.log(`\nNOT IMPORTED, name damaged by the file format (a character became "?"): ${damaged.length}`);
  damaged.forEach((d) => console.log('  ' + d));
  console.log('  -> save the sheet as "CSV UTF-8" and run the import again to get them with the right characters.');
}
if (unmapped.size) {
  console.log('\nINSTRUMENTS I DO NOT KNOW (add them to MAP in this script, or tell me which instrument they are):');
  for (const [t, who] of unmapped) console.log(`  "${t}"  <- ${who.length} row(s), e.g. ${who.slice(0, 3).join('、')}`);
}
if (problems.length) {
  console.log('\nPROBLEMS:');
  problems.forEach((p) => console.log('  ' + p));
}
process.exit(unmapped.size || problems.length || damaged.length ? 1 : 0);
