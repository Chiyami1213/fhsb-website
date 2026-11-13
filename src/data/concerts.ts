// 演出典藏 (performance archive): one line per performance, taken from the band's performance folders.
// date: the day it took place as YYYY-MM-DD; end: last day for a multi-day event (same year).
// name: as written in the folder name. Names are content: they stay as written in every language.
// To add one: add a line (any order; the page sorts by date).
export interface Performance {
  date: string;
  end?: string;
  name: string;
}

export const PERFORMANCES: Performance[] = [
  { date: '2015-05-26', name: 'Y17 大手牽小手公演' },
  { date: '2015-10-21', name: '北市音樂比賽 特優第2名' },
  { date: '2015-11-14', name: '日月潭花火節' },
  { date: '2015-12-26', name: '期末管樂發表會' },
  { date: '2016-03-25', name: '71校慶音樂會' },
  { date: '2016-06-05', name: '國光廳公演' },
  { date: '2016-07-06', end: '2016-07-12', name: '九州音樂交流' },
  { date: '2016-10-25', name: '北市音樂比賽 特優第1名' },
  { date: '2016-12-30', name: '歲末音樂會' },
  { date: '2017-02-19', name: '基隆藝文中心彩排' },
  { date: '2017-03-08', name: '全國賽基隆藝文中心' }, // the folder name continues "指定曲 Golde…" (cut off in the source list)
  { date: '2017-05-28', name: '公演' },
  { date: '2017-07-03', end: '2017-07-09', name: '大阪神戶音樂交流' },
  { date: '2017-10-18', name: '北市音樂比賽 特優第1名' },
  { date: '2017-10-28', name: '同樂會' },
  { date: '2017-12-27', name: '歲末音樂會' },
  { date: '2018-03-13', name: '新竹演藝廳全國賽' },
  { date: '2018-04-29', name: '公演新北市政府集會堂' },
  { date: '2018-06-09', name: '老頭擺' },
  { date: '2018-10-23', name: '中學團北市音樂比賽 特優第1名' },
  { date: '2018-10-24', name: '小學團北市音樂比賽 特優第1名' },
  { date: '2018-12-23', name: '新北市府歡樂耶誕城' },
  { date: '2019-03-10', name: '宜蘭運動公園全國賽 特優第一' },
  { date: '2019-03-29', name: '復興74校慶音樂會' },
  { date: '2019-05-25', name: '國光廳公演' },
  { date: '2019-07-07', end: '2019-07-16', name: '中歐管樂節' },
  { date: '2019-10-16', name: '北市音樂比賽 小學團 特優第2名' },
  { date: '2019-10-17', name: '北市音樂比賽 中學團 特優第2名' },
  { date: '2019-12-22', name: '28屆國際嘉義管樂節' },
  { date: '2020-10-14', name: '北市音樂比賽 小學團' },
  { date: '2020-10-16', name: '北市音樂比賽 中學團' },
  { date: '2021-11-19', name: '北市音樂比賽 中學團' },
  { date: '2026-05-24', name: '國光廳公演' },
];
