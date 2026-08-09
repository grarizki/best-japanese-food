import { Schema } from '@effect/schema'

// ---------------------------------------------------------------------------
// Effect Schema definitions for the japan-food-dataset records.
// All 5 data files share one record shape; budget files add budget_max_yen.
// Optional-present fields are normalized to `null` by `normalizeRecord`
// (fields can be missing or null in the crawled output).
// ---------------------------------------------------------------------------

export const PrefectureSchema = Schema.Literal('tokyo', 'osaka', 'kyoto', 'nara')
export type Prefecture = Schema.Type<typeof PrefectureSchema>

export const TransportSchema = Schema.Struct({
  station_ja: Schema.String,
  station_romaji: Schema.String,
  distance_m: Schema.NullOr(Schema.Number),
  lines_ja: Schema.Array(Schema.String),
  lines_romaji: Schema.Array(Schema.String),
  operators: Schema.Array(Schema.String),
})
export type Transport = Schema.Type<typeof TransportSchema>

const NullableNumber = Schema.NullOr(Schema.Number)
const NullableString = Schema.NullOr(Schema.String)

export const RestaurantRecordSchema = Schema.Struct({
  store_id: Schema.String,
  name_ja: Schema.String,
  name_romaji: NullableString,
  prefecture: PrefectureSchema,
  prefecture_ja: NullableString,
  url: Schema.String,
  genre_ja: NullableString,
  genre_en: NullableString,
  genres_ja: Schema.Array(Schema.String),
  rating: Schema.Number,
  review_cnt: Schema.Number,
  save_cnt: Schema.Number,
  budget_dinner: NullableString,
  budget_lunch: NullableString,
  score: NullableNumber,
  nearest_station_ja: NullableString,
  nearest_station_romaji: NullableString,
  nearest_distance_m: NullableNumber,
  transport: Schema.NullOr(TransportSchema),
})
export type RestaurantRecord = Schema.Type<typeof RestaurantRecordSchema>

// Budget files add a precomputed upper bound (yen).
export const BudgetRecordSchema = Schema.extend(
  RestaurantRecordSchema,
  Schema.Struct({ budget_max_yen: NullableNumber }),
)
export type BudgetRecord = Schema.Type<typeof BudgetRecordSchema>

// most_recommended.json is an object keyed by section name -> ranked records.
// Its records are sparse: no save_cnt, no genres_ja, no station/transport.
export const TopRecordSchema = Schema.Struct({
  rank: Schema.Number,
  store_id: Schema.String,
  name_ja: Schema.String,
  name_romaji: NullableString,
  genre_ja: NullableString,
  genre_en: NullableString,
  prefecture: Schema.String,
  budget_dinner: NullableString,
  budget_lunch: NullableString,
  rating: Schema.Number,
  review_cnt: Schema.Number,
  score: NullableNumber,
  url: Schema.String,
})
export type TopRecord = Schema.Type<typeof TopRecordSchema>

export const TopSectionsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Array(TopRecordSchema),
})
export type TopSections = Schema.Type<typeof TopSectionsSchema>

// Fields that may be missing (vs null) in raw output; normalize before decode.
export const NULLABLE_KEYS = [
  'name_romaji',
  'prefecture_ja',
  'genre_ja',
  'genre_en',
  'budget_dinner',
  'budget_lunch',
  'score',
  'nearest_station_ja',
  'nearest_station_romaji',
  'nearest_distance_m',
  'transport',
  'budget_max_yen',
] as const

/** Fill missing keys with null so NullOr schemas decode cleanly. */
export function normalizeRecord(record: Record<string, unknown>): Record<string, unknown> {
  for (const key of NULLABLE_KEYS) {
    if (!(key in record)) record[key] = null
  }
  return record
}

// ---------------------------------------------------------------------------
// Pruned UI record: what the frontend actually renders. Drops area_code,
// sub_area_code, google fields, and raw crawler internals.
// ---------------------------------------------------------------------------

export interface UiRecord {
  id: string
  nameJa: string
  nameRo: string
  prefecture: Prefecture | 'all'
  prefectureJa: string
  genreJa: string
  genreEn: string
  genresJa: string[]
  rating: number
  reviews: number
  saves: number
  budgetDinner: string | null
  budgetLunch: string | null
  budgetMaxYen: number | null
  stationJa: string | null
  stationRo: string | null
  distanceM: number | null
  linesJa: string[]
  operators: string[]
  url: string
  rank: number | null
}

/** Parse the first number out of a Tabelog budget string ("￥15,000～￥19,999" -> 15000). */
export function toBudgetYen(budget: string | null): number | null {
  if (!budget) return null
  const match = budget.match(/(\d[\d,]*)/)
  return match ? Number(match[1].replaceAll(',', '')) : null
}

/** Map a validated record to the pruned UI shape. */
export function toUiRecord(record: RestaurantRecord | BudgetRecord, rank: number | null = null): UiRecord {
  return {
    id: record.store_id,
    nameJa: record.name_ja,
    nameRo: record.name_romaji ?? '',
    prefecture: record.prefecture,
    prefectureJa: record.prefecture_ja ?? '',
    genreJa: record.genre_ja ?? '',
    genreEn: record.genre_en ?? '',
    genresJa: record.genres_ja,
    rating: record.rating,
    reviews: record.review_cnt,
    saves: record.save_cnt,
    budgetDinner: record.budget_dinner,
    budgetLunch: record.budget_lunch,
    budgetMaxYen: 'budget_max_yen' in record ? record.budget_max_yen : null,
    stationJa: record.nearest_station_ja,
    stationRo: record.nearest_station_romaji,
    distanceM: record.nearest_distance_m,
    linesJa: record.transport?.lines_ja ?? [],
    operators: record.transport?.operators ?? [],
    url: record.url,
    rank,
  }
}

/** Map a sparse top-100 record to the pruned UI shape. */
export function toUiRecordFromTop(record: TopRecord): UiRecord {
  const prefecture: Prefecture | 'all' = ['tokyo', 'osaka', 'kyoto', 'nara'].includes(record.prefecture)
    ? (record.prefecture as Prefecture)
    : 'all'
  return {
    id: record.store_id,
    nameJa: record.name_ja,
    nameRo: record.name_romaji ?? '',
    prefecture,
    prefectureJa: record.prefecture,
    genreJa: record.genre_ja ?? '',
    genreEn: record.genre_en ?? '',
    genresJa: [],
    rating: record.rating,
    reviews: record.review_cnt,
    saves: 0,
    budgetDinner: record.budget_dinner,
    budgetLunch: record.budget_lunch,
    budgetMaxYen: null,
    stationJa: null,
    stationRo: null,
    distanceM: null,
    linesJa: [],
    operators: [],
    url: record.url,
    rank: record.rank,
  }
}

/** Decode raw JSON records (already normalized) or throw with the first error. */
export const decodeRecords = (data: unknown): RestaurantRecord[] =>
  Schema.decodeUnknownSync(Schema.Array(RestaurantRecordSchema))(data)

export const decodeBudgetRecords = (data: unknown): BudgetRecord[] =>
  Schema.decodeUnknownSync(Schema.Array(BudgetRecordSchema))(data)

export const decodeTopSections = (data: unknown): TopSections =>
  Schema.decodeUnknownSync(TopSectionsSchema)(data)
