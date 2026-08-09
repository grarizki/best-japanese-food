// Prerender step: run after `vite build` for each app.
// 1. Builds the SSR entry (entry-server.ts) with vite.
// 2. renderToString -> app HTML.
// 3. Inlines the emitted CSS into <style> (kills the render-blocking request).
// 4. Sets <title>/meta and injects the server-rendered HTML into #app.
// Usage: run from an app directory (pnpm --filter <app> run build).
import { build } from 'vite'
import { readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const appDir = process.cwd()
const dist = path.join(appDir, 'dist')
const serverOut = path.join(appDir, 'dist-server')

await build({
  build: {
    ssr: 'src/entry-server.ts',
    outDir: serverOut,
    emptyOutDir: true,
  },
})

const { render } = await import(pathToFileURL(path.join(serverOut, 'entry-server.js')).href)
const { html, title, description } = await render()

const indexFile = path.join(dist, 'index.html')
let index = await readFile(indexFile, 'utf8')

const assetsDir = path.join(dist, 'assets')
const css = await Promise.all(
  (await readdirSafe(assetsDir))
    .filter((f) => f.endsWith('.css'))
    .map(async (f) => readFile(path.join(assetsDir, f), 'utf8')),
).then((parts) => parts.join('\n'))

index = index
  .replace(/<link rel="stylesheet"[^>]*>\s*/g, '')
  .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  .replace(/<meta name="description" content="[^"]*"\/?>/i, `<meta name="description" content="${description}" />`)
  .replace(/(<meta charset="UTF-8" \/>)/, `$1\n    <style>${css}</style>`)
  .replace('<div id="app"></div>', `<div id="app">${html}</div>`)

await writeFile(indexFile, index)

for (const f of await readdirSafe(assetsDir)) {
  if (f.endsWith('.css')) await rm(path.join(assetsDir, f))
}
await rm(serverOut, { recursive: true, force: true })
console.log(`prerendered ${dist}`)

async function readdirSafe(dir) {
  try {
    return await readdir(dir)
  } catch {
    return []
  }
}
