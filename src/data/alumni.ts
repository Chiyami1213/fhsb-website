// Alumni (歷屆校友). One record per person:
//   name        as written
//   instruments one or more (ids from INSTRUMENTS in src/data/members.ts); the person is listed under each of them
//   cohort      第幾屆 as a number (3 = 第3屆); leave it out when it is not known yet
//
// Easiest way to fill this in: export the band's spreadsheet (姓名 / 樂器 / 管樂團屆數) as CSV (UTF-8) and run
//   node design/tools/import_alumni.mjs path/to/alumni.csv
// which rewrites the list below. Or add people by hand:
//   { name: '王小明', instruments: ['flute'], cohort: 3 },
//   { name: '李小華', instruments: ['clarinet', 'bass-clarinet'] },
import type { Instrument } from './members';

export interface Alumnus {
  name: string;
  instruments: Instrument[];
  cohort?: number;
}

/**
 * Reference only, NOT shown on the site: which graduation years a cohort (屆) corresponds to
 * (cohort N: junior high 2013+N, senior high 2016+N). Add a row when a new cohort graduates.
 */
export interface CohortYears {
  cohort: number;
  /** 國中畢業 (西元) */
  junior: number;
  /** 高中畢業 (西元) */
  senior: number;
}
export const COHORTS: CohortYears[] = [
  { cohort: 1, junior: 2014, senior: 2017 },
  { cohort: 2, junior: 2015, senior: 2018 },
  { cohort: 3, junior: 2016, senior: 2019 },
  { cohort: 4, junior: 2017, senior: 2020 },
  { cohort: 5, junior: 2018, senior: 2021 },
  { cohort: 6, junior: 2019, senior: 2022 },
  { cohort: 7, junior: 2020, senior: 2023 },
  { cohort: 8, junior: 2021, senior: 2024 },
  { cohort: 9, junior: 2022, senior: 2025 },
];

export const ALUMNI: Alumnus[] = [];
