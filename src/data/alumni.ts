// Alumni (歷屆校友). One record per person:
//   name        as written
//   instruments one or more (ids from INSTRUMENTS in src/data/members.ts); the person is listed under each of them
//   cohort      第幾屆, as a number (3 = 第3屆)
//
// Example (replace with real people):
//   { name: '王小明', instruments: ['flute'], cohort: 3 },
//   { name: '李小華', instruments: ['clarinet', 'bass-clarinet'], cohort: 5 },
import type { Instrument } from './members';

export interface Alumnus {
  name: string;
  instruments: Instrument[];
  cohort: number;
}

export const ALUMNI: Alumnus[] = [];
