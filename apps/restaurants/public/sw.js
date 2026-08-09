// Cache-first for this app's static assets (content-hashed, immutable).
// GitHub Pages forces 10-minute cache headers, so without this service worker
// repeat visits re-download every asset. Bump CACHE_NAME on each deploy.
const CACHE_NAME = 'bff-restaurants-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (
    request.method !== 'GET' ||
    request.mode === 'navigate' ||
    !url.pathname.startsWith(self.registration.scope)
  ) {
    return
  }
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const hit = await cache.match(request)
      if (hit) return hit
      const response = await fetch(request)
      if (response.ok) cache.put(request, response.clone())
      return response
    }),
  )
})
