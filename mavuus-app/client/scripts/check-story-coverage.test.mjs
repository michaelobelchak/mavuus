// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { findMissingStories } from './check-story-coverage.mjs'

let root

function file(relative, contents = '') {
  const full = path.join(root, relative)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, contents)
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'story-coverage-'))
})

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

describe('findMissingStories', () => {
  it('should report nothing when every component folder has a story', () => {
    file('primitives/Button/index.js')
    file('primitives/Button/Button.stories.jsx')
    file('patterns/Card/index.js')
    file('patterns/Card/Card.stories.jsx')
    expect(findMissingStories(root)).toEqual([])
  })

  it('should list component folders without a story in every tier', () => {
    file('primitives/Button/index.js')
    file('primitives/Button/Button.test.jsx')
    file('patterns/Card/index.js')
    file('organisms/site/index.js')
    file('organisms/site/Header.jsx')
    expect(findMissingStories(root)).toEqual(['organisms/site', 'patterns/Card', 'primitives/Button'])
  })

  it('should accept a story in a nested folder', () => {
    file('organisms/app-shell/index.js')
    file('organisms/app-shell/Sidebar/Sidebar.stories.jsx')
    expect(findMissingStories(root)).toEqual([])
  })

  it('should skip folders without an index.js and loose files', () => {
    file('primitives/index.js')
    file('primitives/helpers/format.js')
    file('patterns/index.test.js')
    expect(findMissingStories(root)).toEqual([])
  })

  it('should not count a .stories.js file or a missing tier', () => {
    file('primitives/Badge/index.js')
    file('primitives/Badge/Badge.stories.js')
    expect(findMissingStories(root)).toEqual(['primitives/Badge'])
  })
})
