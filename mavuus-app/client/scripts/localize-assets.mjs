// Localizes remote assets: finds every file the app loads from the live Webflow CDN or from
// the remote avatar service, keeps a manifest of them, downloads them into public/ and points the source at the
// local copies, so the site no longer depends on either host.
//
// Usage (from mavuus-app/client):
//   node scripts/localize-assets.mjs --scan      writes scripts/assets-manifest.json only
//   node scripts/localize-assets.mjs --download  fetches the files the manifest lists that are missing
//   node scripts/localize-assets.mjs --rewrite   replaces the remote URLs in source with local paths
// Modes combine (--scan --download --rewrite). Every mode is safe to run again: the scan keeps the
// paths already in the manifest, the download skips files on disk, and the rewrite only touches
// remote URLs.
//
// The scan covers every text source file in mavuus-app (outside node_modules, build output and
// public/): URLs in strings, srcset lists and CSS url(), template literals built from a CDN prefix
// constant, and the size variants that src/data/live builds at runtime from its width tables.
//
// Local names: the Webflow hash prefix is dropped and the name is decoded and slugified
// ("668f..._Group%203276-p-500.webp" -> "group-3276-p-500.webp"). Size variants keep their
// "-p-<width>" suffix and stay in the same folder as their original, because the srcset builders
// derive one from the other. Folders follow where a file is used (see FOLDERS); a file used on
// more than one page goes to images/shared/. Avatars become images/avatars/avatar-NN.jpg, numbered
// in URL order the first time they are seen and never renumbered.
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// The two hosts the app used to load assets from. The no-remote-assets lint rule bans these and
// the other Webflow asset hosts; this file is the one place that names them on purpose.
// ds-allow no-remote-assets: the localize script has to name the hosts it downloads from
export const WEBFLOW_HOST = 'cdn.prod.website-files.com'
// ds-allow no-remote-assets: the localize script has to name the hosts it downloads from
export const PRAVATAR_HOST = 'i.pravatar.cc'
// Host names (or suffixes) the lint rule and the e2e guard refuse.
// ds-allow no-remote-assets: the ban list itself
export const BANNED_HOST_SUFFIXES = ['website-files.com', 'webflow.com', 'webflow.io', 'pravatar.cc']

const HOSTS = [WEBFLOW_HOST, PRAVATAR_HOST]
const URL_RE = new RegExp(`https://(?:${HOSTS.map((h) => h.replace(/\./g, '\\.')).join('|')})/[^\\s"'\`<>\\\\]+`, 'g')
const WEBFLOW_ID = /^[0-9a-f]{24}$/
const FONT_EXT = new Set(['woff2', 'woff', 'ttf', 'otf'])

// Folder for a use site: a file path, optionally with the export block it sits in (file#BLOCK).
const FOLDERS = [
  [/data\/live\/home\.js#COMPANY_LOGOS$/, 'logos'],
  [/data\/live\/home\.js(#|$)/, 'home'],
  [/data\/live\/about\.js(#|$)/, 'about'],
  [/data\/live\/services\.js(#|$)/, 'services'],
  [/data\/live\/membership\.js(#|$)/, 'membership'],
  [/data\/live\/faq\.js(#|$)/, 'faq'],
  [/data\/live\/posts\.js#LIVE_EVENTS$/, 'resources'],
  [/data\/live\/posts\.js(#|$)/, 'posts'],
  [/data\/live\/videos\.js(#|$)/, 'videos'],
  [/pages\/public\/ContactPage\.jsx(#|$)/, 'contact'],
  [/(PublicHeader\.jsx|lib\/brand\.js)(#|$)/, 'logos'],
]

// Width tables that src/data/live uses to build srcsets at runtime as `${base}-p-${w}${ext}`
// (the last width is the original). Those variant URLs never appear in source, so the scan
// expands them here. key 'assetId' tables are keyed by the Webflow asset id; key 'slug' tables
// by a video slug, looked up in the `slugs` file.
export const VARIANT_TABLES = [
  { file: 'client/src/data/live/posts.js', name: 'IMAGE_WIDTHS', key: 'assetId' },
  { file: 'client/src/data/live/home.js', name: 'VIDEO_THUMB_WIDTHS', key: 'slug', slugs: 'client/src/data/live/videos.js' },
]

const SKIP_DIRS = new Set(['node_modules', 'dist', 'storybook-static', 'test-results', 'playwright-report', '.git', '.auth'])
// Skipped by path, since src/pages/public/ must still be scanned.
const SKIP_PATHS = new Set(['client/public', 'client/e2e/screenshots', 'server/uploads'])
const SCAN_EXT = /\.(?:jsx?|mjs|cjs|css|html|mdx?|sql)$/
const MANIFEST_NAME = 'assets-manifest.json'

/** Returns the remote asset URLs in `text`, in order (repeats included). */
export function extractUrls(text) {
  const out = []
  for (const m of text.matchAll(URL_RE)) {
    let url = m[0]
    // Trim punctuation that ends the surrounding code, and a closing paren of an unquoted url().
    url = url.replace(/[,;]+$/, '')
    while (url.endsWith(')') && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length) url = url.slice(0, -1)
    const { pathname } = new URL(url)
    if (url.includes(PRAVATAR_HOST) || /\.[a-z0-9]+$/i.test(pathname)) out.push(url)
  }
  return out
}

/**
 * Finds `const NAME = '<remote prefix>'` declarations and returns the text with `${NAME}`
 * expanded, so template literals built from a CDN prefix show up as full URLs.
 */
export function expandConstants(source) {
  const constants = []
  const re = /^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(['"])(https:\/\/[^'"]+)\2\s*;?\s*$/gm
  for (const m of source.matchAll(re)) {
    if (HOSTS.some((h) => m[3].startsWith(`https://${h}/`)) && extractUrls(m[3]).length === 0) {
      constants.push({ name: m[1], value: m[3] })
    }
  }
  let text = source
  for (const { name, value } of constants) text = text.split(`\${${name}}`).join(value)
  return { text, constants }
}

function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file'
}

/** Splits a Webflow URL into its family (asset id), slugified stem, size variant and extension. */
export function localNameFor(url) {
  const { pathname } = new URL(url)
  const raw = decodeURIComponent(pathname.split('/').pop())
  const under = raw.indexOf('_')
  const id = under > 0 && WEBFLOW_ID.test(raw.slice(0, under)) ? raw.slice(0, under) : null
  const name = id ? raw.slice(under + 1) : raw
  const dot = name.lastIndexOf('.')
  const ext = name.slice(dot + 1).toLowerCase()
  let stem = name.slice(0, dot)
  let variant = null
  const v = /-p-(\d+)$/.exec(stem)
  if (v) {
    variant = Number(v[1])
    stem = stem.slice(0, v.index)
  }
  const slug = slugify(stem)
  return { family: id || pathname, stem: slug, variant, ext, file: `${slug}${variant ? `-p-${variant}` : ''}.${ext}` }
}

/** Picks the public/ folder for a file from the places it is used. */
export function folderFor(usedIn, ext) {
  if (FONT_EXT.has(ext)) return 'fonts/fixel'
  const folders = new Set(
    usedIn.map((use) => FOLDERS.find(([re]) => re.test(use))?.[1] ?? 'shared'),
  )
  if (folders.size === 1) return `images/${[...folders][0]}`
  if ([...folders].every((f) => f === 'posts' || f === 'videos')) return 'images/posts'
  return 'images/shared'
}

/** Names the export block (`export const NAME`) that contains `offset`, if any. */
function blockAt(text, offset) {
  let name = null
  for (const m of text.slice(0, offset).matchAll(/^export\s+const\s+([A-Za-z_$][\w$]*)/gm)) name = m[1]
  return name
}

function parseTable(text, name) {
  const start = text.search(new RegExp(`\\b${name}\\s*=\\s*\\{`))
  if (start < 0) return {}
  const end = text.indexOf('\n}', start)
  const body = text.slice(start, end < 0 ? undefined : end)
  const table = {}
  for (const m of body.matchAll(/['"]([^'"]+)['"]\s*:\s*\[([\d,\s]+)\]/g)) {
    table[m[1]] = m[2].split(',').map((n) => Number(n.trim())).filter(Boolean)
  }
  return table
}

function variantUrls(url, widths) {
  const dot = url.lastIndexOf('.')
  return widths.slice(0, -1).map((w) => `${url.slice(0, dot)}-p-${w}${url.slice(dot)}`)
}

/**
 * Builds the manifest from `files` ({ relativePath: text }, paths relative to mavuus-app).
 * `previous` is the manifest from the last run: its local paths and avatar numbers are kept, and
 * its entries stay even when the source no longer names the remote URL (after --rewrite).
 */
export function buildManifest({ files, previous = { assets: [] }, tables = VARIANT_TABLES }) {
  const uses = new Map() // url -> Set of use sites (file#BLOCK)
  const variantOf = new Map()
  const add = (url, site) => {
    if (!uses.has(url)) uses.set(url, new Set())
    if (site) uses.get(url).add(site)
  }
  const expanded = {}
  for (const [file, source] of Object.entries(files)) {
    const { text } = expandConstants(source)
    expanded[file] = text
    for (const m of text.matchAll(URL_RE)) {
      const [url] = extractUrls(m[0])
      if (!url) continue
      const block = blockAt(text, m.index)
      add(url, block ? `${file}#${block}` : file)
    }
  }
  for (const table of tables) {
    const text = expanded[table.file]
    if (!text) continue
    const widths = parseTable(text, table.name)
    let candidates = []
    if (table.key === 'assetId') {
      candidates = [...uses.keys()].filter((u) => !u.includes(PRAVATAR_HOST) && localNameFor(u).variant === null && widths[localNameFor(u).family]).map((u) => [u, widths[localNameFor(u).family]])
    } else {
      const slugText = expanded[table.slugs] || ''
      for (const m of slugText.matchAll(/"slug":\s*"([^"]+)"[^{}]*?"thumbnail":\s*"([^"]+)"/g)) {
        if (widths[m[1]] && uses.has(m[2])) candidates.push([m[2], widths[m[1]]])
      }
    }
    for (const [url, list] of candidates) {
      for (const v of variantUrls(url, list)) {
        add(v, null)
        if (!variantOf.has(v)) variantOf.set(v, url)
      }
    }
  }

  const prev = new Map(previous.assets.map((a) => [a.url, a]))
  // Previous entries whose URL is gone from source still belong in the manifest.
  for (const a of previous.assets) {
    if (!uses.has(a.url)) uses.set(a.url, new Set())
    if (a.variantOf && !variantOf.has(a.url)) variantOf.set(a.url, a.variantOf)
  }
  // Local paths in source count as uses too, so usedIn stays right after the rewrite.
  for (const [url, sites] of uses) {
    const known = prev.get(url)
    if (!known) continue
    for (const [file, text] of Object.entries(expanded)) {
      if (text.includes(known.localPath)) {
        const i = text.indexOf(known.localPath)
        const block = blockAt(text, i)
        sites.add(block ? `${file}#${block}` : file)
      }
    }
  }
  // Drop entries nothing references any more: no remote URL, no local path and no used original.
  for (const [url, sites] of [...uses]) {
    const parent = variantOf.get(url)
    if (sites.size === 0 && !(parent && uses.get(parent)?.size > 0)) {
      uses.delete(url)
      variantOf.delete(url)
    }
  }

  const fileOf = (site) => site.split('#')[0]
  const familySites = new Map()
  for (const [url, sites] of uses) {
    if (url.includes(PRAVATAR_HOST)) continue
    const fam = localNameFor(url).family
    if (!familySites.has(fam)) familySites.set(fam, new Set())
    for (const s of sites) familySites.get(fam).add(s)
  }

  const taken = new Set() // folder/stem, family-level
  const familyBase = new Map()
  for (const a of previous.assets) {
    if (a.url.includes(PRAVATAR_HOST)) continue
    const base = a.originalPath || a.localPath
    const stemPath = base.replace(/\.[^./]+$/, '').replace(/-p-\d+$/, '')
    familyBase.set(localNameFor(a.url).family, stemPath)
    taken.add(stemPath)
  }
  const avatarNumbers = new Map()
  for (const a of previous.assets) {
    const n = /avatar-(\d+)\.jpg$/.exec(a.localPath)
    if (a.url.includes(PRAVATAR_HOST) && n) avatarNumbers.set(a.url, Number(n[1]))
  }

  const assets = []
  const urls = [...uses.keys()].sort()
  for (const url of urls) {
    const sites = [...uses.get(url)]
    const usedIn = [...new Set((variantOf.has(url) ? [...(uses.get(variantOf.get(url)) || [])] : sites).map(fileOf))].sort()
    const known = prev.get(url)
    let localPath
    if (url.includes(PRAVATAR_HOST)) {
      if (!avatarNumbers.has(url)) {
        const used = new Set(avatarNumbers.values())
        let n = 1
        while (used.has(n)) n++
        avatarNumbers.set(url, n)
      }
      localPath = `/images/avatars/avatar-${String(avatarNumbers.get(url)).padStart(2, '0')}.jpg`
    } else {
      const name = localNameFor(url)
      if (!familyBase.has(name.family)) {
        const folder = folderFor([...familySites.get(name.family)], name.ext)
        let stemPath = `/${folder}/${name.stem}`
        for (let i = 2; taken.has(stemPath); i++) stemPath = `/${folder}/${name.stem}-${i}`
        taken.add(stemPath)
        familyBase.set(name.family, stemPath)
      }
      localPath = `${familyBase.get(name.family)}${name.variant ? `-p-${name.variant}` : ''}.${name.ext}`
    }
    const entry = { url, localPath: known?.localPath ?? localPath }
    if (known?.reused) {
      entry.reused = true
      entry.originalPath = known.originalPath
    }
    if (known?.bytes !== undefined) entry.bytes = known.bytes
    if (known?.contentType !== undefined) entry.contentType = known.contentType
    entry.usedIn = usedIn
    if (variantOf.has(url)) entry.variantOf = variantOf.get(url)
    assets.push(entry)
  }
  assets.sort((a, b) => a.localPath.localeCompare(b.localPath) || a.url.localeCompare(b.url))
  return { assets }
}

/**
 * Rewrites one file: inlines CDN prefix constants, drops the ones no longer used, then swaps
 * every manifest URL for its local path. Returns { text, changed } (number of URLs replaced).
 */
export function rewriteSource(source, manifest) {
  const { text: expanded, constants } = expandConstants(source)
  let text = expanded
  let changed = 0
  const entries = [...manifest.assets].sort((a, b) => b.url.length - a.url.length)
  for (const { url, localPath } of entries) {
    if (!text.includes(url)) continue
    const parts = text.split(url)
    changed += parts.length - 1
    text = parts.join(localPath)
  }
  if (changed === 0) return { text: source, changed: 0 }
  for (const { name } of constants) {
    if ((text.match(new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\b`, 'g')) || []).length === 1) {
      text = text.replace(new RegExp(`^\\s*(?:export\\s+)?const\\s+${name.replace(/\$/g, '\\$')}\\s*=.*\\n`, 'm'), '')
    }
  }
  return { text, changed }
}

// Accepted content types per extension (the CDN sends the nonstandard image/jpg for some JPEGs).
const IMAGE_TYPES = { png: ['image/png'], jpg: ['image/jpeg', 'image/jpg'], jpeg: ['image/jpeg', 'image/jpg'], webp: ['image/webp'], avif: ['image/avif'], svg: ['image/svg+xml'], gif: ['image/gif'] }

/** Returns null when the body looks like the file the URL names, or a reason it doesn't. */
export function checkContent(url, contentType, buffer) {
  if (!buffer || buffer.length === 0) return 'empty body'
  const ext = (/\.([a-z0-9]+)(?:$|\?)/i.exec(new URL(url, 'https://x').pathname)?.[1] || '').toLowerCase()
  const type = (contentType || '').split(';')[0].trim().toLowerCase()
  if (FONT_EXT.has(ext)) {
    if (ext === 'woff2' && buffer.subarray(0, 4).toString('latin1') !== 'wOF2') return 'not a woff2 file'
    if (!/^(?:font\/|application\/(?:font|x-font|octet-stream))/.test(type)) return `unexpected content type ${type}`
    return null
  }
  if (!type.startsWith('image/')) return `unexpected content type ${type || '(none)'}`
  if (IMAGE_TYPES[ext] && !IMAGE_TYPES[ext].includes(type)) return `content type ${type} does not match .${ext}`
  return null
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function hashPublicFiles(publicDir) {
  const bySize = new Map()
  const visit = (dir) => {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) visit(full)
      else {
        const size = fs.statSync(full).size
        if (!bySize.has(size)) bySize.set(size, [])
        bySize.get(size).push(full)
      }
    }
  }
  visit(publicDir)
  return (buffer) => {
    for (const file of bySize.get(buffer.length) || []) {
      if (sha256(fs.readFileSync(file)) === sha256(buffer)) return `/${path.relative(publicDir, file).split(path.sep).join('/')}`
    }
    return null
  }
}

/**
 * Downloads every manifest entry whose file is missing, with `concurrency` parallel requests and
 * up to `retries` attempts each. A file identical to one already in public/ is not written again;
 * the entry points at the existing file instead (except fonts and size-variant families, whose
 * names the srcset builders rely on). Updates bytes and contentType in place.
 */
export async function downloadAssets(manifest, { publicDir, fetchImpl = fetch, concurrency = 6, retries = 4, retryDelayMs = 500, log = () => {} }) {
  const findSame = hashPublicFiles(publicDir)
  const families = new Set(manifest.assets.filter((a) => a.variantOf).map((a) => a.variantOf))
  const result = { fetched: 0, skipped: 0, reused: 0, failed: [] }
  const queue = [...manifest.assets]
  const worker = async () => {
    for (let asset = queue.shift(); asset; asset = queue.shift()) {
      const target = path.join(publicDir, asset.localPath)
      if (fs.existsSync(target) && fs.statSync(target).size > 0) {
        asset.bytes = fs.statSync(target).size
        result.skipped++
        continue
      }
      let lastError = ''
      let done = false
      for (let attempt = 1; attempt <= retries && !done; attempt++) {
        try {
          const response = await fetchImpl(asset.url)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const buffer = Buffer.from(await response.arrayBuffer())
          const contentType = response.headers.get('content-type') || ''
          const problem = checkContent(asset.url.includes(PRAVATAR_HOST) ? asset.localPath : asset.url, contentType, buffer)
          if (problem) throw new Error(problem)
          const ext = path.extname(asset.localPath).slice(1)
          const keepName = FONT_EXT.has(ext) || asset.variantOf || families.has(asset.url)
          const same = keepName ? null : findSame(buffer)
          if (same && same !== asset.localPath) {
            asset.originalPath = asset.localPath
            asset.localPath = same
            asset.reused = true
            result.reused++
          } else {
            fs.mkdirSync(path.dirname(target), { recursive: true })
            fs.writeFileSync(target, buffer)
            result.fetched++
          }
          asset.bytes = buffer.length
          asset.contentType = contentType.split(';')[0].trim()
          done = true
          log(`ok ${asset.localPath}`)
        } catch (error) {
          lastError = error.message
          if (attempt < retries) await new Promise((r) => setTimeout(r, retryDelayMs * attempt))
        }
      }
      if (!done) result.failed.push(`${asset.url}: ${lastError}`)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return result
}

/** Lists the text files the scan reads, relative to `appRoot` (mavuus-app). */
export function listSourceFiles(appRoot) {
  const out = []
  const visit = (dir) => {
    for (const entry of fs.readdirSync(path.join(appRoot, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name) && !SKIP_PATHS.has(rel)) visit(rel)
      } else if (SCAN_EXT.test(entry.name) && !rel.endsWith('scripts/localize-assets.mjs') && !rel.endsWith('scripts/localize-assets.test.mjs')) {
        out.push(rel)
      }
    }
  }
  visit('')
  return out.sort()
}

function readFiles(appRoot) {
  return Object.fromEntries(listSourceFiles(appRoot).map((f) => [f, fs.readFileSync(path.join(appRoot, f), 'utf8')]))
}

/** Runs the CLI. Returns the exit code. */
export async function run(argv, { clientRoot, log = console.log, error = console.error } = {}) {
  const appRoot = path.resolve(clientRoot, '..')
  const publicDir = path.join(clientRoot, 'public')
  const manifestPath = path.join(clientRoot, 'scripts', MANIFEST_NAME)
  const modes = ['--scan', '--download', '--rewrite'].filter((m) => argv.includes(m))
  if (modes.length === 0) {
    error('Pass --scan, --download and/or --rewrite.')
    return 2
  }
  let manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { assets: [] }
  const save = () => fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  let code = 0

  if (argv.includes('--scan')) {
    manifest = buildManifest({ files: readFiles(appRoot), previous: manifest })
    save()
    log(`Manifest: ${manifest.assets.length} file(s).`)
  }
  if (argv.includes('--download')) {
    const result = await downloadAssets(manifest, { publicDir, log })
    save()
    log(`Downloaded ${result.fetched}, reused ${result.reused} identical file(s) already in public/, skipped ${result.skipped} on disk.`)
    if (result.failed.length > 0) {
      error('Failed:')
      for (const f of result.failed) error(`  ${f}`)
      code = 1
    }
  }
  if (argv.includes('--rewrite')) {
    const missing = manifest.assets.filter((a) => !fs.existsSync(path.join(publicDir, a.localPath)))
    if (missing.length > 0) {
      error(`Refusing to rewrite: ${missing.length} file(s) are not downloaded yet (run --download):`)
      for (const a of missing.slice(0, 10)) error(`  ${a.localPath}`)
      return 1
    }
    let total = 0
    for (const [file, text] of Object.entries(readFiles(appRoot))) {
      const { text: next, changed } = rewriteSource(text, manifest)
      if (changed === 0) continue
      fs.writeFileSync(path.join(appRoot, file), next)
      total += changed
      log(`rewrote ${changed} URL(s) in ${file}`)
    }
    log(`Rewrote ${total} URL(s).`)
  }
  return code
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const clientRoot = fileURLToPath(new URL('..', import.meta.url))
  process.exitCode = await run(process.argv.slice(2), { clientRoot })
}
