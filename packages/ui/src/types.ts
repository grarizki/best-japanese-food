// UI-local types that compose the shared contract (@bff/schema's UiRecord).
// BFF lesson: the client may *compose* the contract, never redefine it.
import type { UiRecord } from '@bff/schema'

export interface TopSection {
  name: string
  records: UiRecord[]
}
