import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'
import { parsePaging } from '../middleware/validate.js'

let app, db, alice

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
  alice = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })
  const insert = db.prepare('INSERT INTO users (id, email, password_hash, name, is_banned, is_deleted) VALUES (?, ?, ?, ?, ?, ?)')
  insert.run(3, 'banned@test.com', 'x', 'Banned Person', 1, 0)
  insert.run(4, 'gone@test.com', 'x', 'Deleted Person', 0, 1)
  db.prepare(
    "INSERT INTO vendors (id, company_name, description, admin_notes, moderation_status) VALUES (1, 'ContentPro Agency', 'Content.', 'Late invoices', 'approved')"
  ).run()
})

afterAll(() => db.close())

describe('member privacy', () => {
  it('should not send emails in the member list', async () => {
    const res = await request(app).get('/api/members').set('Authorization', `Bearer ${alice}`)
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data.every((m) => !('email' in m))).toBe(true)
  })

  it('should leave banned and deleted users out of the member list and search', async () => {
    const res = await request(app).get('/api/members').set('Authorization', `Bearer ${alice}`)
    expect(res.body.data.map((m) => m.name)).toEqual(['Alice Test', 'Bob Test'])
    expect(res.body.total).toBe(2)
    const search = await request(app).get('/api/search?q=Person')
    expect(search.body.members).toEqual([])
  })
})

describe('vendor privacy', () => {
  it('should not send admin notes or the moderation status', async () => {
    const one = await request(app).get('/api/vendors/1')
    expect(one.status).toBe(200)
    expect(one.body.company_name).toBe('ContentPro Agency')
    expect(one.body).not.toHaveProperty('admin_notes')
    expect(one.body).not.toHaveProperty('moderation_status')
    const list = await request(app).get('/api/vendors')
    expect(list.body.data[0]).not.toHaveProperty('admin_notes')
    expect(list.body.data[0]).not.toHaveProperty('moderation_status')
  })
})

describe('paging params', () => {
  it('should fall back to safe numbers for bad page and limit values', () => {
    expect(parsePaging({})).toEqual({ page: 1, limit: 20, offset: 0 })
    expect(parsePaging({ page: 'abc', limit: 'x' })).toEqual({ page: 1, limit: 20, offset: 0 })
    expect(parsePaging({ page: '3', limit: '1000' })).toEqual({ page: 3, limit: 100, offset: 200 })
    expect(parsePaging({ page: '-2', limit: '0' })).toEqual({ page: 1, limit: 1, offset: 0 })
    expect(parsePaging({ page: '2.9', limit: '08' })).toEqual({ page: 2, limit: 8, offset: 8 })
  })

  it('should answer a bad page or limit with a normal page, not NaN', async () => {
    const members = await request(app).get('/api/members?page=abc&limit=zz').set('Authorization', `Bearer ${alice}`)
    expect(members.status).toBe(200)
    expect(members.body).toMatchObject({ page: 1, limit: 20, totalPages: 1 })
    const vendors = await request(app).get('/api/vendors?page=nope&limit=-5')
    expect(vendors.status).toBe(200)
    expect(vendors.body).toMatchObject({ page: 1, limit: 1 })
  })
})
