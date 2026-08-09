import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Top100App, type TopSection } from '@bff/ui'
import raw from './generated/data.json'
import { copy } from './copy'

const sections: TopSection[] = raw.sections

export async function render() {
  const app = createSSRApp(Top100App, { sections, copy })
  return {
    html: await renderToString(app),
    title: copy.metaTitle,
    description: copy.metaDescription,
  }
}
