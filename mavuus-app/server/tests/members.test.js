import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'
import { ensureVendorOwners } from '../db/vendorOwners.js'

let app, db, alice

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
  alice = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })
  const insert = db.prepare(
    'INSERT INTO users (id, email, password_hash, name, title, company, membership_tier) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  insert.run(3, 'cara@test.com', 'x', 'Cara Free', 'Writer', 'FreeCo', 'free')
  insert.run(4, 'dan@test.com', 'x', 'Dan Pro', 'CMO', 'ProCo', 'pro')
  // Alice (1) is connected to Bob (2) and Cara (3); her request to Dan (4) is still pending.
  const connect = db.prepare('INSERT INTO connections (requester_id, receiver_id, status) VALUES (?, ?, ?)')
  connect.run(1, 2, 'accepted')
  connect.run(3, 1, 'accepted')
  connect.run(1, 4, 'pending')
  db.prepare("INSERT INTO vendors (id, company_name) VALUES (1, 'ContentPro Agency')").run()
  ensureVendorOwners(db, 'x')
})

afterAll(() => db.close())

const names = (res) => res.body.data.map((m) => m.name).sort()

describe('GET /api/members', () => {
  it('should leave vendor owner accounts out of the directory and search', async () => {
    const owner = db.prepare('SELECT user_id FROM vendors WHERE id = 1').get()
    expect(owner.user_id).toBeTruthy()
    const res = await request(app).get('/api/members').set('Authorization', `Bearer ${alice}`)
    expect(res.status).toBe(200)
    expect(names(res)).toEqual(['Alice Test', 'Bob Test', 'Cara Free', 'Dan Pro'])
    expect(res.body.total).toBe(4)
    const search = await request(app).get('/api/search?q=ContentPro')
    expect(search.body.members).toEqual([])
  })
})
