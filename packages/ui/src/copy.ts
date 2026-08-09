export interface AppCopy {
  eyebrow: string
  hero: string
  subhead: string
  metaTitle: string
  metaDescription: string
  intro: string
  valueProps: [string, string, string]
  cta: string
}

export const SITE_NAME = 'Best Japanese Food'

export const FOOTER_ATTRIBUTION =
  'Ratings, review counts and saves from Tabelog. Railway and station data from MLIT National Land Numerical Information (国土数値情報).'

export const CITIES = [
  { key: 'all', label: 'All Japan', ja: '全国' },
  { key: 'tokyo', label: 'Tokyo', ja: '東京' },
  { key: 'osaka', label: 'Osaka', ja: '大阪' },
  { key: 'kyoto', label: 'Kyoto', ja: '京都' },
  { key: 'nara', label: 'Nara', ja: '奈良' },
] as const
