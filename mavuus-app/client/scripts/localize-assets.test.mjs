// @vitest-environment node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_WIDTH,
  PRAVATAR_HOST,
  WEBFLOW_HOST,
  buildManifest,
  buildVariants,
  capWidths,
  checkContent,
  compareCodePoints,
  downloadAssets,
  expandConstants,
  extractUrls,
  folderFor,
  listSourceFiles,
  localNameFor,
  rewriteSource,
  scaledSize,
  webpArgs,
  wantsLossless,
  webpSize,
} from './localize-assets.mjs'

// Hosts come from the script's constants, so this file never spells a banned host itself.
const WF = `https://${WEBFLOW_HOST}/6689664d9906e5efe6bbc54d`
const CMS = `https://${WEBFLOW_HOST}/668f2b775dccc4947eb1a4d3`
const AV = `https://${PRAVATAR_HOST}/150`

let hasCwebp = true
try {
  execFileSync('cwebp', ['-version'], { stdio: 'ignore' })
} catch {
  hasCwebp = false
}

describe('extractUrls', () => {
  it('should find every URL inside a srcset string, a CSS url() and a JSON value', () => {
    const text = [
      `srcset: "${WF}/668967a8542d420b9568cbbc_a-p-500.png 500w, ${WF}/668967a8542d420b9568cbbc_a.png 900w"`,
      `src: url("${WF}/668967a89906e5efe6bc7f35_FixelText-Regular.woff2") format("woff2");`,
      `background: url(${WF}/6699cbb6206dc486ff34f56f_bg.svg);`,
      `"image": "${AV}?u=sarah@techflow.com",`,
    ].join('\n')
    expect(extractUrls(text)).toEqual([
      `${WF}/668967a8542d420b9568cbbc_a-p-500.png`,
      `${WF}/668967a8542d420b9568cbbc_a.png`,
      `${WF}/668967a89906e5efe6bc7f35_FixelText-Regular.woff2`,
      `${WF}/6699cbb6206dc486ff34f56f_bg.svg`,
      `${AV}?u=sarah@techflow.com`,
    ])
  })

  it('should keep parentheses that are part of a file name', () => {
    const url = `${WF}/66e1f9f7e6f85e23bc2ef8c7_just-image%20(1).avif`
    expect(extractUrls(`image: \`${url}\`,`)).toEqual([url])
  })

  it('should trim a sentence-ending period after a URL', () => {
    expect(extractUrls(`See ${WF}/668967a8542d420b9568cbbc_a.png. Then`)).toEqual([`${WF}/668967a8542d420b9568cbbc_a.png`])
  })

  it('should ignore other hosts and bare site prefixes with no file', () => {
    expect(extractUrls(`a = 'https://example.com/x.png'; b = '${WF}'`)).toEqual([])
  })
})

describe('expandConstants', () => {
  it('should inline a CDN prefix constant used in template literals', () => {
    const source = `const CDN = '${WF}'\nexport const A = { src: \`\${CDN}/668f46214842f23691d72111_Rectangle%207.webp\` }\n`
    const { text, constants } = expandConstants(source)
    expect(constants).toEqual([{ name: 'CDN', value: WF }])
    expect(extractUrls(text)).toEqual([`${WF}/668f46214842f23691d72111_Rectangle%207.webp`])
  })
})

describe('localNameFor', () => {
  it('should strip the Webflow hash, decode, slugify, keep the size suffix and store rasters as WebP', () => {
    expect(localNameFor(`${WF}/668f4ef17e1ac5e4d40cd793_Group%203276-p-500.png`)).toEqual({
      family: '668f4ef17e1ac5e4d40cd793',
      stem: 'group-3276',
      variant: 500,
      ext: 'png',
      stored: 'webp',
      file: 'group-3276-p-500.webp',
    })
    expect(localNameFor(`${WF}/66e1f9f7e6f85e23bc2ef8c7_just-image%20(1).avif`).file).toBe('just-image-1.webp')
    expect(localNameFor(`${WF}/668967a8542d420b9568cbbc_FixelText-Light.woff2`).file).toBe('fixeltext-light.woff2')
    expect(localNameFor(`${WF}/6699cbb6206dc486ff34f56f_bg.svg`).file).toBe('bg.svg')
  })
})

describe('localNameFor with a malformed escape', () => {
  it('should fall back to the raw name instead of throwing', () => {
    expect(localNameFor(`${WF}/668f4ef17e1ac5e4d40cd793_100%25-off%E0%A4.png`).file).toBe('100-25-off-e0-a4.webp')
  })
})

describe('capWidths', () => {
  it('should cap a width table at MAX_WIDTH and leave narrower tables alone', () => {
    expect(MAX_WIDTH).toBe(1600)
    expect(capWidths([500, 800, 1080, 1600, 2000, 2560])).toEqual([500, 800, 1080, 1600])
    expect(capWidths([500, 800, 1920])).toEqual([500, 800, 1600])
    expect(capWidths([500, 800, 1408])).toEqual([500, 800, 1408])
  })
})

describe('folderFor', () => {
  it('should pick the folder from where the file is used', () => {
    expect(folderFor(['client/src/data/live/about.js'], 'jpg')).toBe('images/about')
    expect(folderFor(['client/src/index.css'], 'woff2')).toBe('fonts/fixel')
    expect(folderFor(['client/src/data/live/home.js#COMPANY_LOGOS'], 'png')).toBe('images/logos')
    expect(folderFor(['client/src/data/live/posts.js', 'client/src/data/live/videos.js'], 'png')).toBe('images/posts')
    expect(folderFor(['client/src/data/live/about.js', 'client/src/data/live/services.js'], 'jpg')).toBe('images/shared')
  })
})

describe('buildManifest', () => {
  const files = {
    'client/src/data/live/about.js': `const CDN = '${WF}'\nexport const A = { src: \`\${CDN}/6699b58945922c66688e3a22_sisters-p-500.jpg 500w, \${CDN}/6699b58945922c66688e3a22_sisters.jpg 1120w\` }\n`,
    'client/src/data/live/services.js': `export const S = '${WF}/6699b58945922c66688e3a22_sisters.jpg'\n`,
    'client/src/data/live/faq.js': `export const ICON = '${WF}/66afe8fe2c0f83efef64a862_Sisters.png'\n`,
    'client/src/data/mockData.js': `a: '${AV}?u=b@x.com', b: '${AV}?u=a@x.com', c: '${AV}?u=b@x.com'`,
    'server/db/seed.js': `['${AV}?u=a@x.com']`,
  }

  it('should list each URL once with its local path and every file that uses it', () => {
    const { assets } = buildManifest({ files })
    const byUrl = Object.fromEntries(assets.map((a) => [a.url, a]))
    expect(byUrl[`${WF}/6699b58945922c66688e3a22_sisters.jpg`]).toMatchObject({
      localPath: '/images/shared/sisters.webp',
      usedIn: ['client/src/data/live/about.js', 'client/src/data/live/services.js'],
    })
    // A size variant stays next to its original even when it is used on one page only.
    expect(byUrl[`${WF}/6699b58945922c66688e3a22_sisters-p-500.jpg`]).toMatchObject({
      localPath: '/images/shared/sisters-p-500.webp',
      variantOf: `${WF}/6699b58945922c66688e3a22_sisters.jpg`,
      width: 500,
    })
    expect(byUrl[`${WF}/66afe8fe2c0f83efef64a862_Sisters.png`].localPath).toBe('/images/faq/sisters.webp')
  })

  it('should add the original of a size variant that source names on its own', () => {
    const { assets } = buildManifest({ files: { 'client/src/data/live/about.js': `'${WF}/6699bafbbc4abfb2767db752_img-p-800.webp'` } })
    expect(assets.map((a) => [a.localPath, a.variantOf ?? null])).toEqual([
      ['/images/about/img-p-800.webp', `${WF}/6699bafbbc4abfb2767db752_img.webp`],
      ['/images/about/img.webp', null],
    ])
  })

  it('should number avatars in URL order and give the same URL the same file', () => {
    const { assets } = buildManifest({ files })
    const numbered = assets.filter((a) => a.url.startsWith(AV))
    expect(numbered.map((a) => [a.url, a.localPath])).toEqual([
      [`${AV}?u=a@x.com`, '/images/avatars/avatar-01.webp'],
      [`${AV}?u=b@x.com`, '/images/avatars/avatar-02.webp'],
    ])
    expect(numbered[0].usedIn).toEqual(['client/src/data/mockData.js', 'server/db/seed.js'])
  })

  it('should dedupe name collisions between different files in one folder', () => {
    const { assets } = buildManifest({
      files: {
        'client/src/data/live/faq.js': `'${WF}/66afe8fe2c0f83efef64a862_Icon.png' '${WF}/66afe8fe2c0f83efef64a863_icon.jpg'`,
      },
    })
    expect(assets.map((a) => a.localPath).sort()).toEqual(['/images/faq/icon-2.webp', '/images/faq/icon.webp'])
  })

  it('should expand size variants from a width table, capped at MAX_WIDTH', () => {
    const { assets } = buildManifest({
      files: {
        'client/src/data/live/posts.js': `"thumbnail": "${CMS}/6a593ab6479ea97de36e8425_thumb.png"\n"heroSrcset": "${CMS}/6a593ab6479ea97de36e8425_thumb-p-500.png 500w"\nconst IMAGE_WIDTHS = {\n  '6a593ab6479ea97de36e8425': [500, 800, 1600, 2560],\n}\n`,
      },
      tables: [{ file: 'client/src/data/live/posts.js', name: 'IMAGE_WIDTHS', key: 'assetId' }],
    })
    expect(assets.map((a) => [a.localPath, a.width ?? null])).toEqual([
      ['/images/posts/thumb-p-500.webp', 500],
      ['/images/posts/thumb-p-800.webp', 800],
      ['/images/posts/thumb.webp', null],
    ])
  })

  it('should expand variants for a new remote image in a rewritten file whose table uses local-path keys', () => {
    const tables = [{ file: 'client/src/data/live/posts.js', name: 'IMAGE_WIDTHS', key: 'assetId' }]
    const before = `"thumbnail": "${CMS}/6a593ab6479ea97de36e8425_old.png"\nconst IMAGE_WIDTHS = {\n  '6a593ab6479ea97de36e8425': [500, 1408],\n}\n`
    const first = buildManifest({ files: { 'client/src/data/live/posts.js': before }, tables })
    // After --rewrite the table is keyed by local path; then someone adds a new remote image.
    const after = `"thumbnail": "/images/posts/old.webp"\n"thumbnail": "${CMS}/6b000000000000000000000a_new-thumb.png"\nconst IMAGE_WIDTHS = {\n  '/images/posts/old': [500, 1408],\n  '/images/posts/new-thumb': [500, 800, 1200],\n}\n`
    const second = buildManifest({ files: { 'client/src/data/live/posts.js': after }, previous: first, tables })
    expect(second.assets.map((a) => a.localPath)).toEqual([
      '/images/posts/new-thumb-p-500.webp',
      '/images/posts/new-thumb-p-800.webp',
      '/images/posts/new-thumb.webp',
      '/images/posts/old-p-500.webp',
      '/images/posts/old.webp',
    ])
  })

  it('should be idempotent: a rebuild after the rewrite keeps every entry and path', () => {
    const first = buildManifest({ files })
    const rewritten = Object.fromEntries(Object.entries(files).map(([f, t]) => [f, rewriteSource(t, first).text]))
    const second = buildManifest({ files: rewritten, previous: first })
    expect(second.assets.map((a) => [a.url, a.localPath])).toEqual(first.assets.map((a) => [a.url, a.localPath]))
    expect(second.assets.find((a) => a.url === `${AV}?u=a@x.com`).usedIn).toEqual(['client/src/data/mockData.js', 'server/db/seed.js'])
  })

  it('should drop an entry that nothing references any more', () => {
    const first = buildManifest({ files })
    const rest = Object.fromEntries(Object.entries(files).filter(([file]) => file !== 'client/src/data/live/faq.js'))
    const second = buildManifest({ files: rest, previous: first })
    expect(second.assets.map((a) => a.url)).not.toContain(`${WF}/66afe8fe2c0f83efef64a862_Sisters.png`)
    expect(second.assets).toHaveLength(first.assets.length - 1)
  })

  it('should keep an original that only its size variants use, since --variants needs it', () => {
    const source = `'${WF}/6699bafbbc4abfb2767db752_img-p-800.webp 800w, ${WF}/6699bafbbc4abfb2767db752_img.webp 1920w'`
    const first = buildManifest({ files: { 'client/src/data/live/about.js': source } })
    const onlyVariant = `'${WF}/6699bafbbc4abfb2767db752_img-p-800.webp 800w'`
    const second = buildManifest({ files: { 'client/src/data/live/about.js': onlyVariant }, previous: first })
    expect(second.assets.map((a) => a.localPath)).toEqual(['/images/about/img-p-800.webp', '/images/about/img.webp'])
  })

  it('should keep the numbers of known avatars and give a new one the next free number', () => {
    const first = buildManifest({ files })
    const more = { ...files, 'server/db/seed-demo.js': `'${AV}?u=0@x.com'` }
    const second = buildManifest({ files: more, previous: first })
    const paths = Object.fromEntries(second.assets.map((a) => [a.url, a.localPath]))
    expect(paths[`${AV}?u=a@x.com`]).toBe('/images/avatars/avatar-01.webp')
    expect(paths[`${AV}?u=0@x.com`]).toBe('/images/avatars/avatar-03.webp')
  })
})

describe('rewriteSource', () => {
  it('should replace URLs with local paths, inline the CDN constant and drop it once unused', () => {
    const source = `const CDN = '${WF}'\nexport const A = \`\${CDN}/6699b58945922c66688e3a22_sisters-p-500.jpg 500w, \${CDN}/6699b58945922c66688e3a22_sisters.jpg 1120w\`\n`
    const manifest = buildManifest({ files: { 'client/src/data/live/about.js': source } })
    const { text, changed } = rewriteSource(source, manifest)
    expect(changed).toBe(2)
    expect(text).toBe('export const A = `/images/about/sisters-p-500.webp 500w, /images/about/sisters.webp 1120w`\n')
  })

  it('should lower a srcset descriptor wider than the stored, capped original', () => {
    const manifest = { assets: [{ url: `${WF}/a_x.jpg`, localPath: '/images/about/x.webp', width: 1600 }] }
    expect(rewriteSource(`'${WF}/a_x.jpg 1920w'`, manifest).text).toBe("'/images/about/x.webp 1600w'")
  })

  it('should keep the first of two srcset entries that end up with the same width', () => {
    const manifest = {
      assets: [
        { url: `${WF}/a_x-p-1600.jpg`, localPath: '/images/about/x-p-1600.webp', variantOf: `${WF}/a_x.jpg`, width: 1600 },
        { url: `${WF}/a_x.jpg`, localPath: '/images/about/x.webp', width: 1600 },
      ],
    }
    const source = `'${WF}/a_x-p-1600.jpg 1600w, ${WF}/a_x.jpg 1920w'`
    expect(rewriteSource(source, manifest).text).toBe("'/images/about/x-p-1600.webp 1600w'")
  })

  it('should only drop a CDN constant declared at the start of a line and never an exported one', () => {
    const source = `const A = 1\n\nconst CDN = '${WF}'\nexport const CDN_CMS = '${CMS}'\nexport const x = \`\${CDN}/668f46214842f23691d72111_r.webp\`\nexport const y = \`\${CDN_CMS}/668f46214842f23691d72112_s.webp\`\n`
    const manifest = buildManifest({ files: { 'client/src/data/live/faq.js': source } })
    expect(rewriteSource(source, manifest).text).toBe(
      `const A = 1\n\nexport const CDN_CMS = '${CMS}'\nexport const x = \`/images/faq/r.webp\`\nexport const y = \`/images/faq/s.webp\`\n`,
    )
  })

  it('should leave a file without remote URLs untouched', () => {
    expect(rewriteSource('const a = 1\n', { assets: [] })).toEqual({ text: 'const a = 1\n', changed: 0 })
  })
})

describe('checkContent', () => {
  const woff2 = Buffer.concat([Buffer.from('wOF2'), Buffer.alloc(10)])
  it('should accept a woff2 font served as octet-stream and images with an image type', () => {
    expect(checkContent(`${WF}/a_x.woff2`, 'application/octet-stream', woff2)).toBeNull()
    expect(checkContent(`${WF}/a_x.png`, 'image/png', Buffer.from('png'))).toBeNull()
    expect(checkContent(`${WF}/a_x.jpg`, 'image/jpg', Buffer.from('jpg'))).toBeNull()
    expect(checkContent(`${AV}?u=a@x.com`, 'image/jpeg', Buffer.from('jpg'))).toBeNull()
  })
  it('should reject an empty body, an HTML error page and a type that does not match', () => {
    expect(checkContent(`${WF}/a_x.png`, 'image/png', Buffer.alloc(0))).toMatch(/empty/)
    expect(checkContent(`${WF}/a_x.png`, 'text/html', Buffer.from('<html>'))).toMatch(/content type/)
    expect(checkContent(`${WF}/a_x.jpg`, 'image/png', Buffer.from('png'))).toMatch(/does not match/)
    expect(checkContent(`${WF}/a_x.woff2`, 'application/octet-stream', Buffer.from('<html>'))).toMatch(/woff2/)
  })
})

describe('webpSize and webpArgs', () => {
  it('should read the size from lossy, lossless and extended WebP headers', () => {
    const vp8 = Buffer.alloc(30)
    vp8.write('RIFF', 0, 'latin1')
    vp8.write('WEBP', 8, 'latin1')
    vp8.write('VP8 ', 12, 'latin1')
    vp8.writeUInt16LE(640, 26)
    vp8.writeUInt16LE(360, 28)
    expect(webpSize(vp8)).toEqual({ width: 640, height: 360 })
    const vp8x = Buffer.from(vp8)
    vp8x.write('VP8X', 12, 'latin1')
    vp8x.writeUIntLE(1599, 24, 3)
    vp8x.writeUIntLE(899, 27, 3)
    expect(webpSize(vp8x)).toEqual({ width: 1600, height: 900 })
    const vp8l = Buffer.from(vp8)
    vp8l.write('VP8L', 12, 'latin1')
    vp8l.writeUInt32LE((160 - 1) | ((160 - 1) << 14), 21)
    expect(webpSize(vp8l)).toEqual({ width: 160, height: 160 })
    expect(webpSize(Buffer.from('not a webp file at all, nope.'))).toBeNull()
  })

  it('should keep logos and tiny PNG graphics lossless and photos lossy', () => {
    expect(wantsLossless('/images/logos/image-197.webp', 'png', 50_000)).toBe(true)
    expect(wantsLossless('/images/faq/icon.webp', 'png', 1_700)).toBe(true)
    expect(wantsLossless('/images/avatars/avatar-01.webp', 'jpg', 6_000)).toBe(false)
    expect(wantsLossless('/images/posts/thumb.webp', 'png', 900_000)).toBe(false)
  })

  it('should round a scaled height to the nearest pixel, like the Webflow CDN variants', () => {
    expect(scaledSize({ width: 1600, height: 900 }, 500)).toEqual([500, 281])
    expect(scaledSize({ width: 1600, height: 900 }, 1080)).toEqual([1080, 608])
    expect(scaledSize({ width: 1920, height: 781 }, 1600)).toEqual([1600, 651])
  })

  it('should encode photos lossy with alpha kept and logos lossless', () => {
    expect(webpArgs({ lossless: false, resize: [800, 450] })).toEqual(['-quiet', '-metadata', 'none', '-q', '82', '-m', '6', '-sharp_yuv', '-alpha_q', '100', '-resize', '800', '450'])
    expect(webpArgs({ lossless: true })).toEqual(['-quiet', '-metadata', 'none', '-lossless', '-z', '9'])
  })
})

describe('downloadAssets', () => {
  let root
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'localize-'))
  })
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  const response = (status, type, body) => ({
    ok: status === 200,
    status,
    headers: { get: () => type },
    arrayBuffer: async () => new Uint8Array(Buffer.from(body)).buffer,
  })
  // Stands in for cwebp: writes the bytes it got, so the test checks the flow, not the encoder.
  const store = (buffer, ext, target) => {
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, `${ext}:${buffer}`)
    return { width: 640, lossless: false }
  }

  it('should retry a failed request, store the image as WebP and record its size, type and width', async () => {
    const manifest = { assets: [{ url: `${WF}/a_x.png`, localPath: '/images/faq/x.webp', usedIn: [] }] }
    let calls = 0
    const fetchImpl = async () => (++calls === 1 ? response(503, 'text/html', 'busy') : response(200, 'image/png', 'PNGDATA'))
    const result = await downloadAssets(manifest, { publicDir: root, fetchImpl, store, retryDelayMs: 0 })
    expect(result.failed).toEqual([])
    expect(calls).toBe(2)
    expect(fs.readFileSync(path.join(root, 'images/faq/x.webp'), 'utf8')).toBe('png:PNGDATA')
    expect(manifest.assets[0]).toMatchObject({ bytes: 11, contentType: 'image/webp', width: 640 })
  })

  it('should store fonts and SVGs as they are and never fetch size variants', async () => {
    const manifest = {
      assets: [
        { url: `${WF}/a_bg.svg`, localPath: '/images/shared/bg.svg', usedIn: [] },
        { url: `${WF}/a_x-p-500.png`, localPath: '/images/faq/x-p-500.webp', usedIn: [], variantOf: `${WF}/a_x.png`, width: 500 },
      ],
    }
    const fetched = []
    const fetchImpl = async (url) => {
      fetched.push(url)
      return response(200, 'image/svg+xml', '<svg/>')
    }
    await downloadAssets(manifest, { publicDir: root, fetchImpl, store, retryDelayMs: 0 })
    expect(fetched).toEqual([`${WF}/a_bg.svg`])
    expect(fs.readFileSync(path.join(root, 'images/shared/bg.svg'), 'utf8')).toBe('<svg/>')
  })

  it('should skip files that are already on disk, so a second run fetches nothing', async () => {
    fs.mkdirSync(path.join(root, 'images/faq'), { recursive: true })
    fs.writeFileSync(path.join(root, 'images/faq/x.webp'), 'WEBPDATA')
    const manifest = { assets: [{ url: `${WF}/a_x.png`, localPath: '/images/faq/x.webp', usedIn: [], bytes: 8 }] }
    const result = await downloadAssets(manifest, { publicDir: root, fetchImpl: async () => { throw new Error('no fetch') } })
    expect(result).toMatchObject({ fetched: 0, skipped: 1, failed: [] })
  })

  it('should report a URL that keeps failing', async () => {
    const manifest = { assets: [{ url: `${WF}/a_x.png`, localPath: '/images/faq/x.webp', usedIn: [] }] }
    const result = await downloadAssets(manifest, { publicDir: root, fetchImpl: async () => response(404, 'text/html', 'nope'), store, retryDelayMs: 0, retries: 2 })
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0]).toMatch(/404/)
  })
})

describe('buildVariants', () => {
  let root
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'localize-variants-'))
  })
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  it.skipIf(!hasCwebp)('should resize the local original to each width with cwebp, then skip on a second run', () => {
    fs.mkdirSync(path.join(root, 'images/posts'), { recursive: true })
    const original = path.join(root, 'images/posts/x.webp')
    // A 1000x503 lossless WebP made from a tiny PPM, so the test needs nothing but cwebp.
    const ppm = path.join(root, 'x.ppm')
    fs.writeFileSync(ppm, Buffer.concat([Buffer.from('P6\n1000 503\n255\n'), Buffer.alloc(1000 * 503 * 3, 200)]))
    execFileSync('cwebp', ['-quiet', '-lossless', ppm, '-o', original])
    const manifest = {
      assets: [
        { url: `${CMS}/a_x.png`, localPath: '/images/posts/x.webp' },
        { url: `${CMS}/a_x-p-500.png`, localPath: '/images/posts/x-p-500.webp', variantOf: `${CMS}/a_x.png`, width: 500 },
        { url: `${CMS}/a_x-p-1080.png`, localPath: '/images/posts/x-p-1080.webp', variantOf: `${CMS}/a_x.png`, width: 1080 },
      ],
    }
    expect(buildVariants(manifest, { publicDir: root })).toEqual({ built: 2, skipped: 0, failed: [] })
    expect(webpSize(fs.readFileSync(path.join(root, 'images/posts/x-p-500.webp')))).toEqual({ width: 500, height: 252 })
    // Never wider than the original: a variant at or past its width is a copy.
    expect(fs.readFileSync(path.join(root, 'images/posts/x-p-1080.webp'))).toEqual(fs.readFileSync(original))
    expect(buildVariants(manifest, { publicDir: root })).toMatchObject({ built: 0, skipped: 2 })
  })

  it.skipIf(!hasCwebp)('should size variants of a scaled-down original from its source proportions', () => {
    fs.mkdirSync(path.join(root, 'images/about'), { recursive: true })
    const ppm = path.join(root, 'x.ppm')
    fs.writeFileSync(ppm, Buffer.concat([Buffer.from('P6\n1600 651\n255\n'), Buffer.alloc(1600 * 651 * 3, 90)]))
    execFileSync('cwebp', ['-quiet', '-lossless', ppm, '-o', path.join(root, 'images/about/x.webp')])
    const manifest = {
      assets: [
        { url: `${WF}/a_x.webp`, localPath: '/images/about/x.webp', sourceSize: [1920, 781] },
        { url: `${WF}/a_x-p-800.webp`, localPath: '/images/about/x-p-800.webp', variantOf: `${WF}/a_x.webp`, width: 800 },
      ],
    }
    buildVariants(manifest, { publicDir: root })
    // 781 * 800 / 1920 = 325.4, where the scaled original's own proportions would give 326.
    expect(webpSize(fs.readFileSync(path.join(root, 'images/about/x-p-800.webp')))).toEqual({ width: 800, height: 325 })
  })

  it('should report a cwebp failure per variant and leave no partial file behind', () => {
    fs.mkdirSync(path.join(root, 'images/posts'), { recursive: true })
    const vp8 = Buffer.alloc(30)
    vp8.write('RIFF', 0, 'latin1')
    vp8.write('WEBP', 8, 'latin1')
    vp8.write('VP8 ', 12, 'latin1')
    vp8.writeUInt16LE(1000, 26)
    vp8.writeUInt16LE(500, 28)
    fs.writeFileSync(path.join(root, 'images/posts/x.webp'), vp8)
    const manifest = {
      assets: [
        { url: `${CMS}/a_x.png`, localPath: '/images/posts/x.webp' },
        { url: `${CMS}/a_x-p-500.png`, localPath: '/images/posts/x-p-500.webp', variantOf: `${CMS}/a_x.png`, width: 500 },
      ],
    }
    // A cwebp that writes half a file, then dies.
    const run = (cmd, args) => {
      fs.writeFileSync(args[args.length - 1], 'partial')
      throw new Error('cwebp crashed')
    }
    const result = buildVariants(manifest, { publicDir: root, run })
    expect(result.failed).toEqual(['/images/posts/x-p-500.webp: cwebp crashed'])
    expect(fs.readdirSync(path.join(root, 'images/posts'))).toEqual(['x.webp'])
  })

  it('should report a variant whose original is missing', () => {
    const manifest = { assets: [{ url: `${CMS}/a_x-p-500.png`, localPath: '/images/posts/x-p-500.webp', variantOf: `${CMS}/a_x.png`, width: 500 }] }
    expect(buildVariants(manifest, { publicDir: root }).failed[0]).toMatch(/missing/)
  })
})

describe('compareCodePoints', () => {
  it('should sort by code point, the same on every machine, not by locale', () => {
    expect(['/images/a/b.webp', '/images/a/B.webp', '/images/a/a-1.webp', '/images/a/a1.webp'].sort(compareCodePoints)).toEqual([
      '/images/a/B.webp',
      '/images/a/a-1.webp',
      '/images/a/a1.webp',
      '/images/a/b.webp',
    ])
  })
})

describe('listSourceFiles', () => {
  it('should scan src/pages/public but skip the public/ asset folder and node_modules', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'localize-list-'))
    for (const file of ['client/src/pages/public/Contact.jsx', 'client/public/old.js', 'client/node_modules/x/a.js', 'server/db/seed.js', 'client/src/a.png']) {
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
      fs.writeFileSync(path.join(root, file), '')
    }
    expect(listSourceFiles(root)).toEqual(['client/src/pages/public/Contact.jsx', 'server/db/seed.js'])
    fs.rmSync(root, { recursive: true, force: true })
  })
})
