// Fails when a design-system component folder has no Storybook story.
// A component folder is any direct child of primitives/, patterns/ or organisms/ with an index.js;
// it passes when it (or a folder inside it) holds at least one *.stories.jsx file.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const TIERS = ['primitives', 'patterns', 'organisms']

function hasStory(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).some((entry) => {
    if (entry.isDirectory()) return hasStory(path.join(dir, entry.name))
    return entry.isFile() && entry.name.endsWith('.stories.jsx')
  })
}

/** Returns the component folders (relative to `root`, with forward slashes) that have no story. */
export function findMissingStories(root) {
  const missing = []
  for (const tier of TIERS) {
    const tierDir = path.join(root, tier)
    if (!fs.existsSync(tierDir)) continue
    for (const entry of fs.readdirSync(tierDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dir = path.join(tierDir, entry.name)
      if (!fs.existsSync(path.join(dir, 'index.js'))) continue
      if (!hasStory(dir)) missing.push(`${tier}/${entry.name}`)
    }
  }
  return missing.sort()
}

function main() {
  const root = fileURLToPath(new URL('../src/design-system/', import.meta.url))
  const missing = findMissingStories(root)
  if (missing.length > 0) {
    console.error(`Missing stories in ${missing.length} component folder(s):`)
    for (const folder of missing) console.error(`  src/design-system/${folder}`)
    process.exit(1)
  }
  console.log('Every design-system component folder has a story.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
