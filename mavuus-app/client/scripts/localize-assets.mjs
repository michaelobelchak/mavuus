// Localizes remote assets: finds every file the app loads from the live Webflow CDN or the old
// remote avatar service, keeps a manifest of them, stores them in public/ (images as WebP) and
// points the source at the local copies, so the site no longer depends on either host.
//
// Usage (from mavuus-app/client):
//   node scripts/localize-assets.mjs --scan      writes scripts/assets-manifest.json only
//   node scripts/localize-assets.mjs --download  fetches the missing files; images are stored as WebP
//   node scripts/localize-assets.mjs --variants  builds the srcset size variants from the local originals
//   node scripts/localize-assets.mjs --rewrite   replaces the remote URLs in source with local paths
// Modes combine (--scan --download --variants --rewrite). Every mode is safe to run again: the scan
// keeps the paths already in the manifest, the download and variant steps skip files on disk, and
// the rewrite only touches remote URLs. --download and --variants need `cwebp` on the PATH (and
// macOS `sips` for AVIF sources).
//
// The scan covers every text source file in mavuus-app (outside node_modules, build output and
// public/): URLs in strings, srcset lists and CSS url(), template literals built from a CDN prefix
// constant, and the size variants that src/data/live builds at runtime from its width tables.
//
// Images: every raster becomes WebP (lossy quality 82 with alpha kept; lossless for logos and tiny
// graphics; Webflow WebP files that need no resizing are kept as they are), capped at MAX_WIDTH.
// The srcset size variants are not downloaded: --variants resizes the local original to each width.
// SVGs and fonts are stored as they are.
//
// Local names: the Webflow hash prefix is dropped and the name is decoded and slugified
// ("668f..._Group%203276-p-500.webp" -> "group-3276-p-500.webp"). Size variants keep their
// "-p-<width>" suffix and stay in the same folder as their original, because the srcset builders
// derive one from the other. Folders follow where a file is used (see FOLDERS); a file used on
// more than one page goes to images/shared/. Avatars become images/avatars/avatar-NN.webp,
// numbered in URL order the first time they are seen and never renumbered.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// The hosts the app used to load assets from. The no-remote-assets lint rule bans these and the
// other Webflow asset hosts; this file is the one place that names them on purpose.
// ds-allow no-remote-assets: the localize script has to name the hosts it downloads from
export const WEBFLOW_HOST = 'cdn.prod.website-files.com'
// ds-allow no-remote-assets: the localize script has to name the hosts it downloads from
export const PRAVATAR_HOST = 'i.pravatar.cc'
// Host names (or suffixes) the lint rule refuses.
// ds-allow no-remote-assets: the ban list itself
export const BANNED_HOST_SUFFIXES = ['website-files.com', 'webflow.com', 'webflow.io', 'pravatar.cc']

// Widest image stored. The srcset tables ask for up to 2560px, but no page renders an image wider
// than about 1300 CSS pixels, so larger originals are scaled down and the tables capped to match.
export const MAX_WIDTH = 1600
const QUALITY = 82
// Hosts whose URLs name no file: each URL gets a numbered file in its own folder.
const NUMBERED = [{ host: PRAVATAR_HOST, folder: 'images/avatars', prefix: 'avatar' }]

const HOSTS = [WEBFLOW_HOST, PRAVATAR_HOST]
const URL_RE = new RegExp(`https://(?:${HOSTS.map((h) => h.replace(/\./g, '\\.')).join('|')})/[^\\s"'\`<>\\\\]+`, 'g')
const WEBFLOW_ID = /^[0-9a-f]{24}$/
const FONT_EXT = new Set(['woff2', 'woff', 'ttf', 'otf'])
const RASTER_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'])

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
// expands them here. key 'assetId' tables are keyed by the Webflow asset id or, once rewritten,
// by the local path without its extension; key 'slug' tables by a video slug, looked up in the
// `slugs` file.
export const VARIANT_TABLES = [
  { file: 'client/src/data/live/posts.js', name: 'IMAGE_WIDTHS', key: 'assetId' },
  { file: 'client/src/data/live/home.js', name: 'VIDEO_THUMB_WIDTHS', key: 'slug', slugs: 'client/src/data/live/videos.js' },
]

const SKIP_DIRS = new Set(['node_modules', 'dist', 'storybook-static', 'test-results', 'playwright-report', '.git', '.auth'])
// Skipped by path, since src/pages/public/ must still be scanned.
const SKIP_PATHS = new Set(['client/public', 'client/e2e/screenshots', 'server/uploads'])
const SCAN_EXT = /\.(?:jsx?|mjs|cjs|css|html|mdx?|sql)$/
const MANIFEST_NAME = 'assets-manifest.json'

const numberedHost = (url) => NUMBERED.find((n) => url.startsWith(`https://${n.host}/`))

/** Returns the remote asset URLs in `text`, in order (repeats included). */
export function extractUrls(text) {
  const out = []
  for (const m of text.matchAll(URL_RE)) {
    let url = m[0]
    // Trim punctuation that ends the surrounding code or sentence, and a closing paren of an
    // unquoted url().
    url = url.replace(/[,;.]+$/, '')
    while (url.endsWith(')') && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length) url = url.slice(0, -1)
    const { pathname } = new URL(url)
    if (numberedHost(url) || /\.[a-z0-9]+$/i.test(pathname)) out.push(url)
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

/** decodeURIComponent that keeps the raw text when it holds a malformed escape. */
function safeDecode(text) {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

/** Compares strings by code point, so the manifest order is the same on every machine. */
export function compareCodePoints(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file'
}

/**
 * Splits a Webflow URL into its family (asset id), slugified stem, size variant, source extension
 * and stored extension (webp for rasters).
 */
export function localNameFor(url) {
  const { pathname } = new URL(url)
  const raw = safeDecode(pathname.split('/').pop())
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
  const stored = RASTER_EXT.has(ext) ? 'webp' : ext
  return { family: id || pathname, stem: slug, variant, ext, stored, file: `${slug}${variant ? `-p-${variant}` : ''}.${stored}` }
}

/** The Webflow URL of a size variant's original (drops the -p-<width> suffix). */
function originalOf(url) {
  return url.replace(/-p-\d+(\.[a-z0-9]+)$/i, '$1')
}

/** Caps a srcset width table at MAX_WIDTH: wider widths go and the original becomes MAX_WIDTH. */
export function capWidths(widths, max = MAX_WIDTH) {
  if (widths.length === 0 || widths[widths.length - 1] <= max) return widths
  return [...widths.filter((w) => w < max), max]
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
  return capWidths(widths).slice(0, -1).map((w) => `${url.slice(0, dot)}-p-${w}${url.slice(dot)}`)
}

/**
 * Builds the manifest from `files` ({ relativePath: text }, paths relative to mavuus-app).
 * `previous` is the manifest from the last run: its local paths and numbers are kept, and its
 * entries stay even when the source no longer names the remote URL (after --rewrite).
 * Size variants are entries with `variantOf` (their original's URL) and `width`; they are built
 * by --variants, not downloaded.
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
  // A variant named in source needs its original, which --variants resizes.
  for (const url of [...uses.keys()]) {
    if (numberedHost(url) || localNameFor(url).variant === null) continue
    const original = originalOf(url)
    add(original, null)
    for (const s of uses.get(url)) uses.get(original).add(s)
    variantOf.set(url, original)
  }
  // Where a Webflow family's files go (folder/stem): from the last manifest, or as it will be
  // named. After --rewrite the assetId tables are keyed by this path instead of the asset id.
  const previousBase = new Map()
  for (const a of previous.assets) {
    if (!numberedHost(a.url)) previousBase.set(localNameFor(a.url).family, a.localPath.replace(/\.[^./]+$/, '').replace(/-p-\d+$/, ''))
  }
  const stemPathOf = (url) => {
    const name = localNameFor(url)
    if (previousBase.has(name.family)) return previousBase.get(name.family)
    const sites = [...uses].filter(([u]) => !numberedHost(u) && localNameFor(u).family === name.family).flatMap(([, s]) => [...s])
    return `/${folderFor(sites, name.ext)}/${name.stem}`
  }
  for (const table of tables) {
    const text = expanded[table.file]
    if (!text) continue
    const widths = parseTable(text, table.name)
    let candidates = []
    if (table.key === 'assetId') {
      for (const u of uses.keys()) {
        if (numberedHost(u) || localNameFor(u).variant !== null) continue
        const list = widths[localNameFor(u).family] ?? widths[stemPathOf(u)]
        if (list) candidates.push([u, list])
      }
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
  // Local paths in source count as uses too, so usedIn stays right after the rewrite. Tests that
  // name a local file as an example are not uses.
  for (const [url, sites] of uses) {
    const known = prev.get(url)
    if (!known) continue
    for (const [file, text] of Object.entries(expanded)) {
      if (/\.test\.[cm]?jsx?$/.test(file)) continue
      const i = text.indexOf(known.localPath)
      if (i < 0) continue
      const block = blockAt(text, i)
      sites.add(block ? `${file}#${block}` : file)
    }
  }
  // Drop entries nothing references any more. A variant stays while its original is used; an
  // original stays while one of its variants is used, since --variants builds them from it.
  const used = (url) => uses.get(url)?.size > 0
  const keep = new Set([...uses.keys()].filter((url) => used(url) || used(variantOf.get(url))))
  for (const url of [...keep]) if (variantOf.has(url)) keep.add(variantOf.get(url))
  for (const url of [...uses.keys()]) {
    if (keep.has(url)) continue
    uses.delete(url)
    variantOf.delete(url)
  }

  const fileOf = (site) => site.split('#')[0]
  const familySites = new Map()
  for (const [url, sites] of uses) {
    if (numberedHost(url)) continue
    const fam = localNameFor(url).family
    if (!familySites.has(fam)) familySites.set(fam, new Set())
    for (const s of sites) familySites.get(fam).add(s)
  }

  const taken = new Set() // folder/stem, family-level
  const familyBase = new Map()
  const numbers = new Map() // url -> n, per numbered host
  for (const a of previous.assets) {
    const numbered = numberedHost(a.url)
    if (numbered) {
      const n = new RegExp(`${numbered.prefix}-(\\d+)\\.\\w+$`).exec(a.localPath)
      if (n) numbers.set(a.url, Number(n[1]))
      continue
    }
    const stemPath = a.localPath.replace(/\.[^./]+$/, '').replace(/-p-\d+$/, '')
    familyBase.set(localNameFor(a.url).family, stemPath)
    taken.add(stemPath)
  }

  const assets = []
  const urls = [...uses.keys()].sort()
  for (const url of urls) {
    const sites = [...uses.get(url)]
    const usedIn = [...new Set((variantOf.has(url) ? [...(uses.get(variantOf.get(url)) || [])] : sites).map(fileOf))].sort()
    const known = prev.get(url)
    const numbered = numberedHost(url)
    let localPath
    if (numbered) {
      if (!numbers.has(url)) {
        const used = new Set(urls.filter((u) => numberedHost(u) === numbered && numbers.has(u)).map((u) => numbers.get(u)))
        let n = 1
        while (used.has(n)) n++
        numbers.set(url, n)
      }
      localPath = `/${numbered.folder}/${numbered.prefix}-${String(numbers.get(url)).padStart(2, '0')}.webp`
    } else {
      const name = localNameFor(url)
      if (!familyBase.has(name.family)) {
        const folder = folderFor([...familySites.get(name.family)], name.ext)
        let stemPath = `/${folder}/${name.stem}`
        for (let i = 2; taken.has(stemPath); i++) stemPath = `/${folder}/${name.stem}-${i}`
        taken.add(stemPath)
        familyBase.set(name.family, stemPath)
      }
      localPath = `${familyBase.get(name.family)}${name.variant ? `-p-${name.variant}` : ''}.${name.stored}`
    }
    const entry = { url, localPath: known?.localPath ?? localPath }
    for (const key of ['bytes', 'contentType', 'width', 'lossless', 'sourceSize']) {
      if (known?.[key] !== undefined) entry[key] = known[key]
    }
    entry.usedIn = usedIn
    if (variantOf.has(url)) {
      entry.variantOf = variantOf.get(url)
      entry.width = localNameFor(url).variant
    }
    assets.push(entry)
  }
  assets.sort((a, b) => compareCodePoints(a.localPath, b.localPath) || compareCodePoints(a.url, b.url))
  return { assets }
}

/** In each srcset list, drops an entry whose width descriptor an earlier entry already has. */
export function dedupeSrcsets(text) {
  return text.replace(/[^\s,'"`]+ \d+w(?:,\s*[^\s,'"`]+ \d+w)+/g, (list) => {
    const seen = new Set()
    return list
      .split(/,\s*/)
      .filter((entry) => {
        const width = entry.split(' ').pop()
        if (seen.has(width)) return false
        seen.add(width)
        return true
      })
      .join(', ')
  })
}

/**
 * Rewrites one file: inlines CDN prefix constants, drops the ones no longer used, then swaps
 * every manifest URL for its local path. A srcset width descriptor wider than the stored file
 * (an original capped at MAX_WIDTH) is lowered to the stored width. Returns { text, changed }.
 */
export function rewriteSource(source, manifest) {
  const { text: expanded, constants } = expandConstants(source)
  let text = expanded
  let changed = 0
  const entries = [...manifest.assets].sort((a, b) => b.url.length - a.url.length)
  for (const { url, localPath, width, variantOf } of entries) {
    if (!text.includes(url)) continue
    const parts = text.split(url)
    changed += parts.length - 1
    text = parts.join(localPath)
    if (width && !variantOf) {
      const descriptor = new RegExp(`(${localPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}) (\\d+)w`, 'g')
      text = text.replace(descriptor, (all, p, w) => (Number(w) > width ? `${p} ${width}w` : all))
    }
  }
  if (changed === 0) return { text: source, changed: 0 }
  // A CDN prefix constant nothing else uses any more goes, unless it is exported.
  for (const { name } of constants) {
    const id = name.replace(/\$/g, '\\$')
    if ((text.match(new RegExp(`\\b${id}\\b`, 'g')) || []).length === 1) {
      text = text.replace(new RegExp(`^[ \\t]*const[ \\t]+${id}[ \\t]*=.*\\n`, 'm'), '')
    }
  }
  return { text: dedupeSrcsets(text), changed }
}

// Accepted content types per extension (the CDN sends the nonstandard image/jpg for some JPEGs).
const IMAGE_TYPES = { png: ['image/png'], jpg: ['image/jpeg', 'image/jpg'], jpeg: ['image/jpeg', 'image/jpg'], webp: ['image/webp'], avif: ['image/avif'], svg: ['image/svg+xml'], gif: ['image/gif'] }

/** Returns null when the body looks like the file the URL names, or a reason it doesn't. */
export function checkContent(url, contentType, buffer) {
  if (!buffer || buffer.length === 0) return 'empty body'
  const ext = numberedHost(url) ? '' : (/\.([a-z0-9]+)$/i.exec(new URL(url).pathname)?.[1] || '').toLowerCase()
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

/** Writes `target` through a .tmp file and a rename, so a crash never leaves half a file. */
function writeAtomically(target, data) {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  const tmp = `${target}.tmp`
  fs.writeFileSync(tmp, data)
  fs.renameSync(tmp, target)
}

/** Reads a WebP file's pixel size from its header. Returns { width, height } or null. */
export function webpSize(buffer) {
  if (buffer.length < 30 || buffer.toString('latin1', 0, 4) !== 'RIFF' || buffer.toString('latin1', 8, 12) !== 'WEBP') return null
  const chunk = buffer.toString('latin1', 12, 16)
  if (chunk === 'VP8X') return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) }
  if (chunk === 'VP8 ') return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff }
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21)
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }
  }
  return null
}

/** cwebp arguments for one image; `resize` is [width, height]. */
export function webpArgs({ lossless, resize }) {
  const quality = lossless ? ['-lossless', '-z', '9'] : ['-q', String(QUALITY), '-m', '6', '-sharp_yuv', '-alpha_q', '100']
  return ['-quiet', '-metadata', 'none', ...quality, ...(resize ? ['-resize', String(resize[0]), String(resize[1])] : [])]
}

/**
 * Size of an image scaled to `width`, with the height rounded to the nearest pixel as the Webflow
 * CDN does for its -p-<width> variants (cwebp's own rounding is 1px off on some), so pages keep the
 * same layout.
 */
export function scaledSize(size, width) {
  return [width, Math.round((size.height * width) / size.width)]
}

/** Logos and tiny PNG graphics are stored lossless; photos and thumbnails lossy. */
export function wantsLossless(localPath, ext, sourceBytes) {
  return localPath.startsWith('/images/logos/') || (ext === 'png' && sourceBytes < 10_000)
}

/**
 * Turns a downloaded image into the stored WebP at `target`: AVIF is decoded with sips first, a
 * WebP that needs no resizing is kept byte for byte, anything wider than MAX_WIDTH is scaled down.
 * Returns { width, lossless }, plus sourceSize ([width, height] before scaling) when it was scaled.
 */
function storeImage(buffer, ext, target, localPath, run = execFileSync) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'localize-'))
  try {
    let source = path.join(dir, `source.${ext}`)
    fs.writeFileSync(source, buffer)
    if (ext === 'avif') {
      const png = path.join(dir, 'source.png')
      run('sips', ['-s', 'format', 'png', source, '--out', png], { stdio: 'ignore' })
      source = png
    }
    const lossless = wantsLossless(localPath, ext, buffer.length)
    const encoded = path.join(dir, 'encoded.webp')
    let result
    if (ext === 'webp' && (webpSize(buffer)?.width ?? Infinity) <= MAX_WIDTH) {
      fs.writeFileSync(encoded, buffer)
      result = { width: webpSize(buffer).width, lossless: false }
    } else {
      run('cwebp', [...webpArgs({ lossless }), source, '-o', encoded])
      const size = webpSize(fs.readFileSync(encoded))
      result = { width: size?.width, lossless }
      if (size?.width > MAX_WIDTH) {
        run('cwebp', [...webpArgs({ lossless, resize: scaledSize(size, MAX_WIDTH) }), source, '-o', encoded])
        result = { width: MAX_WIDTH, lossless, sourceSize: [size.width, size.height] }
      }
    }
    writeAtomically(target, fs.readFileSync(encoded))
    return result
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * Downloads every manifest entry whose file is missing (size variants excluded; --variants builds
 * them), with `concurrency` parallel requests and up to `retries` attempts each. Images are stored
 * as WebP through `store` (cwebp by default). Updates bytes, contentType, width and lossless.
 */
export async function downloadAssets(manifest, { publicDir, fetchImpl = fetch, store = storeImage, concurrency = 6, retries = 4, retryDelayMs = 500, log = () => {} }) {
  const result = { fetched: 0, skipped: 0, failed: [] }
  const queue = manifest.assets.filter((a) => !a.variantOf)
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
          const contentType = (response.headers.get('content-type') || '').split(';')[0].trim()
          const problem = checkContent(asset.url, contentType, buffer)
          if (problem) throw new Error(problem)
          const ext = numberedHost(asset.url) ? 'jpg' : localNameFor(asset.url).ext
          if (RASTER_EXT.has(ext)) {
            Object.assign(asset, store(buffer, ext, target, asset.localPath))
            asset.contentType = 'image/webp'
          } else {
            writeAtomically(target, buffer)
            asset.contentType = contentType
          }
          asset.bytes = fs.statSync(target).size
          result.fetched++
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

/**
 * Builds each missing size variant from its local original with cwebp -resize (a copy when the
 * original is no wider than the variant). Returns { built, skipped, failed }.
 */
export function buildVariants(manifest, { publicDir, run = execFileSync, log = () => {} }) {
  const byUrl = new Map(manifest.assets.map((a) => [a.url, a]))
  const result = { built: 0, skipped: 0, failed: [] }
  for (const asset of manifest.assets.filter((a) => a.variantOf)) {
    const target = path.join(publicDir, asset.localPath)
    if (fs.existsSync(target) && fs.statSync(target).size > 0) {
      asset.bytes = fs.statSync(target).size
      result.skipped++
      continue
    }
    const parent = byUrl.get(asset.variantOf)
    const source = parent && path.join(publicDir, parent.localPath)
    if (!source || !fs.existsSync(source)) {
      result.failed.push(`${asset.localPath}: original ${parent?.localPath ?? asset.variantOf} is missing`)
      continue
    }
    const size = webpSize(fs.readFileSync(source)) ?? { width: 0, height: 0 }
    // An original scaled down to MAX_WIDTH keeps its source proportions for the variant heights.
    const proportions = parent.sourceSize ? { width: parent.sourceSize[0], height: parent.sourceSize[1] } : size
    const tmp = `${target}.tmp`
    try {
      if (size.width <= asset.width) fs.copyFileSync(source, tmp)
      else run('cwebp', [...webpArgs({ lossless: Boolean(parent.lossless), resize: scaledSize(proportions, asset.width) }), source, '-o', tmp])
      fs.renameSync(tmp, target)
    } catch (error) {
      fs.rmSync(tmp, { force: true })
      result.failed.push(`${asset.localPath}: ${error.message}`)
      continue
    }
    asset.bytes = fs.statSync(target).size
    asset.contentType = 'image/webp'
    result.built++
    log(`variant ${asset.localPath}`)
  }
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
  const modes = ['--scan', '--download', '--variants', '--rewrite'].filter((m) => argv.includes(m))
  if (modes.length === 0) {
    error('Pass --scan, --download, --variants and/or --rewrite.')
    return 2
  }
  let manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { assets: [] }
  const save = () => fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  let code = 0
  const report = (failed) => {
    if (failed.length === 0) return
    error('Failed:')
    for (const f of failed) error(`  ${f}`)
    code = 1
  }

  if (argv.includes('--scan')) {
    manifest = buildManifest({ files: readFiles(appRoot), previous: manifest })
    save()
    log(`Manifest: ${manifest.assets.length} file(s).`)
  }
  if (argv.includes('--download')) {
    const result = await downloadAssets(manifest, { publicDir, log })
    save()
    log(`Downloaded ${result.fetched}, skipped ${result.skipped} on disk.`)
    report(result.failed)
  }
  if (argv.includes('--variants')) {
    const result = buildVariants(manifest, { publicDir, log })
    save()
    log(`Built ${result.built} size variant(s), skipped ${result.skipped} on disk.`)
    report(result.failed)
  }
  if (argv.includes('--rewrite')) {
    const missing = manifest.assets.filter((a) => !fs.existsSync(path.join(publicDir, a.localPath)))
    if (missing.length > 0) {
      error(`Refusing to rewrite: ${missing.length} file(s) are not on disk yet (run --download and --variants):`)
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
