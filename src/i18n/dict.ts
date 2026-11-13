// UI text only. key -> { en, zh } where zh is Traditional Chinese (Taiwan wording).
// Entry content (src/content/entries) stays as written.
export type Entry = { en: string; zh: string };

export const DICT: Record<string, Entry> = {
  // ---- navigation ----
  'nav.home': { en: 'Home', zh: '首頁' },
  'nav.about': { en: 'About', zh: '關於復興管樂' },
  'nav.history': { en: 'History', zh: '沿革' },
  'nav.members': { en: 'Members', zh: '成員' },
  'nav.instructors': { en: 'Faculty', zh: '師資' },
  'nav.news': { en: 'News', zh: '最新消息' },
  'nav.alumni': { en: 'Alumni', zh: '校友專區' },
  'nav.alumni.past': { en: 'Alumni', zh: '歷屆校友' },
  'nav.concerts': { en: 'Archive', zh: '演出典藏' },
  'nav.music': { en: 'Music', zh: '音樂' },
  'nav.music.repertoire': { en: 'Repertoire', zh: '演出曲目' },
  'nav.music.recordings': { en: 'Recordings', zh: '錄音' },
  'nav.documents': { en: 'Documents', zh: '檔案庫' },
  'nav.contact': { en: 'Contact', zh: '聯絡我們' },
  'nav.settings': { en: 'Settings', zh: '設定' },
  'nav.search': { en: 'Search', zh: '搜尋' },
  'menu.open': { en: 'Open menu', zh: '開啟選單' },
  'menu.aria': { en: 'Main menu', zh: '主選單' },
  'menu.back': { en: 'Main menu', zh: '主選單' },
  'lang.aria': { en: 'Language', zh: '語言' },
  'site.suffix': { en: 'FHSB', zh: 'FHSB' },

  // ---- about ----
  'about.tab': { en: 'Introduction', zh: '簡介' },
  'about.title':{ en: 'About', zh: '關於復興管樂' },
  'about.p1': {
    en: 'Fuhsing Symphonic Band (FHSB). Add a short introduction to the band here.',
    zh: '復興管樂團（FHSB）。請在此加入樂團的簡短介紹。',
  },
  'about.p2': {
    en: 'Tell visitors who you are, what you play, and when you rehearse.',
    zh: '告訴大家樂團的成員、演奏的曲風，以及練習的時間。',
  },
  'about.history': { en: 'Band history', zh: '沿革' },

  // ---- history ----
  'history.title': { en: 'History', zh: '沿革' },
  'history.intro': {
    en: 'Important performances and milestones of the band.',
    zh: '重要演出經歷與大事記。',
  },
  'history.item': { en: 'Add a milestone here.', zh: '請在此加入一則里程碑。' },

  // ---- news ----
  'news.title': { en: 'News', zh: '最新消息' },
  'news.intro': { en: 'Latest news from the band.', zh: '樂團的最新消息。' },
  'news.empty': { en: 'No news yet.', zh: '目前還沒有最新消息。' },

  // ---- members ----
  'members.title': { en: 'Members', zh: '成員' },
  'members.intro': { en: 'The members of the band, by band and instrument.', zh: '樂團成員，依團別與樂器分類。' },
  'members.empty': { en: 'No members listed yet.', zh: '目前尚未列出任何成員。' },

  'band.reserve': { en: 'Preparatory band', zh: '儲備團' },
  'band.elementary': { en: 'Elementary band', zh: '小學團' },
  'band.secondary': { en: 'Secondary band', zh: '中學團' },
  'inst.piccolo': { en: 'Piccolo', zh: '短笛' },
  'inst.flute': { en: 'Flute', zh: '長笛' },
  'inst.oboe': { en: 'Oboe', zh: '雙簧管' },
  'inst.bassoon': { en: 'Bassoon', zh: '低音管' },
  'inst.eb-clarinet': { en: 'E-flat clarinet', zh: '降E調豎笛' },
  'inst.clarinet': { en: 'Clarinet', zh: '豎笛' },
  'inst.bass-clarinet': { en: 'Bass clarinet', zh: '低音豎笛' },
  'inst.soprano-saxophone': { en: 'Soprano saxophone', zh: '高音薩克斯風' },
  'inst.alto-saxophone': { en: 'Alto saxophone', zh: '中音薩克斯風' },
  'inst.tenor-saxophone': { en: 'Tenor saxophone', zh: '次中音薩克斯風' },
  'inst.baritone-saxophone': { en: 'Baritone saxophone', zh: '上低音薩克斯風' },
  'inst.trumpet': { en: 'Trumpet', zh: '小號' },
  'inst.horn': { en: 'French horn', zh: '法國號' },
  'inst.trombone': { en: 'Trombone', zh: '長號' },
  'inst.euphonium': { en: 'Euphonium', zh: '上低音號' },
  'inst.tuba': { en: 'Tuba', zh: '低音號' },
  'inst.double-bass': { en: 'Double bass', zh: '低音提琴' },
  'inst.percussion': { en: 'Percussion', zh: '打擊' },

  // ---- instructors ----
  'instructors.title': { en: 'Faculty', zh: '師資' },
  'instructors.intro': { en: 'The band’s faculty.', zh: '樂團的師資陣容。' },
  'instructors.empty': { en: 'No faculty listed yet.', zh: '目前尚未列出任何師資。' },

  // ---- alumni ----
  'alumni.title': { en: 'Alumni', zh: '校友專區' },
  'alumni.intro': { en: 'Information for alumni.', zh: '提供校友的相關資訊。' },
  'alumni.empty': { en: 'Nothing here yet.', zh: '這裡目前還沒有內容。' },
  'alumni.past.title': { en: 'Alumni', zh: '歷屆校友' },
  'alumni.past.intro': { en: 'Alumni of the band, by instrument. Each name shows the cohort (第幾屆).', zh: '歷屆校友，依樂器分類，姓名後方標示第幾屆。' },
  'cohort.title': { en: 'Cohorts and graduation years', zh: '屆數對照' },
  'cohort.num': { en: 'Cohort', zh: '管樂團屆數' },
  'cohort.junior': { en: 'Junior high graduation', zh: '國中畢業' },
  'cohort.senior': { en: 'Senior high graduation', zh: '高中畢業' },
  'alumni.past.empty': { en: 'No alumni listed yet.', zh: '目前尚未列出任何校友。' },

  // ---- concerts ----
  'concerts.title': { en: 'Archive', zh: '演出典藏' },
  'concerts.intro': {
    en: 'Concerts and performances by the band.',
    zh: '樂團的演出典藏。',
  },
  'concerts.empty': { en: 'No concerts listed yet.', zh: '目前尚未列出任何演出典藏。' },

  // ---- music ----
  'music.title': { en: 'Music', zh: '音樂' },
  'music.intro': {
    en: 'Pieces we play and recordings of our performances.',
    zh: '我們演奏的曲目與演出錄音。',
  },
  'music.tab.all': { en: 'All', zh: '全部' },
  'music.empty': { en: 'Nothing here yet.', zh: '這裡目前還沒有內容。' },

  // ---- documents ----
  'documents.title': { en: 'Documents', zh: '檔案庫' },
  'documents.intro': {
    en: 'Scores, forms and other files. Some files need approval before you can download them.',
    zh: '樂譜、表單與其他檔案。部分檔案需經核准後才能下載。',
  },
  'documents.empty': { en: 'No documents yet.', zh: '目前還沒有檔案。' },

  // ---- contact ----
  'contact.title': { en: 'Contact', zh: '聯絡我們' },
  'contact.intro': { en: 'Find the band here:', zh: '你可以在這裡找到我們：' },
  'contact.empty': {
    en: 'Contact links will be added soon.',
    zh: '聯絡方式即將公布。',
  },
  'contact.instagram': { en: 'Instagram', zh: 'Instagram' },
  'contact.facebook': { en: 'Facebook', zh: 'Facebook' },
  'contact.youtube': { en: 'YouTube', zh: 'YouTube' },
  'contact.website': { en: 'Website', zh: '網站' },

  // ---- settings ----
  'settings.title': { en: 'Settings', zh: '設定' },
  'settings.theme': { en: 'Appearance', zh: '外觀' },
  'theme.light': { en: 'Light', zh: '淺色' },
  'theme.dark': { en: 'Dark', zh: '深色' },
  'theme.system': { en: 'Use device settings', zh: '使用裝置設定' },
  'help.title': { en: 'Using this site', zh: '網站使用說明' },
  'help.menu': {
    en: 'On a computer, hover over the dark bar on the left to open the menu. On a phone, tap the menu button at the top left.',
    zh: '使用電腦時，將滑鼠移到左側深色列即可展開選單；使用手機時，請點選左上角的選單按鈕。',
  },
  'help.lang': {
    en: 'Use the globe button at the top right to switch between English and 中文.',
    zh: '點選右上角的地球按鈕，即可在 English 與中文之間切換。',
  },
  'help.search': {
    en: 'Use the Search page to look through everything on the site.',
    zh: '可使用「搜尋」頁面查找本站的所有內容。',
  },
  'help.locked': {
    en: 'Files marked “approval required” are not public. Press “Request access”; you will get a private status page to check back on.',
    zh: '標示為「需核准」的檔案並未公開。請按「申請存取」，系統會提供一個私人的狀態頁面，供你稍後回來查看。',
  },

  // ---- search page ----
  'search.title': { en: 'Search', zh: '搜尋' },
  'search.intro': { en: 'Search everything on the site.', zh: '搜尋本站的所有內容。' },
  'search.placeholder': { en: 'Search…', zh: '搜尋…' },
  'search.all': { en: 'All', zh: '全部' },
  'search.empty': { en: 'No matching entries.', zh: '沒有符合的項目。' },
  'type.project': { en: 'Project', zh: '專案' },
  'type.writing': { en: 'Writing', zh: '文章' },
  'type.note': { en: 'Note', zh: '筆記' },
  'type.media': { en: 'Media', zh: '媒體' },
  'type.document': { en: 'Document', zh: '文件' },
  'tags.title': { en: 'Tag', zh: '標籤' },
  'tags.empty': { en: 'No entries with this tag.', zh: '沒有使用此標籤的項目。' },

  // ---- entry page ----
  'entry.files': { en: 'Downloads', zh: '下載' },
  'entry.locked': { en: 'Approval required', zh: '需核准' },
  'entry.request': { en: 'Request access', zh: '申請存取' },
  'entry.back': { en: '← Back to search', zh: '← 回到搜尋' },

  // ---- request dialog ----
  'req.title': { en: 'Request access', zh: '申請存取' },
  'req.file': { en: 'File: {label}', zh: '檔案：{label}' },
  'req.name': { en: 'Your name', zh: '你的姓名' },
  'req.email': { en: 'Your email', zh: '你的電子郵件' },
  'req.reason': { en: 'Reason (optional)', zh: '申請原因（選填）' },
  'req.note': {
    en: 'We cannot email you. After sending, bookmark the status page to see the answer.',
    zh: '我們無法回信給你。送出後請將狀態頁面加入書籤，以便查看結果。',
  },
  'req.submit': { en: 'Send request', zh: '送出申請' },
  'req.cancel': { en: 'Cancel', zh: '取消' },
  'req.sending': { en: 'Sending…', zh: '傳送中…' },
  'req.err.invalid': {
    en: 'Please enter your name and a valid email.',
    zh: '請輸入姓名與有效的電子郵件。',
  },
  'req.err.busy': {
    en: 'Too many requests right now. Please try again later.',
    zh: '目前申請過多，請稍後再試。',
  },
  'req.err.generic': {
    en: 'Something went wrong. Please try again.',
    zh: '發生錯誤，請再試一次。',
  },

  // ---- request status ----
  'status.title': { en: 'Request status', zh: '申請狀態' },
  'status.loading': { en: 'Loading…', zh: '載入中…' },
  'status.missing': {
    en: 'No request found. Check that you opened the full link.',
    zh: '找不到申請紀錄，請確認你開啟的是完整連結。',
  },
  'status.pending': {
    en: 'Your request is waiting for approval. Bookmark this page and check back later.',
    zh: '你的申請正在等待核准。請將此頁面加入書籤，稍後再回來查看。',
  },
  'status.approved': { en: 'Approved.', zh: '已核准。' },
  'status.approved.nolink': {
    en: 'Approved, but the download link has not been added yet. Please check back later.',
    zh: '已核准，但尚未提供下載連結，請稍後再回來查看。',
  },
  'status.declined': {
    en: 'Sorry, this request was declined.',
    zh: '很抱歉，此申請未獲核准。',
  },
  'status.link': { en: 'Open the download', zh: '開啟下載連結' },
  'status.error': {
    en: 'Could not load the status. Please try again.',
    zh: '無法載入狀態，請再試一次。',
  },
  'status.privacy': {
    en: 'Keep this link private. Anyone who has it can see the result.',
    zh: '請妥善保管此連結，任何持有連結的人都能看到結果。',
  },

  // ---- 404 ----
  'notfound.title': { en: 'Page not found', zh: '找不到頁面' },
  'notfound.body': { en: 'This page does not exist.', zh: '這個頁面不存在。' },
  'notfound.home': { en: 'Go to Home', zh: '回到首頁' },
};

/** English text for server-side rendering. Throws on unknown keys so builds fail loudly. */
export function en(key: string): string {
  const e = DICT[key];
  if (!e) throw new Error(`Missing i18n key: ${key}`);
  return e.en;
}
