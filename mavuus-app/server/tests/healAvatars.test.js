import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'
import { SERVER_DIR } from '../config.js'
import { healRemoteAvatars, remoteAvatarMap } from '../db/healAvatars.js'

let db
const map = remoteAvatarMap()
// One old remote avatar URL and the local file it became, read from the client manifest.
const [remote, local] = [...map.entries()][0]

beforeAll(() => {
  db = new Database(':memory:')
  db.exec(readFileSync(join(SERVER_DIR, 'db', 'schema.sql'), 'utf-8'))
  db.prepare('INSERT INTO users (email, password_hash, name, avatar_url) VALUES (?, ?, ?, ?)').run('old@x.com', 'h', 'Old', remote)
  db.prepare('INSERT INTO users (email, password_hash, name, avatar_url) VALUES (?, ?, ?, ?)').run('mine@x.com', 'h', 'Mine', '/uploads/avatars/mine.png')
  db.prepare('INSERT INTO speakers (name, avatar_url) VALUES (?, ?)').run('Speaker', remote)
})

afterAll(() => db.close())

describe('healRemoteAvatars', () => {
  it('should know every avatar in the client manifest', () => {
    expect(map.size).toBe(24)
    expect(local).toMatch(/^\/images\/avatars\/avatar-\d\d\.webp$/)
  })

  it('should return an empty map when the client manifest is missing', () => {
    expect(remoteAvatarMap(join(SERVER_DIR, 'no-such-manifest.json')).size).toBe(0)
  })

  it('should point old remote avatars at their local files and leave the rest alone', () => {
    expect(healRemoteAvatars(db)).toBe(2)
    expect(db.prepare('SELECT avatar_url FROM users WHERE email = ?').get('old@x.com').avatar_url).toBe(local)
    expect(db.prepare('SELECT avatar_url FROM users WHERE email = ?').get('mine@x.com').avatar_url).toBe('/uploads/avatars/mine.png')
    expect(db.prepare('SELECT avatar_url FROM speakers').get().avatar_url).toBe(local)
    expect(healRemoteAvatars(db)).toBe(0)
  })
})
