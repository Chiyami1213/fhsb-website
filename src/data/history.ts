// Band history: important performances and milestones, by calendar year (西元).
// The text is content: it stays as written in every language.
// Sources: the milestone list supplied by the band, plus the event posts of the band's blog (fhcb101.blogspot.com),
// using the date of the EVENT (not of the post) and the post's title as the event name.
// To add more: add an item to the right year (or a new year). Years with no items show a placeholder.
export interface Milestone {
  /** MM/DD within its year (the year is the heading), e.g. "10/27"; "12/--" when the day is not known */
  date: string;
  text: string;
}
export interface Year {
  year: number;
  items: Milestone[];
}

export const FIRST_YEAR = 2011;
export const LAST_YEAR = 2026;

export const HISTORY: Year[] = [
  {
    year: 2012,
    items: [
      { date: '12/--', text: '首度演出於復興歲末音樂會' },
    ],
  },
  {
    year: 2013,
    items: [
      { date: '01/21', text: '2013復興中小學管樂團寒訓成果發表會' },
      { date: '03/02', text: '總統府假日音樂會/總統府大禮堂' },
      { date: '04/--', text: '成立復興管樂團家長後援會' },
      { date: '06/03', text: '"包高中"典禮演出（中學管樂團）' },
      { date: '08/24', text: '2013復興中小學管樂團暑訓成果發表會' },
      { date: '09/--', text: '小學團內成立儲備團' },
      { date: '10/27', text: '首度公演「夢想起飛」音樂會/誠品表演廳' },
      { date: '11/15', text: '小學團小學週會演出' },
      { date: '12/30', text: '2013歲末音樂會' },
    ],
  },
  {
    year: 2014,
    items: [
      { date: '02/09', text: '102學年度寒訓成果發表會' },
      { date: '05/22', text: '台北市教育局「大手牽小手」系列音樂會/Y17' },
      { date: '05/25', text: '復興管樂團團遊' },
      { date: '06/06', text: '回顧與展望週會演出' },
      { date: '06/19', text: '復興畢業音樂會' },
      { date: '09/30', text: '外賓參訪演出' },
      { date: '10/25', text: '首度戶外演出於台北市復華公園「咖啡生態體驗展」' },
      { date: '10/26', text: '年度公演「樂音飛揚」音樂會/中油大樓國光廳' },
      { date: '12/19', text: '小學團小學週會演出' },
      { date: '12/30', text: '2014歲末感恩音樂會' },
    ],
  },
  {
    year: 2015,
    items: [
      { date: '01/01', text: '新北市「歡樂耶誕城」元旦戶外音樂會/新北市市民廣場' },
      { date: '03/25', text: '復興七十周年校慶音樂會/國父紀念館大會堂' },
      { date: '05/26', text: '台北市教育局「大手牽小手」系列音樂會/Y17' },
      { date: '05/30', text: '103學年度第二學期 管樂團成果發表會' },
      { date: '06/06', text: '恐龍秀' },
      { date: '10/21', text: '中學團首次參加台北市音樂比賽榮獲管樂合奏南區特優第二名' },
      { date: '10/24', text: '台北市「咖啡生態體驗展」/復華公園' },
      { date: '11/14', text: '日月潭花火節「明潭花火・復興樂音」音樂會/伊達邵碼頭' },
      { date: '12/26', text: '104學年度第一學期成果發表會' },
    ],
  },
  {
    year: 2016,
    items: [
      { date: '01/08', text: '小學團週會演出' },
      { date: '02/01', text: '基隆拜會活動' },
      { date: '03/25', text: '七十一週年校慶音樂會' },
      { date: '05/28', text: '2016期末聚餐暨表揚大會' },
      { date: '06/05', text: '2016年度公演～樂音飛揚' },
      { date: '07/06', text: '2016日本九州音樂交流之旅' },
      { date: '10/25', text: '台北市105學年度學生音樂比賽' },
      { date: '12/10', text: '2016台北市花博農民市集音樂會' },
      { date: '12/30', text: '2016感恩音樂會' },
    ],
  },
  {
    year: 2017,
    items: [
      { date: '02/19', text: '基隆成果發表' },
      { date: '03/08', text: '106學年度全國學生音樂比賽' },
      { date: '04/28', text: '小學團週會演出' },
      { date: '05/08', text: '母親節慶祝大會' },
      { date: '05/28', text: '2017年度公演～樂音飛揚' },
      { date: '08/19', text: '2017台南管樂藝術季' },
      { date: '09/22', text: '小學團週會演出' },
      { date: '10/18', text: '台北市106學年度學生音樂比賽' },
      { date: '12/27', text: '2017感恩音樂會' },
    ],
  },
  {
    year: 2018,
    items: [
      { date: '03/09', text: '106學年度學生音樂比賽' },
      { date: '04/27', text: '小學團週會表演' },
      { date: '04/29', text: '2018年度公演～樂遊世界' },
      { date: '06/09', text: '2018管樂團團遊暨期末聚' },
      { date: '06/27', text: '2018南京后標營小學交流' },
      { date: '09/28', text: '小學團週會表演' },
      { date: '10/23', text: '台北市107學年度學生音樂比賽' },
      { date: '11/10', text: '107年市賽特優第一頒獎慶功' },
      { date: '12/23', text: '新北市歡樂耶誕城 愛戀耶誕村' },
      { date: '12/25', text: '小學教學成果發表會' },
    ],
  },
  {
    year: 2019,
    items: [
      { date: '03/10', text: '107學年度全國學生音樂比賽' },
      { date: '03/29', text: '107學年度校慶音樂會' },
      { date: '04/14', text: '管韻飛耀弦音揚音樂會' },
      { date: '05/25', text: '2019年度公演～管樂復興' },
      { date: '09/27', text: '小學團週會表演' },
      { date: '10/16', text: '台北市108學年度學生音樂比賽' },
      { date: '12/14', text: '儲備團成果發表會' },
      { date: '12/21', text: '嘉義國際管樂節（中學團）' },
      { date: '12/25', text: '英語成果發表會（小學團）' },
      { date: '12/27', text: '市賽頒獎' },
    ],
  },
];
