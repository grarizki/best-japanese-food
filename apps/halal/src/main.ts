import { createSSRApp } from 'vue'
import HalalApp from './HalalApp.vue'
import { data } from './data'
import { copy } from './copy'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}

createSSRApp(HalalApp, { data, copy }).mount('#app')
