// Serves the built client (client/dist) in production, with cache headers for the local fonts
// and images. Their file names carry no content hash, so they are cached for a while but never
// marked immutable. Keep in sync with the `headers` block in client/vercel.json.
import express from 'express'
import { join } from 'path'

const CACHE_RULES = [
  { prefix: '/fonts/', value: 'public, max-age=2592000' },
  { prefix: '/images/', value: 'public, max-age=604800, stale-while-revalidate=86400' },
]

/** The Cache-Control value for a URL path, or null to keep the default. */
export function cacheControlFor(urlPath) {
  return CACHE_RULES.find((rule) => urlPath.startsWith(rule.prefix))?.value ?? null
}

/** Serves `distDir` and falls back to index.html for every other GET (the SPA's routes). */
export function serveClient(app, distDir) {
  app.use(
    express.static(distDir, {
      setHeaders(res, filePath) {
        const urlPath = `/${filePath.slice(distDir.length).split(/[\\/]+/).filter(Boolean).join('/')}`
        const value = cacheControlFor(urlPath)
        if (value) res.setHeader('Cache-Control', value)
      },
    }),
  )
  app.get('*', (req, res) => {
    res.sendFile(join(distDir, 'index.html'))
  })
}
