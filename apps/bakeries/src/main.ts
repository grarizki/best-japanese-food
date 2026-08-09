import { createSSRApp } from 'vue'
import { FoodApp } from '@bff/ui'
import '@bff/ui/src/style.css'
import data from './generated/data.json'
import { copy } from './copy'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}

createSSRApp(FoodApp, { data, copy }).mount('#app')
