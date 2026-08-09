import { describe, expect, it } from 'vitest'
import {
  decodeBudgetRecords,
  decodeRecords,
  decodeTopSections,
  normalizeRecord,
  toBudgetYen,
  toUiRecord,
  toUiRecordFromTop,
} from './schema'

const base = {
  store_id: '1',
  name_ja: '店',
  name_romaji: 'mise',
  prefecture: 'tokyo',
  prefecture_ja: '東京都',
  url: 'https://tabelog.com/tokyo/1/',
  genre_ja: '寿司',
  genre_en: 'Sushi',
  genres_ja: ['寿司'],
  rating: 3.9,
  review_cnt: 150,
  save_cnt: 500,
  budget_dinner: '￥2,000～￥2,999',
  budget_lunch: null,
  score: null,
  nearest_station_ja: '駅',
  nearest_station_romaji: 'eki',
  nearest_distance_m: 100,
  transport: {
    station_ja: '駅',
    station_romaji: 'eki',
    distance_m: 100,
    lines_ja: ['山手線'],
    lines_romaji: ['yamanotesen'],
    operators: ['JR東日本'],
  },
}

describe('decodeRecords', () => {
  it('decodes a valid record', () => {
    const [r] = decodeRecords([base])
    expect(r.store_id).toBe('1')
    expect(r.rating).toBe(3.9)
  })

  it('fills missing nullable keys before decoding', () => {
    const rest = { ...base }
    delete rest.name_romaji
    const [r] = decodeRecords([normalizeRecord(rest) as never])
    expect(r.name_romaji).toBeNull()
  })

  it('rejects a malformed record (wrong prefecture)', () => {
    expect(() => decodeRecords([{ ...base, prefecture: 'hokkaido' }])).toThrow()
  })

  it('rejects when transport.distance_m is null? no — allows null', () => {
    const withNull = { ...base, transport: { ...base.transport, distance_m: null } }
    const [r] = decodeRecords([withNull])
    expect(r.transport?.distance_m).toBeNull()
  })
})

describe('decodeBudgetRecords', () => {
  it('accepts the budget_max_yen field', () => {
    const [r] = decodeBudgetRecords([{ ...base, budget_max_yen: 2999 }])
    expect(r.budget_max_yen).toBe(2999)
  })
})

describe('decodeTopSections', () => {
  it('decodes sparse ranked records', () => {
    const data = {
      フレンチ: [
        {
          rank: 1,
          store_id: '2',
          name_ja: '店',
          name_romaji: 'mise',
          genre_ja: 'フレンチ',
          genre_en: 'French',
          prefecture: 'tokyo',
          budget_dinner: '￥50,000～￥59,999',
          budget_lunch: null,
          rating: 4.2,
          review_cnt: 300,
          score: null,
          url: 'https://tabelog.com/tokyo/2/',
        },
      ],
    }
    const sections = decodeTopSections(data)
    const [r] = sections['フレンチ']
    expect(r.rank).toBe(1)
    const ui = toUiRecordFromTop(r)
    expect(ui.rank).toBe(1)
    expect(ui.genresJa).toEqual([])
    expect(ui.prefecture).toBe('tokyo')
  })
})

describe('toBudgetYen', () => {
  it('parses the first number from a Tabelog budget string', () => {
    expect(toBudgetYen('￥15,000～￥19,999')).toBe(15000)
    expect(toBudgetYen('～￥999')).toBe(999)
  })
  it('returns null for null input', () => {
    expect(toBudgetYen(null)).toBeNull()
  })
})

describe('toUiRecord', () => {
  it('prunes crawler-only fields', () => {
    const ui = toUiRecord(base as never)
    expect(ui).toHaveProperty('id')
    expect(ui).not.toHaveProperty('area_code')
    expect(ui).not.toHaveProperty('score')
    expect(ui.linesJa).toEqual(['山手線'])
    expect(ui.budgetMaxYen).toBeNull()
  })
})
