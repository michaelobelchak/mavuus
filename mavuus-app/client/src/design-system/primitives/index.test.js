import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'
import * as primitives from './index'

const here = path.dirname(new URL(import.meta.url).pathname)

describe('primitives barrel', () => {
  it('should export every component folder', async () => {
    const folders = readdirSync(here).filter((name) => statSync(path.join(here, name)).isDirectory())
    for (const folder of folders) {
      const mod = await import(`./${folder}/index.js`)
      for (const name of Object.keys(mod)) {
        expect(primitives, `${folder} exports ${name}`).toHaveProperty(name, mod[name])
      }
    }
  })
})
