# BrickPulse Valuator

A browser-based LEGO minifigure lot appraiser, powered by the Anthropic Claude API. Drop in lot photos, get back per-figure identification, tier classification, condition flags, value ranges, and a buy/pass recommendation against a configurable cost rule.

Built as a PWA — installs to home screen and dock like a native app. Runs entirely in the browser; no backend, no server-side state, API key lives in `localStorage` per device.

![BrickPulse Valuator](icon-512.png)

## Features

- **Multi-image batch analysis** — drop in any number of lot photos, processed sequentially with live status indicators
- **Per-figure breakdown** — name, theme, tier (T1/T2/T3), condition, BrickLink-aligned value range, authenticity flags
- **Three modes** — Standard, Deep Dive (exhaustive scan for pile/bin lots), Quick (totals only)
- **Model toggle** — Claude Opus 4.7 (best vision, default) or Sonnet 4.6 (cheaper bulk runs)
- **50% rule helper** — summary bar shows max acceptable cost based on aggregate low estimate
- **Export** — JSON or CSV dump of all per-figure data for spreadsheet/sourcing analysis
- **Offline shell** — cached app shell loads instantly even without connection (API calls obviously still need internet)
- **Installable PWA** — standalone window on Mac, full-screen on iPhone, no browser chrome

## Live demo

Once you've deployed it, drop the URL here.

## Quick start (local)

```bash
git clone https://github.com/YOUR_USERNAME/brickpulse-valuator.git
cd brickpulse-valuator
# Open index.html in Chrome, or serve locally:
python3 -m http.server 8000
# then visit http://localhost:8000
```

Note: the service worker only registers over HTTPS or `localhost`, so opening `index.html` via `file://` will skip the offline cache (the app still works normally).

## Deploying

Two paths. Pick one. Both are free.

### Option A — Cloudflare Pages connected to GitHub (recommended)

Auto-deploys on every push to `main`. Best long-term setup.

1. Push this repo to GitHub (see *Pushing to GitHub* below).
2. Go to **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize Cloudflare's GitHub app, select this repo.
4. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/`
5. Click **Save and Deploy**. ~30 seconds later you'll have a URL like `https://brickpulse-valuator.pages.dev`.
6. Optional: add a custom domain under **Custom domains**.

Future updates: push to `main`, Cloudflare auto-rebuilds.

### Option B — GitHub Pages

Simpler, but no preview deployments and slightly slower CDN than Cloudflare.

1. Push this repo to GitHub.
2. Repo → **Settings → Pages**.
3. **Source:** Deploy from a branch.
4. **Branch:** `main`, folder: `/ (root)`.
5. Save. ~1 minute later you'll have a URL like `https://YOUR_USERNAME.github.io/brickpulse-valuator/`.

## Pushing to GitHub

If you've never done this before, the easiest path is the web UI:

1. Go to https://github.com/new — create a new repo named `brickpulse-valuator` (public or private, your call).
2. **Do NOT** initialize with README/license/gitignore (this repo already has them).
3. On the next page, click **uploading an existing file**.
4. Drag every file from this folder into the upload box.
5. Commit message: `Initial commit` → **Commit changes**.

Or via command line:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/brickpulse-valuator.git
git push -u origin main
```

## Installing as an app

### iPhone
1. Open the live URL in **Safari** (not Chrome — only Safari can install PWAs on iOS).
2. Tap **Share** → **Add to Home Screen**.
3. Done — tap the icon to launch fullscreen.

### Mac
**Chrome / Edge / Brave / Arc:** click the install icon in the address bar.
**Safari (Sonoma+):** **File → Add to Dock**.

## Configuration

Paste your Anthropic API key in the top-right field on first load. It saves to `localStorage` per device — paste once on iPhone, once on Mac.

API keys are never transmitted anywhere except directly to `api.anthropic.com`. Get a key at https://console.anthropic.com.

## Updating the service worker

When you push code changes, bump the cache version in `service-worker.js` so installed instances pick up the update:

```js
const CACHE_NAME = 'brickpulse-valuator-v1'; // → v2, v3, etc.
```

Without this bump, the old cached shell will keep loading. Users may need one extra reload after the SW activates.

## Tech notes

- Pure HTML/CSS/JS — no build step, no framework, no dependencies beyond Google Fonts.
- Calls the Anthropic Messages API directly from the browser using the `anthropic-dangerous-direct-browser-access` header. This is fine for personal/single-user tooling but not appropriate for any multi-user or public-facing app — you'd want a server proxy in that case.
- Service worker is network-first for navigation, cache-first for static assets, and bypassed entirely for `api.anthropic.com`.

## License

MIT — see [LICENSE](LICENSE).
