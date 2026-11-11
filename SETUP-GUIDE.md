# Setting up a site like this with Git and Cloudflare

A step-by-step guide to building and hosting a small public website the way the FHSB site was built:
an Astro static site, a **private** GitHub repository, free hosting on **Cloudflare Pages**, and a
small backend (Cloudflare Pages Functions + KV storage) for "request access" downloads.

Written for Windows + PowerShell + VS Code. Total cost: **$0** (a custom domain is optional, about
$10-15 a year).

> Placeholders used below: `<user>` = your GitHub username, `<repo>` = your repository name,
> `<project>` = your Cloudflare Pages project name. Replace them with your own.

---

## 0. What you end up with

| Part | Technology | Cost |
| --- | --- | --- |
| Website pages | Astro (static HTML), plain CSS, very little JavaScript | free |
| Source code | Private GitHub repository | free |
| Hosting + HTTPS | Cloudflare Pages (`<project>.pages.dev`) | free |
| Request/approve downloads | Pages Functions + one KV namespace | free (limits in section 12) |
| Languages | English + Traditional Chinese switcher | free |

Every `git push` to `main` rebuilds and publishes the site in about a minute.

---

## 1. Accounts and tools

Create (all free):
1. A **GitHub** account: https://github.com
2. A **Cloudflare** account: https://dash.cloudflare.com/sign-up (no card needed)

Install:
1. **Node.js** (current LTS, version 22 or newer): https://nodejs.org
2. **Git for Windows**: https://git-scm.com
3. **VS Code**: https://code.visualstudio.com

Check in a terminal (restart VS Code after installing):

```powershell
node -v
npm -v
git --version
```

Turn on **two-factor authentication** on both GitHub and Cloudflare now. If someone gets into either
account, they control your site. This matters more than any other security step in this guide.

---

## 2. Create the project

In an empty folder (open it in VS Code, then open the terminal):

```powershell
npm create astro@latest -- . --template minimal --no-install --no-git --yes
npm install
```

Run it locally:

```powershell
npm run dev        # http://localhost:4321
npm run build      # writes the finished site to dist/
```

Useful project layout:

```
src/config.ts            site title, menu items, contact links
src/i18n/dict.ts         all interface text in each language
src/content/entries/     one Markdown file per concert / document / note
src/pages/               one file per page
src/layouts/Base.astro   menu, language switcher, loading screen
functions/api/           backend (request access, status, admin)
public/                  files copied as-is to the site (anything here is public!)
tests/                   automated tests
```

Add `.wrangler/` to `.gitignore` (Astro's defaults already ignore `dist/` and `node_modules/`).

> **Rule:** anything under `public/` can be downloaded by anyone who knows the URL. Never put a file
> there that should need approval.

---

## 3. Git and GitHub (private repository)

### 3.1 Create the repository
1. GitHub → **New repository**. Name it `<repo>`. Choose **Private**. Do not add a README
   (you already have files).
2. Copy the repository address: `https://github.com/<user>/<repo>.git`.

### 3.2 Decide what email appears in your commits
Every commit contains an author email, and it is public if the repo is ever public. To keep your real
address out of history:

1. GitHub → **Settings → Emails** → tick **Keep my email addresses private** and
   **Block command line pushes that expose my email**.
2. Use the `noreply` address GitHub shows on that page (it looks like
   `<number>+<user>@users.noreply.github.com`) in this project:

```powershell
git config user.name  "Your Name"
git config user.email "<number>+<user>@users.noreply.github.com"
```

(`git config` without `--global` only affects this project.)

### 3.3 First push

```powershell
git init -b main
git remote add origin https://github.com/<user>/<repo>.git
git add -A
git status          # read the list: no dist/, node_modules/, .env or passwords
git commit -F commit-message.txt
git push -u origin main
```

**Before the first push, confirm the repo is private.** A quick check from a terminal:

```powershell
Invoke-RestMethod https://api.github.com/repos/<user>/<repo>
```

An error "404 Not Found" means private (anonymous visitors cannot see it). A normal answer with
`private: False` means it is **public**: fix that in GitHub → repo **Settings → Danger Zone →
Change visibility** before pushing.

### 3.4 PowerShell tips
- Write commit messages to a file and use `git commit -F file`. Quotes inside `-m "..."` break
  silently in PowerShell.
- Do not hide git output (for example with `Out-Null`): a failed commit then looks like success.
- If a script edits a file containing non-English text, use an editor tool or set the encoding
  explicitly. Windows PowerShell 5.1 can read UTF-8 files as ANSI and garble Chinese characters.

### 3.5 Daily workflow

```powershell
npm run build       # must succeed
npm test            # must pass
git add -A
git commit -F commit-message.txt
git push            # Cloudflare redeploys automatically
```

---

## 4. Host on Cloudflare Pages

> **Important:** this site needs **Pages**, not a plain **Worker**. Cloudflare now shows both, and the
> Workers form looks similar. The backend in `functions/` only runs on Pages.

### 4.1 Create the project
1. Cloudflare dashboard → left menu **Compute → Workers & Pages**
   (older dashboards: **Workers & Pages** directly).
2. Click **Create application**.
3. Do **not** continue with the main form if its title says *"Configure your **Worker** project"* or it
   has a **Deploy command** field. That is the Workers flow.
4. Look near the bottom of the Create application page for **"Looking to deploy Pages? Get started"**
   and use that, then choose **Connect to Git**. Direct link (may change):
   `https://dash.cloudflare.com/?to=/:account/pages/new/provider/github`
5. Authorize GitHub for **only this repository** (`<user>/<repo>`), select it, then **Begin setup**.
6. Settings:

   | Field | Value |
   | --- | --- |
   | Project name | `<project>` (becomes `<project>.pages.dev`) |
   | Production branch | `main` |
   | Framework preset | **Astro** |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

7. **Save and Deploy.** After about a minute the site is live at `https://<project>.pages.dev`.

If you do not see a **Framework preset** field, you are on the wrong (Workers) form. Go back.

### 4.2 Pushes must redeploy
Make a small change, push, and watch **Deployments**: a new Production deployment should appear.
If the dashboard shows an orange **"disconnected from your Git account"** warning and nothing deploys:
1. GitHub → **Settings → Applications → Installed GitHub Apps → Cloudflare Pages → Configure**.
2. Under **Repository access**, make sure `<repo>` is selected. Save.
3. Back in Cloudflare, retry the deployment, or push an empty commit
   (`git commit --allow-empty -F msg.txt` then `git push`).

---

## 5. The request-access backend (optional but included here)

Visitors click **Request access** on a locked file → the request is stored → you approve or decline in
`/admin/` → an approved visitor sees the download link on a private status page.

Files: `functions/api/*.js`, `functions/api/admin/*.js`, `functions/_lib/util.js`.
No email is sent to visitors; they bookmark the status page.

### 5.1 Create the KV storage
1. Dashboard → **Storage & databases → KV → Create a KV namespace**. Name: `archive`.

### 5.2 Bind it to the project
1. **Workers & Pages →** your project **→ Settings → Bindings → Add → KV namespace**.
2. **Variable name:** exactly `ARCHIVE` (capitals). **Namespace:** `archive`. Save.

### 5.3 Set the admin password
1. **Settings → Variables and Secrets → Add**.
2. **Type: Secret** (not Plaintext). **Name:** `ADMIN_PASSWORD`. **Value:** a long password
   (20+ characters) from a password manager. Apply to **Production**. Save.
3. Whoever holds this password is the site administrator. Never put it in the repo or in chat.

### 5.4 Optional email alerts to the admin
Add two more secrets: `RESEND_API_KEY` (from a free resend.com account) and `NOTIFY_EMAIL`
(the admin's own address). On Resend's free tier without your own domain, mail can only go to the
account owner, so alerts go to the admin only. If these are missing, the site works normally and you
simply check `/admin/` yourself.

### 5.5 Apply the settings
Bindings and secrets only apply to **new** deployments:
**Deployments →** latest Production deployment **→ ⋯ → Retry deployment**.

### 5.6 What protects the admin page
- The password is compared in constant time; a wrong password, a missing password and a missing
  secret all return the same `Unauthorized`.
- **3 wrong attempts** from one visitor locks them out for **1 hour** (even the correct password is
  refused until it expires). Counted per visitor, stored as a hashed IP in KV, so a stranger cannot lock
  out the real admin. Change `MAX_FAILS` and `LOCK_SECONDS` in `functions/_lib/util.js`.
- If you lock yourself out: wait an hour, or delete the key starting with `fail:` in
  **KV → archive → View**.
- `/admin/` and `/request-status/` are marked `noindex`; API responses are `no-store`.

---

## 6. Test the whole thing

Local checks:

```powershell
npm run build
npm test
```

Live check, from a terminal (read-only, creates no data):

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" "https://<project>.pages.dev/api/status?t=bad"
# 400 = backend is running (malformed token)
curl.exe -s -o NUL -w "%{http_code}`n" "https://<project>.pages.dev/api/status?t=00000000000000000000000000000000"
# 404 = KV binding works (503 would mean the ARCHIVE binding is missing)
curl.exe -s -o NUL -w "%{http_code}`n" "https://<project>.pages.dev/api/admin/list"
# 401 = admin endpoints refuse requests without a password
```

End-to-end test in a browser (use a fake name and a throwaway address such as `test@example.com`):
1. Open a page with a locked file (the sample: `/entries/sample-score/`) → **Request access** → send.
   You land on a **Request status** page saying "waiting for approval". Keep this tab.
2. Open `/admin/` in another tab, sign in (type carefully, 3 tries), click **Approve**.
3. Refresh the status tab: it says "Approved, but the download link has not been added yet."
4. In `/admin/` → **Download links**, paste `https://example.com/test` and **Save**.
5. Refresh the status tab: **Open the download** appears.
6. **Clean up:** in `/admin/` delete the test request, clear the test link and save.

---

## 7. Privacy and security checklist

- [ ] Two-factor authentication on GitHub and Cloudflare.
- [ ] Repository is **private**.
- [ ] No passwords, API keys or personal emails in the repo. Secrets live only in the Cloudflare
      dashboard.
- [ ] Only emails you intend to publish appear on the site. Scan the build:
  ```powershell
  Get-ChildItem dist -Recurse -File -Include *.html,*.js | Select-String -Pattern '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
  ```
- [ ] Nothing under `public/` that needs approval; PDFs checked for personal metadata (author name).
- [ ] Download links for locked files exist only in `/admin/` (stored in KV), never in a Markdown file.
- [ ] Delete old requests now and then; visitor names and emails stay in KV for 90 days.

---

## 8. Everyday editing

| I want to... | Edit |
| --- | --- |
| Change the title, menu or contact links | `src/config.ts` |
| Change interface wording (English / 中文) | `src/i18n/dict.ts` (fill **both** languages) |
| Add a concert | new file in `src/content/entries/` with `tags: [concert]` |
| Add a free download | put the file in `public/files/`, list it under `files:` |
| Add an approval-required download | list it under `locked:` (an `id` of lowercase letters, digits, dashes), then set its link in `/admin/` |
| Hide an entry | set `draft: true` |
| Change colours | CSS variables at the top of `src/styles/global.css` |

Then: build → test → commit → push.

---

## 9. Custom domain (later)

1. Buy a domain (Cloudflare Registrar sells at cost; any registrar works).
2. Project → **Custom domains → Set up a custom domain**, enter the domain, follow the prompts.
   Cloudflare creates the DNS records and the HTTPS certificate.
3. Everything else (KV, secrets, backend) keeps working; relative links need no change.
   The `.pages.dev` address keeps working too.

---

## 10. Getting found on Google (later)

1. Replace placeholder text and sample entries first, because Google will index whatever is live.
2. Add your site in **Google Search Console** (https://search.google.com/search-console) as a URL-prefix
   property and verify it (usually by adding a meta tag to `Base.astro`).
3. Submit a sitemap (add `@astrojs/sitemap` and set `site:` in `astro.config.mjs` to the final address).
4. Link to the site from places Google already crawls (social profiles, the school or club website).

A new site can take days to weeks to appear.

### Keeping the site out of Google until you are ready

This project ships with search indexing **off**: every page has `<meta name="robots" content="noindex, nofollow, noarchive">`
and the same `X-Robots-Tag` response header (first block of `public/_headers`). Do **not** also add a `robots.txt` that blocks
everything: Google then cannot load the page to see the `noindex`, and the bare address can still show up in results.
This only asks search engines to stay away. The site stays reachable by anyone with the address. For real privacy use
Cloudflare Zero Trust **Access** (free for small teams) in front of the site.

To go public: set `ALLOW_SEARCH_INDEXING = true` in `src/config.ts`, delete the `/*` block at the top of
`public/_headers`, deploy, then continue with the Search Console steps above. If the site was ever indexed, Google drops it
after it re-crawls the `noindex` pages (days to weeks), or use the Removals tool in Search Console to hurry that up.

---

## 11. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Create form says "Configure your **Worker** project", has a **Deploy command** | Wrong flow. Use the **Pages** link (section 4.1). |
| No **Framework preset** dropdown | Same: you are on the Workers form. |
| Can't find **Workers & Pages** in the menu | It is under **Compute** in the newer dashboard. |
| Orange "disconnected from Git" and pushes do not deploy | Re-grant the repo in GitHub → Installed GitHub Apps → Cloudflare Pages (section 4.2). |
| `/api/status` returns **503** | The `ARCHIVE` KV binding is missing or misspelled; add it and **retry the deployment**. |
| Admin says **Unauthorized** with the right password | `ADMIN_PASSWORD` was added as plain text or not to Production, or the site was not redeployed afterwards. |
| Admin says **Locked for 1 hour** | 3 wrong attempts. Wait, or delete the `fail:` key in KV. |
| New setting has no effect | Settings only apply to new deployments: **Retry deployment**. |
| Chinese text turns into `?` or random symbols after a scripted edit | A tool read UTF-8 as ANSI (Windows PowerShell 5.1). Restore the file and edit with an editor or Node, not `Get-Content`/`Set-Content` defaults. |
| `git commit -m "..."` seems to work but nothing is committed | PowerShell quoting. Use `git commit -F file` and read the output. |
| Headless-Chrome screenshots of a phone look cropped | Chrome has a minimum window width near 500 px. Render the page inside a 390 px `<iframe>` instead. |
| A page works locally but a push breaks the build | Run `npm run build` before pushing; Cloudflare runs the same command. |

---

## 12. Free-plan limits worth knowing

- **Pages Functions:** about 100,000 requests per day. Past that, the request form stops working
  until the next day, but normal pages still load.
- **KV:** about 1,000 writes per day on the free plan (each request, decision and failed login is a
  write) and 100,000 reads per day. Plenty for a club site.
- **Builds:** about 500 per month on Pages.
- Limits change; check Cloudflare's current pricing page before relying on them.

---

## 13. Quick reference

```powershell
npm run dev          # local site
npm run build        # production build -> dist/
npm test             # backend + language tests (build first)
git add -A; git commit -F msg.txt; git push    # publish
```

Dashboard locations: **Compute → Workers & Pages → `<project>`** has *Deployments*, *Custom domains*,
*Settings (Bindings, Variables and Secrets)*. KV lives under **Storage & databases → KV**.
