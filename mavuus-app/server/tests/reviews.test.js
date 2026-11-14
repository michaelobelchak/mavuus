import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'
import { ensureVendorOwners } from '../db/vendorOwners.js'
import { dedupeVendorReviews } from '../db/vendorReviews.js'

let app, db, alice, bob, ownerId, ownerToken

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
  alice = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })
  bob = generateTestToken({ id: 2, email: 'bob@test.com', name: 'Bob Test' })
  db.prepare("INSERT INTO vendors (id, company_name, rating, reviews_count) VALUES (1, 'ContentPro Agency', 4.9, 18)").run()
  db.prepare("INSERT INTO vendors (id, company_name) VALUES (2, 'No Owner Co')").run()
  ensureVendorOwners(db, 'x')
  ownerId = db.prepare('SELECT user_id FROM vendors WHERE id = 1').get().user_id
  ownerToken = generateTestToken({ id: ownerId, email: 'hello@contentpro.example', name: 'ContentPro Agency' })
})

afterAll(() => db.close())

const review = (token, body) => request(app).post('/api/reviews').set('Authorization', `Bearer ${token}`).send(body)

describe('vendor owners', () => {
  it('should link each seeded vendor to an owner account once', () => {
    expect(ownerId).toBeTruthy()
    expect(ensureVendorOwners(db, 'x')).toBe(0)
    expect(db.prepare("SELECT COUNT(*) c FROM users WHERE email = 'hello@contentpro.example'").get().c).toBe(1)
  })
})

describe('POST /api/reviews for a vendor', () => {
  it("should write the review to the vendor's owner, whatever the body says, and update the rating", async () => {
    const res = await review(alice, { reviewee_id: 2, vendor_id: 1, rating: 4, text: 'Solid work.' })
    expect(res.status).toBe(201)
    const row = db.prepare('SELECT reviewee_id FROM reviews WHERE id = ?').get(res.body.id)
    expect(row.reviewee_id).toBe(ownerId)
    expect(db.prepare('SELECT rating, reviews_count FROM vendors WHERE id = 1').get()).toEqual({ rating: 4, reviews_count: 1 })
    const list = await request(app).get('/api/reviews/vendor/1').set('Authorization', `Bearer ${alice}`)
    expect(list.body.map((r) => r.text)).toEqual(['Solid work.'])
  })

  it('should refuse a second review of the same vendor with a 409', async () => {
    const res = await review(alice, { vendor_id: 1, rating: 5 })
    expect(res.status).toBe(409)
    expect(res.body.error).toBe('You already reviewed this vendor')
    expect(db.prepare('SELECT reviews_count FROM vendors WHERE id = 1').get().reviews_count).toBe(1)
  })

  it('should 404 an unknown vendor and 400 a vendor without an owner', async () => {
    expect((await review(bob, { vendor_id: 99, rating: 5 })).status).toBe(404)
    const noOwner = await review(bob, { vendor_id: 2, rating: 5 })
    expect(noOwner.status).toBe(400)
    expect(noOwner.body.error).toBe("This vendor can't be reviewed yet")
  })

  it("should refuse the owner's review of their own vendor", async () => {
    const res = await review(ownerToken, { vendor_id: '1', rating: 5 })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe("You can't review your own vendor")
  })

  it('should still refuse a review of yourself, also when the id is a string', async () => {
    const res = await review(alice, { reviewee_id: '1', rating: 5 })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Cannot review yourself')
  })

  it('should recalculate the rating when a review is deleted', async () => {
    const created = await review(bob, { vendor_id: 1, rating: 2 })
    expect(db.prepare('SELECT rating, reviews_count FROM vendors WHERE id = 1').get()).toEqual({ rating: 3, reviews_count: 2 })
    await request(app).delete(`/api/reviews/${created.body.id}`).set('Authorization', `Bearer ${bob}`)
    expect(db.prepare('SELECT rating, reviews_count FROM vendors WHERE id = 1').get()).toEqual({ rating: 4, reviews_count: 1 })
  })
})

describe('seeded vendor reviews', () => {
  it('should keep the earliest of repeat vendor reviews', () => {
    const fresh = createTestApp().db
    fresh.exec('DROP INDEX idx_reviews_vendor_once')
    fresh.prepare("INSERT INTO vendors (id, company_name, user_id) VALUES (1, 'V', 2)").run()
    const insert = fresh.prepare('INSERT INTO reviews (id, reviewer_id, reviewee_id, vendor_id, rating) VALUES (?, 1, 2, 1, ?)')
    insert.run(10, 5)
    insert.run(11, 1)
    expect(dedupeVendorReviews(fresh)).toBe(1)
    expect(fresh.prepare('SELECT id FROM reviews').all()).toEqual([{ id: 10 }])
    expect(dedupeVendorReviews(fresh)).toBe(0)
    fresh.close()
  })
})
