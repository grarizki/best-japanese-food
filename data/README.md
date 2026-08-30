# Halal Restaurant Dataset

Scraped halal and Muslim-friendly restaurants in Tokyo and Osaka, Japan.

## Sources

| Source | URL | Records |
|--------|-----|--------|
| Halal Gourmet Japan | [halalgourmet.jp](https://halalgourmet.jp) | Primary database |
| Halal In Japan | [halalinjapan.com](https://www.halalinjapan.com) | Directory |
| Muslim Guide Japan | [muslim-guide.jp](https://muslim-guide.jp) | Osaka focused |
| TripAdvisor | [tripadvisor.com](https://www.tripadvisor.com) | Reviews |
| byFood | [byfood.com](https://www.byfood.com) | Curated list |
| Tokyo Portfolio | [tokyoportfolio.com](https://tokyoportfolio.com) | Travel guide |
| My Concierge Japan | [myconciergejapan.com](https://myconciergejapan.com) | Premium dining |

## Data Format

Each record contains:

- `id` — Unique identifier (prefix indicates source: `hgjp-` = Halal Gourmet Japan, `ta-` = TripAdvisor, `bf-` = byFood, `mcj-` = My Concierge Japan, `fb-` = Falafel Brothers, `tp-` = Tokyo Portfolio, `fd-` = Food Diversity, `cocoi-` = CoCoICHIBANYA)
- `name` — English restaurant name
- `name_ja` — Japanese name
- `cuisine` — Cuisine type
- `area` / `area_ja` — Neighborhood in English and Japanese
- `prefecture` — `tokyo` or `osaka`
- `certification` — One of:
  - `halal_certified` — Official halal certification
  - `muslim_friendly` — Pork-free / halal menu available
  - `halal_ingredients` — Halal ingredients used
  - `halal_menu` — Halal menu on request
- `features` — Array of tags: `halal_meat`, `pork_free`, `halal_seasoning`, `halal_meal`, `no_alcohol`, `muslim_owned`, `prayer_space`, `vegetarian`, `vegan`
- `description` — Short description
- `url` — Source URL for more info
- `source` — Data source

## Usage

```json
import data from './halal-restaurants.json'

const tokyoHalal = data.tokyo.filter(r => r.certification === 'halal_certified')
const osakaMuslimFriendly = data.osaka.filter(r => r.certification === 'muslim_friendly')
```

## Limitations

- This is a curated subset, not exhaustive. The full halalgourmet.jp database has 200+ Tokyo and 80+ Osaka listings.
- Certification status may change. Always verify with the restaurant directly.
- Some restaurants offer halal menus on request only (contact in advance).
- Last updated: 2026-08-30

## Full Directory Links

For the complete dataset, visit:

- [Halal Gourmet Japan - Tokyo](https://halalgourmet.jp/restaurants/prefectures/tokyo)
- [Halal Gourmet Japan - Osaka](https://halalgourmet.jp/restaurants/prefectures/osaka)
- [Halal In Japan - Tokyo](https://www.halalinjapan.com/tokyo-halal-food-restaurants.html)
- [Halal In Japan - Osaka](https://www.halalinjapan.com/osaka-halal-food-restaurants.html)
- [Muslim Guide - Osaka](https://muslim-guide.jp/restaurant/city/osaka/)
