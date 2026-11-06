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

  it('should list primitive and pattern folders without a story', () => {
    file('primitives/Button/index.js')
    file('primitives/Button/Button.test.jsx')
    file('patterns/Card/index.js')
    expect(findMissingStories(root)).toEqual(['patterns/Card', 'primitives/Button'])
  })

  it('should require a story in each organism component folder, not one per domain', () => {
    file('organisms/app-shell/index.js')
    file('organisms/app-shell/Sidebar/index.js')
    file('organisms/app-shell/Sidebar/Sidebar.stories.jsx')
    file('organisms/app-shell/TopBar/index.js')
    file('organisms/app-shell/TopBar/TopBar.jsx')
    file('organisms/site/Footer/index.js')
    expect(findMissingStories(root)).toEqual(['organisms/app-shell/TopBar', 'organisms/site/Footer'])
  })

  it('should not need a story at the organism domain level', () => {
    file('organisms/site/index.js')
    file('organisms/site/Header/index.js')
    file('organisms/site/Header/Header.stories.jsx')
    expect(findMissingStories(root)).toEqual([])
  })

  it('should accept a story in a nested folder of a component', () => {
    file('patterns/Chart/index.js')
    file('patterns/Chart/parts/Bars.stories.jsx')
    expect(findMissingStories(root)).toEqual([])
  })

  it('should skip folders without an index.js and loose files', () => {
    file('primitives/index.js')
    file('primitives/helpers/format.js')
    file('patterns/index.test.js')
    expect(findMissingStories(root)).toEqual([])
  })

  it('should not count a .stories.js file, which Storybook does not load', () => {
    file('primitives/Badge/index.js')
    file('primitives/Badge/Badge.stories.js')
    expect(findMissingStories(root)).toEqual(['primitives/Badge'])
  })
})
