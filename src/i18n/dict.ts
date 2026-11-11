// UI text only. key -> { en, zh } where zh is Traditional Chinese (Taiwan wording).
// Entry content (src/content/entries) stays as written.
export type Entry = { en: string; zh: string };

export const DICT: Record<string, Entry> = {
  // ---- navigation ----
  'nav.home': { en: 'Home', zh: '首頁' },
  'nav.about': { en: 'About', zh: '關於我們' },
  'nav.history': { en: 'History', zh: '樂團沿革' },
  'nav.news': { en: 'News', zh: '最新消息' },
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
  'lang.aria': { en: 'Language', zh: '語言' },
  'site.suffix': { en: 'FHSB', zh: 'FHSB' },

  // ---- about ----
  'about.title': { en: 'About', zh: '關於我們' },
  'about.p1': {
    en: 'Fuhsing Symphonic Band (FHSB). Add a short introduction to the band here.',
    zh: '復興管樂團（FHSB）。請在此加入樂團的簡短介紹。',
  },
  'about.p2': {
    en: 'Tell visitors who you are, what you play, and when you rehearse.',
    zh: '告訴大家樂團的成員、演奏的曲風，以及練習的時間。',
  },
  'about.history': { en: 'Band history', zh: '樂團沿革' },

  // ---- history ----
  'history.title': { en: 'History', zh: '樂團沿革' },
  'history.intro': {
    en: 'A timeline of the band. Replace these placeholders with real milestones.',
    zh: '樂團的大事記。請以實際的里程碑取代這些預留文字。',
  },
  'history.item': { en: 'Add a milestone here.', zh: '請在此加入一則里程碑。' },

  // ---- news ----
  'news.title': { en: 'News', zh: '最新消息' },
  'news.intro': { en: 'Latest news from the band.', zh: '樂團的最新消息。' },
  'news.empty': { en: 'No news yet.', zh: '目前還沒有最新消息。' },

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
