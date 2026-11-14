// Heals old development databases: seeds used to store remote avatar URLs, which now live as
// local files in client/public/images/avatars/. The URL-to-file map comes from the client's
// scripts/assets-manifest.json, so the remote host is never written here.
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { SERVER_DIR } from '../config.js'

const MANIFEST = join(SERVER_DIR, '..', 'client', 'scripts', 'assets-manifest.json')
const AVATAR_COLUMNS = [
  ['users', 'avatar_url'],
  ['sessions', 'speaker_avatar'],
  ['speakers', 'avatar_url'],
  ['testimonials', 'avatar_url'],
]

/** Map of old remote avatar URL to its local path. Empty when the client folder isn't there (server-only deploy). */
export function remoteAvatarMap(manifestPath = MANIFEST) {
  if (!existsSync(manifestPath)) return new Map()
  const { assets } = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  return new Map(assets.filter((a) => a.localPath.startsWith('/images/avatars/')).map((a) => [a.url, a.localPath]))
}

/** Rewrites every stored remote avatar URL to its local file. Returns the number of rows changed. */
export function healRemoteAvatars(db, map = remoteAvatarMap()) {
  let changed = 0
  const heal = db.transaction(() => {
    for (const [table, column] of AVATAR_COLUMNS) {
      const update = db.prepare(`UPDATE ${table} SET ${column} = ? WHERE ${column} = ?`)
      for (const [remote, local] of map) changed += update.run(local, remote).changes
    }
  })
  heal()
  return changed
}
