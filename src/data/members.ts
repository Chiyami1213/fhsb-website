// Members page: the three bands, each by instrument.
// Names are content: they are shown as written in every language.
//
// To add a member: put the name in the right band and instrument, e.g.
//   members: { flute: ['王小明', '李小華'], trumpet: ['陳大文'] }
// Instrument ids and their EN / 中文 labels are in src/i18n/dict.ts (keys inst.<id>).
// To add or remove an instrument, edit INSTRUMENTS below (and add its label to the dictionary).

/** shown in this order on the page (woodwinds, brass, double bass, percussion). Icons: public/images/instruments/<id>.png */
export const INSTRUMENTS = [
  'piccolo',
  'flute',
  'oboe',
  'bassoon',
  'eb-clarinet',
  'clarinet',
  'bass-clarinet',
  'soprano-saxophone',
  'alto-saxophone',
  'tenor-saxophone',
  'baritone-saxophone',
  'trumpet',
  'horn',
  'trombone',
  'euphonium',
  'tuba',
  'double-bass',
  'percussion',
] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

export interface Band {
  /** anchor id and key suffix: band.<id> in the dictionary */
  id: string;
  members: Partial<Record<Instrument, string[]>>;
}

export const BANDS: Band[] = [
  { id: 'reserve', members: {} }, // 儲備團
  { id: 'elementary', members: {} }, // 小學團
  { id: 'secondary', members: {} }, // 中學團
];
