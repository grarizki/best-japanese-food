// Effect pipeline: validate + prune the japan-food-dataset into per-app JSON.
// Reads live from ../japan-food-dataset/data, decodes with Effect Schema,
// maps to the pruned UiRecord shape, writes one file per app.
import { Effect } from 'effect'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import {
  decodeBudgetRecords,
  decodeRecords,
  decodeTopSections,
  normalizeRecord,
  toBudgetYen,
  toUiRecord,
  toUiRecordFromTop,
  type UiRecord,
} from '@bff/schema'

const DATASET_DIR = path.resolve(import.meta.dirname, '../../../japan-food-dataset/data')
const APPS_DIR = path.resolve(import.meta.dirname, '../../apps')

const byRatingDesc = (a: UiRecord, b: UiRecord): number =>
  b.rating - a.rating || b.reviews - a.reviews

function asUiRecords(records: Parameters<typeof toUiRecord>[0][]): UiRecord[] {
  return records.map((r) => toUiRecord(r)).sort(byRatingDesc)
}

const readJson = (file: string) =>
  Effect.tryPromise({
    try: async () => JSON.parse(await fs.readFile(path.join(DATASET_DIR, file), 'utf8')),
    catch: (e) => new Error(`failed to read ${file}: ${String(e)}`),
  })

const writeJson = (file: string, data: unknown) =>
  Effect.tryPromise({
    try: async () => {
      await fs.mkdir(path.dirname(file), { recursive: true })
      await fs.writeFile(file, JSON.stringify(data))
    },
    catch: (e) => new Error(`failed to write ${file}: ${String(e)}`),
  })

function budgetMax(r: { budget_max_yen: number | null; budget_dinner: string | null; budget_lunch: string | null }): number | null {
  return r.budget_max_yen ?? toBudgetYen(r.budget_dinner) ?? toBudgetYen(r.budget_lunch)
}

const program = Effect.gen(function* () {
  const summary: Record<string, number> = {}

  // restaurants (base dataset)
  const restaurants = readJson('japan_restaurants.json').pipe(
    Effect.map((raw: unknown) => (Array.isArray(raw) ? raw : []).map((r) => normalizeRecord(r as Record<string, unknown>))),
    Effect.map(decodeRecords),
  )
  const restaurantUi = restaurants.pipe(Effect.map(asUiRecords))
  summary['restaurants'] = (yield* restaurantUi).length
  yield* restaurantUi.pipe(
    Effect.map((ui) => writeJson(path.join(APPS_DIR, 'restaurants/src/generated/data.json'), ui)),
    Effect.flatten,
  )

  // budget eats
  const budget = readJson('budget_food.json').pipe(
    Effect.map((raw: unknown) => (Array.isArray(raw) ? raw : []).map((r) => normalizeRecord(r as Record<string, unknown>))),
    Effect.map(decodeBudgetRecords),
  )
  const budgetUi = budget.pipe(
    Effect.map((records) =>
      records
        .map((r) => ({ ...toUiRecord(r), budgetMaxYen: budgetMax(r) }))
        .sort(byRatingDesc),
    ),
  )
  summary['budget'] = (yield* budgetUi).length
  yield* budgetUi.pipe(
    Effect.map((ui) => writeJson(path.join(APPS_DIR, 'budget/src/generated/data.json'), ui)),
    Effect.flatten,
  )

  // budget meat (no pork)
  const budgetMeat = readJson('budget_food_meat.json').pipe(
    Effect.map((raw: unknown) => (Array.isArray(raw) ? raw : []).map((r) => normalizeRecord(r as Record<string, unknown>))),
    Effect.map(decodeBudgetRecords),
  )
  const budgetMeatUi = budgetMeat.pipe(
    Effect.map((records) =>
      records
        .map((r) => ({ ...toUiRecord(r), budgetMaxYen: budgetMax(r) }))
        .sort(byRatingDesc),
    ),
  )
  summary['budget-meat'] = (yield* budgetMeatUi).length
  yield* budgetMeatUi.pipe(
    Effect.map((ui) => writeJson(path.join(APPS_DIR, 'budget-meat/src/generated/data.json'), ui)),
    Effect.flatten,
  )

  // bakeries (curated, small)
  const bakeries = readJson('bakeries.json').pipe(
    Effect.map((raw: unknown) => (Array.isArray(raw) ? raw : []).map((r) => normalizeRecord(r as Record<string, unknown>))),
    Effect.map(decodeRecords),
  )
  const bakeryUi = bakeries.pipe(Effect.map(asUiRecords))
  summary['bakeries'] = (yield* bakeryUi).length
  yield* bakeryUi.pipe(
    Effect.map((ui) => writeJson(path.join(APPS_DIR, 'bakeries/src/generated/data.json'), ui)),
    Effect.flatten,
  )

  // top-100 (sectioned ranked lists)
  const topSections = readJson('most_recommended.json').pipe(Effect.map(decodeTopSections))
  const sections = topSections.pipe(
    Effect.map((sections) =>
      Object.entries(sections).map(([name, records]) => ({
        name,
        records: records.map(toUiRecordFromTop).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)),
      })),
    ),
  )
  summary['top-100 sections'] = (yield* sections).length
  yield* sections.pipe(
    Effect.map((s) => writeJson(path.join(APPS_DIR, 'top-100/src/generated/data.json'), { sections: s })),
    Effect.flatten,
  )

  console.log(JSON.stringify(summary, null, 2))
})

Effect.runPromise(program).catch((error) => {
  console.error('build-data failed:', error)
  process.exitCode = 1
})
