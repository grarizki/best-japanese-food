import { createSSRApp } from 'vue'
import { Top100App, type TopSection } from '@bff/ui'
import '@bff/ui/src/style.css'
import raw from './generated/data.json'
import { copy } from './copy'

const sections: TopSection[] = raw.sections

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}

createSSRApp(Top100App, { sections, copy }).mount('#app')
