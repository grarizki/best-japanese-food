import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { HalalApp } from './HalalApp.vue'
import { data } from './data'
import { copy } from './copy'

export async function render() {
  const app = createSSRApp(HalalApp, { data, copy })
  return {
    html: await renderToString(app),
    title: copy.metaTitle,
    description: copy.metaDescription,
  }
}
