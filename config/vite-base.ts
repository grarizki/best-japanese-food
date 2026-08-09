import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Shared Vite config for the 5 category apps. Each app deploys to a sub-path
// of the GitHub Pages site: /best-japanese-food/<slug>/.
// Note: keep the plugin import extensionless-free; this file is imported by
// app vite.config.ts files with an explicit .ts extension.
export function appConfig(slug: string) {
  return defineConfig({
    base: `/best-japanese-food/${slug}/`,
    plugins: [vue()],
    build: {
      target: 'es2022',
      cssCodeSplit: true,
    },
  })
}
