# TODO — next implementation: Cloudflare

The current site is fully static (GitHub Pages) and that is the right call for
performance: data is bundled at build time, pages are prerendered, and a
service worker serves hashed assets from cache on repeat visits. A runtime API
would only slow the frontend down.

Tracked for a future iteration:

- [ ] **Hono + Effect API on Cloudflare Workers** (`apps/api` package).
  - Hono routes HTTP; Effect Schema validates handlers; both run serverless on
    Cloudflare Workers / Pages Functions.
  - Expose the dataset (restaurants, budget, budget-meat, bakeries, top-100)
    as JSON endpoints at `best-japanese-food.example.com/api/*`.
  - Effect microservices are only possible off GitHub Pages (static-only), so
    this is a separate deployment, not a replacement.
- [ ] **Live dataset refresh** — re-crawl `japan-food-dataset`, re-run
  `pnpm build:data`, redeploy. Currently a manual pipeline (`build.py` in the
  dataset repo + `pnpm build` here).
- [ ] **Cloudflare deploy option** — add `wrangler.toml` / Pages Functions so
  the site can be served from Cloudflare Pages with `_headers` cache rules as
  an alternative to the service worker.
- [ ] **Per-genre / per-prefecture code splitting** for `restaurants` if the
  bundled dataset (~480 kB gzip) ever needs to go lower. Current choice is
  deliberate: zero network fetches.
