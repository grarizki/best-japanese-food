# best-japanese-food

Six static Vue apps serving the [japan-food-dataset](https://github.com/grarizki/japan-food-dataset) and halal restaurant data,
deployed to GitHub Pages at `https://grarizki.github.io/best-japanese-food/`.

| App | Path | Data | Records |
|---|---|---|---|
| Restaurants | `/restaurants/` | `japan_restaurants.json` | 3,482 |
| Budget Eats | `/budget/` | `budget_food.json` | 2,991 |
| Budget Meat (no pork) | `/budget-meat/` | `budget_food_meat.json` | 2,847 |
| Bakeries | `/bakeries/` | `bakeries.json` | 19 |
| Most Recommended | `/top-100/` | `most_recommended.json` | 166 sections |
| **Halal Restaurants** | `/halal/` | `halal-restaurants.json` | 43 |

## Halal Restaurants App

New category: halal and Muslim-friendly restaurants in Tokyo and Osaka.
Scraped from 7 directories (halalgourmet.jp, halalinjapan.com, muslim-guide.jp, tripadvisor, byfood.com, tokyoportfolio.com, myconciergejapan.com).

Features: filter by prefecture (Tokyo/Osaka), certification type (Halal Certified/Muslim Friendly/Halal Menu), and search by name, cuisine, or area.

See [`data/README.md`](data/README.md) for full schema documentation.

## Architecture

- **pnpm workspaces monorepo**: `packages/schema`, `packages/ui`, `scripts`, 6 `apps/*`, static `site/`.
- **Effect data pipeline** (`scripts/src/build-data.ts`): reads `../japan-food-dataset/data/*.json`
  live, validates every record with Effect Schema (`@effect/schema`), prunes crawler-only fields,
  and emits typed per-app JSON into `apps/<slug>/src/generated/`. A schema mismatch fails the build.
- **Effect in the frontend**: app state is owned by an Effect `SubscriptionRef` (observable ref + 
  changes stream); Vue components mirror it. No Redux/pinia.
- **Performance**: zero runtime fetches (data bundled at build), prerendered first page of cards
  via `@vue/server-renderer`, inline CSS (no render-blocking request), content-hashed assets cached
  by a per-app service worker. GitHub Pages forces 10-minute cache headers, so the SW is what makes
  repeat visits instant.

## Run locally

```bash
pnpm install
pnpm build:data   # reads ../japan-food-dataset/data (skip if generated/ is up to date)
pnpm test         # unit tests — run before committing
pnpm -r build     # builds + prerenders all 6 apps
```

## Deploy

Push to `main`. The GitHub Actions workflow runs tests (fails the deploy on a
schema/store regression), builds all apps, assembles the site, and publishes
via `actions/deploy-pages`. Set Pages source to **GitHub Actions** in the repo
settings.

On each deploy that ships new asset hashes, bump `CACHE_NAME` in each
`apps/*/public/sw.js` so stale cached assets are purged.

## Copy

Per-app copy (hero, tagline, value props) lives in `apps/<slug>/src/copy.ts`
and is baked into the prerendered HTML + meta tags.

## Attribution

Ratings, review counts and saves from Tabelog. Railway and station data from
MLIT National Land Numerical Information (国土数値情報).

Halal restaurant data scraped from halalgourmet.jp and other halal food directories.

See `TODO.md` for the planned Cloudflare (Hono + Effect) API iteration.
