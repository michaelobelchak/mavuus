import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'
import * as patterns from './index'

const here = path.dirname(new URL(import.meta.url).pathname)
const folders = readdirSync(here).filter((name) => statSync(path.join(here, name)).isDirectory())

describe('patterns barrel', () => {
  it('should export every component folder', async () => {
    for (const folder of folders) {
      const mod = await import(`./${folder}/index.js`)
      for (const name of Object.keys(mod)) {
        expect(patterns, `${folder} exports ${name}`).toHaveProperty(name, mod[name])
      }
    }
  })

  it('should never import organisms', () => {
    for (const folder of folders) {
      for (const file of readdirSync(path.join(here, folder))) {
        const source = readFileSync(path.join(here, folder, file), 'utf8')
        expect(source, `${folder}/${file}`).not.toMatch(/from ['"][^'"]*organisms/)
      }
    }
  })
})
