/_ Copilot instructions for working with this repository. Keep concise and actionable. _/

# Quick Onboarding

This repo simulates a Facebook-style feed by fetching ads from Meta's Ad Library API and rendering them in browser-based demos.

- Primary dev preview: open `pages/facebook/facebook-feed-demo.html` (or run a simple local server: `python -m http.server 8000`).
- Programmatic usage is through the JS modules in `script/` and a few helper scripts (see `script/example-usage.js`).

# Big-picture architecture

- Data/Input: `facebook_ads_full_media.csv` (sample data) and the Meta Ad Library API via `script/meta-ad-api.js`.
- Controller: `script/feed-simulator.js` orchestrates searches, caching, and refresh logic.
- Renderer: `script/facebook-ad-renderer.js` maps API/ad objects to DOM templates used in files under `pages/facebook/`.
- Tools: `script/ad-library-extractor.js`, `script/example-usage.js`, and `script/feed-simulator.js` are utility/orchestration scripts.

# Key files to inspect

- `pages/facebook/facebook-feed-demo.html` — interactive demo and the easiest entry point for experimentation.
- `script/meta-ad-api.js` — all API calls to Meta; look here for rate-limiting and request shapes.
- `script/facebook-ad-renderer.js` — DOM templates and rendering conventions (how ad fields map to HTML).
- `script/feed-simulator.js` — integration patterns: how searches are performed, caching toggles, and options passed to renderer.
- `script/example-usage.js` — real usage samples to copy when automating flows.

# Project-specific conventions

- Rendering options are passed as plain objects (see `FeedSimulator` initialization in the README). Follow that shape when mocking or invoking renderers.
- Front-end scripts expect to run in-browser; many live demos are static HTML that include `script/*.js` via `<script>` tags.
- Sensitive secrets (access tokens) are stored only in-memory in the demo UI — do not commit tokens.

# Common developer workflows

- Quick-preview: open `pages/facebook/facebook-feed-demo.html` in a browser.
- Local server (recommended to avoid CORS issues):

  python -m http.server 8000

  then open: http://localhost:8000/pages/facebook/facebook-feed-demo.html

- Programmatic fetch & render: copy patterns from `script/example-usage.js` and use `MetaAdAPI` + `FacebookAdRenderer` classes.
- Export/sample data: look at `facebook_ads_full_media.csv` for expected CSV structure when writing importers.

# Integration points & external dependencies

- Meta Ad Library API: all network logic lives in `script/meta-ad-api.js` (search methods, snapshot fetching).
- Ad snapshots and image extraction: see `getAdSnapshot` and `extractImagesFromSnapshot` in `meta-ad-api.js`.
- No build system detected (no package.json, no bundler). Assume plain static site + script files.

# Examples to copy (templates)

- Initializing simulator (from README):

  const simulator = new FeedSimulator({
  accessToken: 'YOUR_ACCESS_TOKEN',
  containerSelector: '#feed-container',
  cacheEnabled: true
  });

  await simulator.searchAds('Nike', { country: 'US', limit: 10 });

- Rendering multiple ads (use `FacebookAdRenderer.renderMultipleAds(ads)` pattern from `script/facebook-ad-renderer.js`).

# What to avoid / quick gotchas

- Do not open demo HTML directly when testing features that fetch external snapshots or images — use a local server to avoid CORS and mixed-content problems.
- Do not commit access tokens. Tokens are short-lived — use the Graph API Explorer for quick testing.

# When modifying code

- Keep changes scoped: update `facebook-ad-renderer.js` for UI-only changes, `meta-ad-api.js` for API changes, and `feed-simulator.js` for orchestration logic.
- Mirror existing function signatures and options objects — many callers expect specific keys (e.g., `searchAds(params)` and `renderAd(adData, options)`).

# If you need more context

- Inspect `pages/facebook/facebook-with-ads.html` and `pages/facebook/facebook-feed-demo.html` for complete examples of configuration values and UI hooks.
- Ask for a run example you want automated (I can add a small runnable script or a README snippet).

---

If anything here is unclear or you want more detail in a particular section (examples, CLI commands, or component boundaries), tell me which area and I will expand it.
