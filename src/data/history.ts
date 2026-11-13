// Band history: important performances and milestones, by school year (學年度) of the Republic of China (民國) calendar.
// Years are ROC years, NOT Gregorian (民國100 = 2011). The text is content: it stays as written in every language.
// Sources: the milestone list supplied by the band, plus the event posts of the band's blog (fhcb101.blogspot.com),
// using the date of the EVENT (not of the post) and the post's title as the event name.
// To add more: add an item to the right school year (or a new year). Years with no items show a placeholder.
export interface Milestone {
  /** as written, e.g. "101年12月" or "102年10月27日" (ROC year) */
  date: string;
  text: string;
}
export interface SchoolYear {
  year: number;
  items: Milestone[];
}

export const FIRST_YEAR = 100; // 民國100 = 2011
export const LAST_YEAR = 115; // 民國115 = 2026

export const HISTORY: SchoolYear[] = [
  {
    year: 101,
    items: [
      { date: '101年12月', text: '首度演出於復興歲末音樂會' },
      { date: '102年01月21日', text: '2013復興中小學管樂團寒訓成果發表會' },
      { date: '102年03月02日', text: '總統府假日音樂會/總統府大禮堂' },
      { date: '102年04月', text: '成立復興管樂團家長後援會' },
      { date: '102年06月03日', text: '"包高中"典禮演出（中學管樂團）' },
    ],
  },
  {
    year: 102,
    items: [
      { date: '102年08月24日', text: '2013復興中小學管樂團暑訓成果發表會' },
      { date: '102年09月', text: '小學團內成立儲備團' },
      { date: '102年10月27日', text: '首度公演「夢想起飛」音樂會/誠品表演廳' },
      { date: '102年11月15日', text: '小學團小學週會演出' },
      { date: '102年12月30日', text: '2013歲末音樂會' },
      { date: '103年02月09日', text: '102學年度寒訓成果發表會' },
      { date: '103年05月22日', text: '台北市教育局「大手牽小手」系列音樂會/Y17' },
      { date: '103年05月25日', text: '復興管樂團團遊' },
      { date: '103年06月06日', text: '回顧與展望週會演出' },
      { date: '103年06月19日', text: '復興畢業音樂會' },
    ],
  },
  {
    year: 103,
    items: [
      { date: '103年09月30日', text: '外賓參訪演出' },
      { date: '103年10月25日', text: '首度戶外演出於台北市復華公園「咖啡生態體驗展」' },
      { date: '103年10月26日', text: '年度公演「樂音飛揚」音樂會/中油大樓國光廳' },
      { date: '103年12月19日', text: '小學團小學週會演出' },
      { date: '103年12月30日', text: '2014歲末感恩音樂會' },
      { date: '104年01月01日', text: '新北市「歡樂耶誕城」元旦戶外音樂會/新北市市民廣場' },
      { date: '104年03月25日', text: '復興七十周年校慶音樂會/國父紀念館大會堂' },
      { date: '104年05月26日', text: '台北市教育局「大手牽小手」系列音樂會/Y17' },
      { date: '104年05月30日', text: '103學年度第二學期 管樂團成果發表會' },
      { date: '104年06月06日', text: '恐龍秀' },
    ],
  },
  {
    year: 104,
    items: [
      { date: '104年10月21日', text: '中學團首次參加台北市音樂比賽榮獲管樂合奏南區特優第二名' },
      { date: '104年10月24日', text: '台北市「咖啡生態體驗展」/復華公園' },
      { date: '104年11月14日', text: '日月潭花火節「明潭花火・復興樂音」音樂會/伊達邵碼頭' },
      { date: '104年12月26日', text: '104學年度第一學期成果發表會' },
      { date: '105年01月08日', text: '小學團週會演出' },
      { date: '105年02月01日', text: '基隆拜會活動' },
      { date: '105年03月25日', text: '七十一週年校慶音樂會' },
      { date: '105年05月28日', text: '2016期末聚餐暨表揚大會' },
      { date: '105年06月05日', text: '2016年度公演～樂音飛揚' },
      { date: '105年07月06日', text: '2016日本九州音樂交流之旅' },
    ],
  },
  {
    year: 105,
    items: [
      { date: '105年10月25日', text: '台北市105學年度學生音樂比賽' },
      { date: '105年12月10日', text: '2016台北市花博農民市集音樂會' },
      { date: '105年12月30日', text: '2016感恩音樂會' },
      { date: '106年02月19日', text: '基隆成果發表' },
      { date: '106年03月08日', text: '106學年度全國學生音樂比賽' },
      { date: '106年04月28日', text: '小學團週會演出' },
      { date: '106年05月08日', text: '母親節慶祝大會' },
      { date: '106年05月28日', text: '2017年度公演～樂音飛揚' },
    ],
  },
  {
    year: 106,
    items: [
      { date: '106年08月19日', text: '2017台南管樂藝術季' },
      { date: '106年09月22日', text: '小學團週會演出' },
      { date: '106年10月18日', text: '台北市106學年度學生音樂比賽' },
      { date: '106年12月27日', text: '2017感恩音樂會' },
      { date: '107年03月09日', text: '106學年度學生音樂比賽' },
      { date: '107年04月27日', text: '小學團週會表演' },
      { date: '107年04月29日', text: '2018年度公演～樂遊世界' },
      { date: '107年06月09日', text: '2018管樂團團遊暨期末聚' },
      { date: '107年06月27日', text: '2018南京后標營小學交流' },
    ],
  },
  {
    year: 107,
    items: [
      { date: '107年09月28日', text: '小學團週會表演' },
      { date: '107年10月23日', text: '台北市107學年度學生音樂比賽' },
      { date: '107年11月10日', text: '107年市賽特優第一頒獎慶功' },
      { date: '107年12月23日', text: '新北市歡樂耶誕城 愛戀耶誕村' },
      { date: '107年12月25日', text: '小學教學成果發表會' },
      { date: '108年03月10日', text: '107學年度全國學生音樂比賽' },
      { date: '108年03月29日', text: '107學年度校慶音樂會' },
      { date: '108年04月14日', text: '管韻飛耀弦音揚音樂會' },
      { date: '108年05月25日', text: '2019年度公演～管樂復興' },
    ],
  },
  {
    year: 108,
    items: [
      { date: '108年09月27日', text: '小學團週會表演' },
      { date: '108年10月16日', text: '台北市108學年度學生音樂比賽' },
      { date: '108年12月14日', text: '儲備團成果發表會' },
      { date: '108年12月21日', text: '嘉義國際管樂節（中學團）' },
      { date: '108年12月25日', text: '英語成果發表會（小學團）' },
      { date: '108年12月27日', text: '市賽頒獎' },
    ],
  },
];
