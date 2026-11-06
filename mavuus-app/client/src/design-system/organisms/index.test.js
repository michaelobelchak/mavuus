// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as organisms from './index'

const here = path.dirname(fileURLToPath(import.meta.url))
const isDir = (...parts) => statSync(path.join(here, ...parts)).isDirectory()
const domains = readdirSync(here).filter((name) => isDir(name))

describe('organisms barrel', () => {
  it('should export every domain barrel', async () => {
    for (const domain of domains) {
      const mod = await import(`./${domain}/index.js`)
      for (const name of Object.keys(mod)) {
        expect(organisms, `${domain} exports ${name}`).toHaveProperty(name, mod[name])
      }
    }
  })

  it('should export every component folder from its domain barrel', async () => {
    for (const domain of domains) {
      const barrel = await import(`./${domain}/index.js`)
      for (const folder of readdirSync(path.join(here, domain)).filter((name) => isDir(domain, name))) {
        const mod = await import(`./${domain}/${folder}/index.js`)
        for (const name of Object.keys(mod)) {
          expect(barrel, `${domain}/${folder} exports ${name}`).toHaveProperty(name, mod[name])
        }
      }
    }
  })

  it('should not import app components, context or pages (stories and tests may)', () => {
    const walk = (dir) =>
      readdirSync(dir).flatMap((name) => {
        const full = path.join(dir, name)
        if (statSync(full).isDirectory()) return walk(full)
        return /\.(js|jsx)$/.test(name) && !/\.(test|stories)\.jsx?$/.test(name) ? [full] : []
      })
    for (const file of walk(here)) {
      const source = readFileSync(file, 'utf8')
      expect(source, path.relative(here, file)).not.toMatch(/from ['"][^'"]*\/(components|context|pages)\//)
    }
  })
})
