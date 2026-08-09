import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { FoodApp } from '@bff/ui'
import data from './generated/data.json'
import { copy } from './copy'

export async function render() {
  const app = createSSRApp(FoodApp, { data, copy })
  return {
    html: await renderToString(app),
    title: copy.metaTitle,
    description: copy.metaDescription,
  }
}
