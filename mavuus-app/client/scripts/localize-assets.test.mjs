// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  PRAVATAR_HOST,
  WEBFLOW_HOST,
  buildManifest,
  checkContent,
  downloadAssets,
  expandConstants,
  extractUrls,
  folderFor,
  listSourceFiles,
  localNameFor,
  rewriteSource,
} from './localize-assets.mjs'

// Hosts come from the script's constants, so this file never spells a banned host itself.
const WF = `https://${WEBFLOW_HOST}/6689664d9906e5efe6bbc54d`
const CMS = `https://${WEBFLOW_HOST}/668f2b775dccc4947eb1a4d3`
const AV = `https://${PRAVATAR_HOST}/150`

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
  it('should strip the Webflow hash, decode, slugify and keep the extension and the size suffix', () => {
    expect(localNameFor(`${WF}/668f4ef17e1ac5e4d40cd793_Group%203276-p-500.webp`)).toEqual({
      family: '668f4ef17e1ac5e4d40cd793',
      stem: 'group-3276',
      variant: 500,
      ext: 'webp',
      file: 'group-3276-p-500.webp',
    })
    expect(localNameFor(`${WF}/66e1f9f7e6f85e23bc2ef8c7_just-image%20(1).avif`).file).toBe('just-image-1.avif')
    expect(localNameFor(`${WF}/668967a8542d420b9568cbbc_FixelText-Light.woff2`).file).toBe('fixeltext-light.woff2')
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
      localPath: '/images/shared/sisters.jpg',
      usedIn: ['client/src/data/live/about.js', 'client/src/data/live/services.js'],
    })
    // A size variant stays next to its original even when it is used on one page only.
    expect(byUrl[`${WF}/6699b58945922c66688e3a22_sisters-p-500.jpg`].localPath).toBe('/images/shared/sisters-p-500.jpg')
    expect(byUrl[`${WF}/66afe8fe2c0f83efef64a862_Sisters.png`].localPath).toBe('/images/faq/sisters.png')
  })

  it('should number avatars in URL order and give the same URL the same file', () => {
    const { assets } = buildManifest({ files })
    const avatars = assets.filter((a) => a.url.startsWith(AV))
    expect(avatars.map((a) => [a.url, a.localPath])).toEqual([
      [`${AV}?u=a@x.com`, '/images/avatars/avatar-01.jpg'],
      [`${AV}?u=b@x.com`, '/images/avatars/avatar-02.jpg'],
    ])
    expect(avatars[0].usedIn).toEqual(['client/src/data/mockData.js', 'server/db/seed.js'])
  })

  it('should dedupe name collisions between different files in one folder', () => {
    const { assets } = buildManifest({
      files: {
        'client/src/data/live/faq.js': `'${WF}/66afe8fe2c0f83efef64a862_Icon.png' '${WF}/66afe8fe2c0f83efef64a863_icon.png'`,
      },
    })
    expect(assets.map((a) => a.localPath).sort()).toEqual(['/images/faq/icon-2.png', '/images/faq/icon.png'])
  })

  it('should expand size variants from a width table that builds srcsets at runtime', () => {
    const { assets } = buildManifest({
      files: {
        'client/src/data/live/posts.js': `"thumbnail": "${CMS}/6a593ab6479ea97de36e8425_thumb.png"\n"heroSrcset": "${CMS}/6a593ab6479ea97de36e8425_thumb-p-500.png 500w"\nconst IMAGE_WIDTHS = {\n  '6a593ab6479ea97de36e8425': [500, 800, 1408],\n}\n`,
      },
      tables: [{ file: 'client/src/data/live/posts.js', name: 'IMAGE_WIDTHS', key: 'assetId' }],
    })
    expect(assets.map((a) => a.localPath)).toEqual([
      '/images/posts/thumb-p-500.png',
      '/images/posts/thumb-p-800.png',
      '/images/posts/thumb.png',
    ])
    expect(assets[0]).toMatchObject({ variantOf: `${CMS}/6a593ab6479ea97de36e8425_thumb.png` })
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

  it('should keep the numbers of known avatars and give a new one the next free number', () => {
    const first = buildManifest({ files })
    const more = { ...files, 'server/db/seed-demo.js': `'${AV}?u=0@x.com'` }
    const second = buildManifest({ files: more, previous: first })
    const paths = Object.fromEntries(second.assets.map((a) => [a.url, a.localPath]))
    expect(paths[`${AV}?u=a@x.com`]).toBe('/images/avatars/avatar-01.jpg')
    expect(paths[`${AV}?u=0@x.com`]).toBe('/images/avatars/avatar-03.jpg')
  })
})

describe('rewriteSource', () => {
  it('should replace URLs with local paths, inline the CDN constant and drop it once unused', () => {
    const source = `const CDN = '${WF}'\nexport const A = \`\${CDN}/6699b58945922c66688e3a22_sisters-p-500.jpg 500w, \${CDN}/6699b58945922c66688e3a22_sisters.jpg 1120w\`\n`
    const manifest = buildManifest({ files: { 'client/src/data/live/about.js': source } })
    const { text, changed } = rewriteSource(source, manifest)
    expect(changed).toBe(2)
    expect(text).toBe('export const A = `/images/about/sisters-p-500.jpg 500w, /images/about/sisters.jpg 1120w`\n')
  })

  it('should leave a file without remote URLs untouched', () => {
    expect(rewriteSource('const a = 1\n', { assets: [] })).toEqual({ text: 'const a = 1\n', changed: 0 })
  })
})

describe('checkContent', () => {
  const woff2 = Buffer.concat([Buffer.from('wOF2'), Buffer.alloc(10)])
  it('should accept a woff2 font served as octet-stream and an image with an image type', () => {
    expect(checkContent('x.woff2', 'application/octet-stream', woff2)).toBeNull()
    expect(checkContent('x.png', 'image/png', Buffer.from('png'))).toBeNull()
    expect(checkContent('x.jpg', 'image/jpg', Buffer.from('jpg'))).toBeNull()
    expect(checkContent('x.jpg', 'image/png', Buffer.from('png'))).toMatch(/does not match/)
  })
  it('should reject an empty body and an HTML error page', () => {
    expect(checkContent('x.png', 'image/png', Buffer.alloc(0))).toMatch(/empty/)
    expect(checkContent('x.png', 'text/html', Buffer.from('<html>'))).toMatch(/content type/)
    expect(checkContent('x.woff2', 'application/octet-stream', Buffer.from('<html>'))).toMatch(/woff2/)
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

  it('should retry a failed request, write the file and record its size and type', async () => {
    const manifest = { assets: [{ url: `${WF}/a_x.png`, localPath: '/images/faq/x.png', usedIn: [] }] }
    let calls = 0
    const fetchImpl = async () => (++calls === 1 ? response(503, 'text/html', 'busy') : response(200, 'image/png', 'PNGDATA'))
    const result = await downloadAssets(manifest, { publicDir: root, fetchImpl, retryDelayMs: 0 })
    expect(result.failed).toEqual([])
    expect(calls).toBe(2)
    expect(fs.readFileSync(path.join(root, 'images/faq/x.png'), 'utf8')).toBe('PNGDATA')
    expect(manifest.assets[0]).toMatchObject({ bytes: 7, contentType: 'image/png' })
  })

  it('should skip files that are already on disk, so a second run fetches nothing', async () => {
    fs.mkdirSync(path.join(root, 'images/faq'), { recursive: true })
    fs.writeFileSync(path.join(root, 'images/faq/x.png'), 'PNGDATA')
    const manifest = { assets: [{ url: `${WF}/a_x.png`, localPath: '/images/faq/x.png', usedIn: [], bytes: 7, contentType: 'image/png' }] }
    const result = await downloadAssets(manifest, { publicDir: root, fetchImpl: async () => { throw new Error('no fetch') } })
    expect(result).toMatchObject({ fetched: 0, skipped: 1, failed: [] })
  })

  it('should reuse an identical file that is already in public/ instead of writing a copy', async () => {
    fs.mkdirSync(path.join(root, 'assets/people'), { recursive: true })
    fs.writeFileSync(path.join(root, 'assets/people/gayle.png'), 'SAMEBYTES')
    const manifest = { assets: [{ url: `${WF}/a_frame.png`, localPath: '/images/home/frame.png', usedIn: [] }] }
    await downloadAssets(manifest, { publicDir: root, fetchImpl: async () => response(200, 'image/png', 'SAMEBYTES'), retryDelayMs: 0 })
    expect(manifest.assets[0]).toMatchObject({ localPath: '/assets/people/gayle.png', reused: true })
    expect(fs.existsSync(path.join(root, 'images/home/frame.png'))).toBe(false)
  })

  it('should report a URL that keeps failing', async () => {
    const manifest = { assets: [{ url: `${WF}/a_x.png`, localPath: '/images/faq/x.png', usedIn: [] }] }
    const result = await downloadAssets(manifest, { publicDir: root, fetchImpl: async () => response(404, 'text/html', 'nope'), retryDelayMs: 0, retries: 2 })
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0]).toMatch(/404/)
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
