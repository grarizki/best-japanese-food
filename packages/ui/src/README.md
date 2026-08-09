# packages/ui — the client half of the BFF boundary

## What this package is

`@bff/ui` holds the entire frontend: presentational Vue components plus a small
client-state layer. It has **no data access**. Every record it renders arrives
through component props as a `UiRecord` — the exact type emitted upstream by
`packages/schema`.

## Where this fits in a BFF architecture

BFF = Backend For Frontend: a layer that exists to give the frontend exactly
the data the frontend wants — validated, pruned, denormalized, display-ready.
The client never touches the raw upstream, never validates, never joins.

This repo is a static site, so the BFF runs at **build time** instead of
request time:

```
japan-food-dataset/data/*.json      raw crawled records (snake_case, nullable, crawler internals)
        │ read
        ▼
packages/schema (schema.ts)         THE CONTRACT
        │ Effect Schema decode + toUiRecord()
        │ → UiRecord (camelCase, pruned, display-ready view model)
        ▼
scripts/src/build-data.ts           THE BFF (build-time)
        │ validate → sort → write apps/<slug>/src/generated/data.json
        ▼
apps/*/src/generated/data.json      what the client "fetches" (bundled; zero runtime requests)
        │ imported at build
        ▼
packages/ui (this package)          THE CLIENT
        │ props only: data + copy
        ▼
Vue renders (SSR-prerendered)
```

When the TODO.md plan (Hono + Effect API on Cloudflare Workers) lands, the same
three layers survive: `schema.ts` becomes the API contract, `build-data.ts`
logic becomes the endpoints, and apps swap `import data from
'./generated/data.json'` for `fetch('/api/...')`. **This package would not
change at all** — that is the point of the seam.

## The rules this package follows (and why)

1. **Never import raw data.** Components take `UiRecord[]` via `defineProps`.
   No `fetch`, no dataset import. A component that needs data it does not have
   asks its parent.
2. **Never redefine the contract.** Types come from `@bff/schema` (`UiRecord`).
   Producer and consumer compile against the same file — a shape change breaks
   both sides at build time. This is the type-safe stand-in for the contract a
   runtime BFF would publish (OpenAPI / tRPC).
3. **Never do BFF work in the client.** Joining station lines, filling
   `prefectureJa`, deriving `budgetMaxYen`, sorting by rating — all done
   upstream in `toUiRecord()`. Components only format for the eye
   (`toFixed(2)`, `toLocaleString()`).
4. **Split state from data.** The only client state is view state (filter,
   sort, pagination) — `store.ts`. Data flows one-way through props; state
   never holds data.

## File-by-file

### index.ts — the package boundary
The only module consumers (`apps/*`) may import. It re-exports the components,
the store factory, and the copy constants. Treat it like the BFF's endpoint
list: a deliberate public surface, everything else private.
`import { FoodApp } from '@bff/ui'` in `entry-server.ts` is the whole
integration cost.

### copy.ts — content vs. code
All user-facing strings in one file, passed down as a single `copy` prop.
Nothing hardcoded in components. In a runtime BFF this is where per-locale copy
endpoints would come from; here it is baked in at build (`apps/*/src/copy.ts`
are the per-app variants, injected into prerendered HTML + meta tags).

### types.ts — UI-local types over the contract
`TopSection` is the one place the UI composes the shared `UiRecord` into an
app-specific grouping. It composes the contract, never duplicates it.

### store.ts — client state, Effect-owned
A thin wrapper over Effect's `SubscriptionRef` (observable ref + changes
stream). `getState` / `mutate` / `subscribe` is the whole API; Vue mirrors it
via `reactive` + `Object.assign`. Why it exists: the UI still needs
*interaction* state (which city, which sort, how many visible) even though
*data* state lives upstream. Tested in `store.test.ts`.

### FoodApp.vue — container component (the "page")
Receives `data` + `copy` via props, owns interaction state through the store,
and derives the visible list in computed pipelines: filter by city → sort by
key → slice for pagination. The `IntersectionObserver` sentinel is pure client
UX (infinite scroll); it mutates the store, not the data.

### Top100App.vue — same pattern, different data shape
Same container skeleton, but consumes `TopSection[]` (named sections) and
reuses `FoodCard` unchanged. Two apps, one card component — proof that
presentational components stay reusable when they know nothing about where data
came from.

### FoodCard.vue — presentational component (the "view")
Knows only `UiRecord` (the contract) and its own flip-animation state. Every
field it prints already exists in the right language and units — the BFF's
denormalization job. Only logic is formatting for display.

### style.css — the design system
Global styles, tokens, card-flip CSS. No data coupling; swap it freely.

### store.test.ts — testing the boundary
Tests the store contract (initial state, mutation, subscribe/unsubscribe), not
pixels. The pipeline side is tested in `packages/schema/src/schema.test.ts` —
both ends of the BFF seam have a runnable check.

## Reading order

1. `packages/schema/src/schema.ts` → `UiRecord` + `toUiRecord()`. The contract
   and the shape-shifting.
2. `scripts/src/build-data.ts` → the build-time BFF executing the contract.
3. `apps/restaurants/src/entry-server.ts` → the seam: data + copy → props →
   SSR.
4. This package, in the order above.

## The lesson in one sentence

The frontend is small and dumb because the BFF did the heavy lifting; the type
in `packages/schema` is the handshake that makes the split safe.
