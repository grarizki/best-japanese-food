// Public API surface of @bff/ui — the only module apps/* may import (see
// entry-server.ts: `import { FoodApp } from '@bff/ui'`).
// BFF lesson: like an API endpoint list, this boundary is deliberate. Consumers
// get components + the store factory + copy constants, never raw data access.
import FoodApp from './FoodApp.vue'
import Top100App from './Top100App.vue'
import FoodCard from './FoodCard.vue'
import { createEffectStore } from './store'
import { CITIES, FOOTER_ATTRIBUTION, SITE_NAME, type AppCopy } from './copy'
import type { TopSection } from './types'

export { FoodApp, Top100App, FoodCard, createEffectStore, CITIES, FOOTER_ATTRIBUTION, SITE_NAME }
export type { AppCopy, TopSection }
