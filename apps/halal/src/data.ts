export interface HalalRecord {
  id: string
  name: string
  nameJa: string
  cuisine: string
  area: string
  areaJa: string
  prefecture: 'tokyo' | 'osaka'
  certification: string
  features: string[]
  description: string
  url: string
  source: string
}

export interface HalalData {
  meta: {
    source: string
    last_updated: string
    total_tokyo: number
    total_osaka: number
    notes: string
  }
  tokyo: HalalRecord[]
  osaka: HalalRecord[]
}

import raw from './generated/data.json'

export const data: HalalData = raw as HalalData
