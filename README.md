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

Pages that exist but are not in the menu: `/archive/` (search), `/history/`, `/tags/<tag>/`.
To add one to the menu, add one line to `NAV_TOP` in `src/config.ts` (plus a label key in the dictionary).

## Privacy rules

- The band has **no public email**. Never add a personal or login email to the repo, the site or the
  Contact page. Alerts go to an email set as a Cloudflare **secret** (below), never in code.
- Anything under `public/` can be downloaded by anyone with the URL. Files that need approval must
  **not** be in the repo. Check PDFs for personal metadata.
- Only `/admin/` and `/request-status/` are `noindex`. There is no `robots.txt`.

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

**Admin lockout:** after 3 wrong password attempts a visitor is locked out of `/admin/` for 15 minutes (even the correct password is refused until it expires). Counted per visitor (hashed IP, stored in KV), so a stranger cannot lock you out. Change `MAX_FAILS` / `LOCK_SECONDS` in `functions/_lib/util.js`. If you lock yourself out, wait 15 minutes or delete the `fail:…` key in the KV namespace.

Visitors cannot be emailed: after requesting, they get a private `/request-status/?t=…` page to
bookmark. An approved visitor could forward the share link; for sensitive files, share directly to
their email in Google Drive instead.

## Deploy

GitHub → Cloudflare Pages: Framework preset **Astro**, build command `npm run build`, output
directory `dist`, production branch `main`. Every push redeploys (~1 min).
