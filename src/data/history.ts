// Band history: important performances and milestones, by school year (學年度) of the Republic of China (民國) calendar.
// Years are ROC years, NOT Gregorian (民國100 = 2011). The text is content: it stays as written in every language.
// To add more: add an item to the right year (or a new year). Years with no items show a placeholder on the History page.
export interface Milestone {
  /** as written, e.g. "101年12月" */
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
      { date: '102年03月', text: '總統府假日音樂會/總統府大禮堂' },
      { date: '102年04月', text: '成立復興管樂團家長後援會' },
    ],
  },
  {
    year: 102,
    items: [
      { date: '102年09月', text: '小學團內成立儲備團' },
      { date: '102年10月', text: '首度公演「夢想起飛」音樂會/誠品表演廳' },
      { date: '103年05月', text: '台北市教育局「大手牽小手」系列音樂會/Y17' },
      { date: '103年06月', text: '復興畢業音樂會' },
    ],
  },
  {
    year: 103,
    items: [
      { date: '103年10月', text: '首度戶外演出於台北市復華公園「咖啡生態體驗展」' },
      { date: '103年10月', text: '年度公演「樂音飛揚」音樂會/中油大樓國光廳' },
      { date: '104年01月', text: '新北市「歡樂耶誕城」元旦戶外音樂會/新北市市民廣場' },
      { date: '104年03月', text: '復興七十周年校慶音樂會/國父紀念館大會堂' },
      { date: '104年05月', text: '台北市教育局「大手牽小手」系列音樂會/Y17' },
    ],
  },
  {
    year: 104,
    items: [
      { date: '104年10月', text: '中學團首次參加台北市音樂比賽榮獲管樂合奏南區特優第二名' },
      { date: '104年10月', text: '台北市「咖啡生態體驗展」/復華公園' },
      { date: '104年11月', text: '日月潭花火節「明潭花火・復興樂音」音樂會/伊達邵碼頭' },
    ],
  },
];
