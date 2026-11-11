// Site-wide settings. Edit here.
export const SITE = {
  titleZh: '復興管樂團',
  titleEn: 'Fuhsing Symphonic Band',
  short: 'FHSB',
  year: 2026, // shown in the footer banner
};

// Public contact links. The band has no email address, so none is shown.
// Leave a value empty ('') to hide that row on the Contact page.
// IMPORTANT: never put a personal/login email address in this repo.
export const CONTACT = {
  instagram: '', // e.g. 'https://www.instagram.com/...'
  facebook: '', // e.g. 'https://www.facebook.com/...'
  youtube: '', // e.g. 'https://www.youtube.com/@...'
  website: '', // any other website
};

// Optional hidden link on the loading-screen character. Empty = no link.
export const EASTER_EGG_URL = '';

export interface NavChild {
  href: string;
  label: string; // dictionary key
  logo?: string; // optional single-tone image in /public, rendered as a mask
}
export interface NavItem {
  href: string;
  label: string; // dictionary key
  icon: string; // key in src/components/icons.ts
  children?: NavChild[];
}

// To add a menu item: add one line here (and a label key in src/i18n/dict.ts).
// Pages that exist but are not listed (reachable by URL): /archive/, /history/
export const NAV_TOP: NavItem[] = [
  { href: '/', label: 'nav.home', icon: 'home' },
  { href: '/about/', label: 'nav.about', icon: 'info' },
  { href: '/concerts/', label: 'nav.concerts', icon: 'calendar' },
  {
    href: '/music/',
    label: 'nav.music',
    icon: 'music',
    children: [
      { href: '/music/repertoire/', label: 'nav.music.repertoire' },
      { href: '/music/recordings/', label: 'nav.music.recordings' },
    ],
  },
  { href: '/documents/', label: 'nav.documents', icon: 'file' },
];
export const NAV_BOTTOM: NavItem[] = [
  { href: '/contact/', label: 'nav.contact', icon: 'mail' },
  { href: '/settings/', label: 'nav.settings', icon: 'settings' },
];
