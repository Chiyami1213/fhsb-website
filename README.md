# 復興管樂團 Fuhsing Symphonic Band (FHSB) website

Static site built with [Astro](https://astro.build), hosted on Cloudflare Pages, with a small
Pages Functions + KV backend for "request access" downloads.

```
npm install
npm run dev        # local site (http://localhost:4321)
npm run build      # -> dist/
npm test           # backend + i18n tests (run `npm run build` first; i18n tests read dist/)
```

## Where to edit

| What | Where |
| --- | --- |
| Site title, contact links, menu items | `src/config.ts` |
| UI text (English + Traditional Chinese) | `src/i18n/dict.ts` |
| Concerts, music, documents, notes | `src/content/entries/*.md` |
| Free downloads | put files in `public/files/`, list them under `files:` in an entry |
| Approval-required downloads | list under `locked:` (id + label) in an entry; set the link in `/admin/` |
| Colours | CSS variables at the top of `src/styles/global.css` |

Entry front matter: `title`, `date`, `type` (project | writing | note | media | document), `tags`,
`description`, `files`, `locked`, `draft`.
Section pages are built from entries: **Concerts** = tag `concert`; **Music** = tags `repertoire` /
`recording`; **Documents** = `type: document`. Draft entries are never built.

Pages that exist but are not in the menu: `/search/` (search), `/history/`, `/tags/<tag>/`.
To add one to the menu, add one line to `NAV_TOP` in `src/config.ts` (plus a label key in the dictionary).

## Logo artwork

`design/fhsb-logo-original.png` is the official logo (white background). Derived files:

- `public/images/loader/`: the loading-screen assets (the 4 instruments, the 4 big FHSB letters, and the name row as 4 purple
  capitals + 4 text segments), grouped from the cut pieces by `design/tools/make_loader_assets.py`; their positions are in
  `src/data/loader-layout.json`. Black text is drawn through a CSS mask so it follows the light/dark theme.
- **Loading animation**: `src/components/LoaderLogo.astro` + the `.logo-anim` rules in `src/styles/global.css`; the timeline is the
  script in `src/layouts/Base.astro` (times in ms after the page starts). It plays on the first visit of a browser session and on
  every reload:
  0: the 4 purple instruments slide in from the right one by one, the big FHSB letters from the left (B, S, H, F), the purple
  F H S B appear together then spread while the rest of the name wipes open. 2600: the window opens and the logo stays.
  3400: the instruments leave right, the full name leaves left. 4100: the big FHSB turns purple. 4400: it shrinks onto the
  home-page subtitle. 5000: the push-out replays there (purple capitals spread, grey text opens) while 復興管樂團 fades in.
  6000: the real subtitle takes over (purple F H S B, grey rest, see `src/pages/index.astro`). 6600: done. On pages other than Home the big
  letters just fade away. Visitors who prefer reduced motion get a short plain fade.
- `public/images/logo-parts/`: **38 single objects** (every ring, stick, dot, tube and letter) as separate transparent PNGs, for
  animation. `manifest.json` gives each piece's name, colour (`purple` or `ink`), group (`icon`, `fhsb`, `name`) and its
  x / y / width / height on a shared 2619 x 1736 canvas, so the pieces can be put back exactly where they started. Sticks and
  rings that touch in the logo were separated geometrically and are each drawn complete. `design/logo-parts-overview.png`
  is a contact sheet of all pieces.
- `design/tools/`: the Python scripts that produced them. Create a virtual environment, `pip install pillow numpy scipy`, then run
  `python -I design/tools/cut_logo.py design/fhsb-logo-original.png out/parts out/overview.png`.

## Privacy rules

- The band has **no public email**. Never add a personal or login email to the repo, the site or the
  Contact page. Alerts go to an email set as a Cloudflare **secret** (below), never in code.
- Anything under `public/` can be downloaded by anyone with the URL. Files that need approval must
  **not** be in the repo. Check PDFs for personal metadata.
- **Search engines are currently blocked site-wide**: every page has a `noindex, nofollow, noarchive` tag and the same
  `X-Robots-Tag` header (`public/_headers`). There is deliberately no `robots.txt` block, because Google must be able to
  load a page to see its `noindex`. The site is still reachable by anyone who has the address; for real privacy put it behind
  Cloudflare Access. To go public in search: set `ALLOW_SEARCH_INDEXING = true` in `src/config.ts` **and** delete the `/*`
  block at the top of `public/_headers`.

## Request-access backend (Cloudflare)

Files: `functions/api/*.js` (+ `functions/_lib/util.js`). One KV namespace bound as `ARCHIVE`.

1. Cloudflare dashboard → **Storage & Databases → KV** → create a namespace named `archive`.
2. **Workers & Pages** → your Pages project → **Settings → Bindings → Add → KV namespace**.
   Variable name **`ARCHIVE`**, choose the `archive` namespace.
3. **Settings → Variables and Secrets** → add secret **`ADMIN_PASSWORD`** (long; save it in a password manager).
   Whoever holds this password is the site's admin.
4. Optional alerts when someone requests a file: add secrets `RESEND_API_KEY` and `NOTIFY_EMAIL`
   (the admin's own address; with Resend's free tier and no domain it can only email you).
5. **Deployments → Retry deployment** so the bindings apply.

**Admin lockout:** after 3 wrong password attempts a visitor is locked out of `/admin/` for 1 hour (even the correct password is refused until it expires). Counted per visitor (hashed IP, stored in KV), so a stranger cannot lock you out. Change `MAX_FAILS` / `LOCK_SECONDS` in `functions/_lib/util.js`. If you lock yourself out, wait 1 hour or delete the `fail:…` key in the KV namespace.

Visitors cannot be emailed: after requesting, they get a private `/request-status/?t=…` page to
bookmark. An approved visitor could forward the share link; for sensitive files, share directly to
their email in Google Drive instead.

## Deploy

GitHub → Cloudflare Pages: Framework preset **Astro**, build command `npm run build`, output
directory `dist`, production branch `main`. Every push redeploys (~1 min).
