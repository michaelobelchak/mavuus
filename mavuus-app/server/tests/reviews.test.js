import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'
import { ensureVendorOwners } from '../db/vendorOwners.js'

let app, db, alice, ownerId

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
  alice = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })
  db.prepare("INSERT INTO vendors (id, company_name) VALUES (1, 'ContentPro Agency')").run()
  ensureVendorOwners(db, 'x')
  ownerId = db.prepare('SELECT user_id FROM vendors WHERE id = 1').get().user_id
})

afterAll(() => db.close())

describe('vendor owners', () => {
  it('should link each seeded vendor to an owner account once', () => {
    expect(ownerId).toBeTruthy()
    expect(ensureVendorOwners(db, 'x')).toBe(0)
    expect(db.prepare("SELECT COUNT(*) c FROM users WHERE email = 'hello@contentpro.example'").get().c).toBe(1)
  })
})

describe('POST /api/reviews for a vendor', () => {
  it("should save a review of a vendor with an owner and update the vendor's rating", async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${alice}`)
      .send({ reviewee_id: ownerId, vendor_id: 1, rating: 4, text: 'Solid work.' })
    expect(res.status).toBe(201)
    const vendor = db.prepare('SELECT rating, reviews_count FROM vendors WHERE id = 1').get()
    expect(vendor).toEqual({ rating: 4, reviews_count: 1 })
    const list = await request(app).get('/api/reviews/vendor/1').set('Authorization', `Bearer ${alice}`)
    expect(list.body.map((r) => r.text)).toEqual(['Solid work.'])
  })

  it('should still refuse a review of yourself', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${alice}`)
      .send({ reviewee_id: 1, vendor_id: 1, rating: 5 })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Cannot review yourself')
  })
})
