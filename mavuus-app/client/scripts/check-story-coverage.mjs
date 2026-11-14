// Fails when a design-system component folder has no Storybook story, or when an organism
// component sits loose in its domain folder instead of in its own folder.
// Component folders are the direct children of primitives/ and patterns/ that have an index.js,
// and for organisms/<domain>/ each subfolder of the domain that has an index.js. A component
// folder passes when it (or a folder inside it) holds at least one *.stories.jsx file, the same
// pattern .storybook/main.js loads.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

function hasStory(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).some((entry) => {
    if (entry.isDirectory()) return hasStory(path.join(dir, entry.name))
    return entry.isFile() && entry.name.endsWith('.stories.jsx')
  })
}

/** Returns the names of the direct subfolders of `dir` that have an index.js (component folders). */
function componentFolders(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, 'index.js')))
    .map((entry) => entry.name)
}

/** Returns the component folders (relative to `root`, with forward slashes) that have no story. */
export function findMissingStories(root) {
  const folders = []
  for (const tier of ['primitives', 'patterns']) {
    for (const name of componentFolders(path.join(root, tier))) folders.push(`${tier}/${name}`)
  }
  const organisms = path.join(root, 'organisms')
  if (fs.existsSync(organisms)) {
    for (const domain of fs.readdirSync(organisms, { withFileTypes: true })) {
      if (!domain.isDirectory()) continue
      for (const name of componentFolders(path.join(organisms, domain.name))) {
        folders.push(`organisms/${domain.name}/${name}`)
      }
    }
  }
  return folders.filter((folder) => !hasStory(path.join(root, folder))).sort()
}

/**
 * Returns the .jsx files (relative to `root`, with forward slashes) that sit directly in an
 * organisms/<domain>/ folder. Components must live in their own folder; tests and plain .js
 * modules (barrels, nav config, helpers) may sit in the domain folder.
 */
export function findLooseOrganismFiles(root) {
  const organisms = path.join(root, 'organisms')
  if (!fs.existsSync(organisms)) return []
  const loose = []
  for (const domain of fs.readdirSync(organisms, { withFileTypes: true })) {
    if (!domain.isDirectory()) continue
    for (const entry of fs.readdirSync(path.join(organisms, domain.name), { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.jsx') && !entry.name.endsWith('.test.jsx')) {
        loose.push(`organisms/${domain.name}/${entry.name}`)
      }
    }
  }
  return loose.sort()
}

function main() {
  const root = fileURLToPath(new URL('../src/design-system/', import.meta.url))
  const missing = findMissingStories(root)
  const loose = findLooseOrganismFiles(root)
  if (missing.length > 0) {
    console.error(`Missing stories in ${missing.length} component folder(s):`)
    for (const folder of missing) console.error(`  src/design-system/${folder}`)
  }
  if (loose.length > 0) {
    console.error(`Components must live in their own folder (${loose.length} loose file(s)):`)
    for (const file of loose) console.error(`  src/design-system/${file}`)
  }
  if (missing.length > 0 || loose.length > 0) process.exit(1)
  console.log('Every design-system component folder has a story.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
