import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'
import { ensureVendorOwners } from '../db/vendorOwners.js'
import { ensureVendorReviewIndex, seedVendorReviews } from '../db/vendorReviews.js'

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
  it('should keep the latest of repeat vendor reviews and create the index in one go', () => {
    const fresh = createTestApp().db
    fresh.exec('DROP INDEX idx_reviews_vendor_once')
    fresh.prepare("INSERT INTO vendors (id, company_name, user_id, rating, reviews_count) VALUES (1, 'V', 2, 0, 0)").run()
    const insert = fresh.prepare('INSERT INTO reviews (id, reviewer_id, reviewee_id, vendor_id, rating) VALUES (?, 1, 2, 1, ?)')
    insert.run(10, 5)
    insert.run(11, 1)
    expect(ensureVendorReviewIndex(fresh)).toBe(1)
    expect(fresh.prepare('SELECT id FROM reviews').all()).toEqual([{ id: 11 }])
    expect(fresh.prepare('SELECT rating, reviews_count FROM vendors WHERE id = 1').get()).toEqual({ rating: 1, reviews_count: 1 })
    expect(fresh.prepare("SELECT 1 AS ok FROM sqlite_master WHERE type = 'index' AND name = 'idx_reviews_vendor_once'").get()).toEqual({ ok: 1 })
    fresh.close()
  })

  it('should leave reviews alone once the index exists', () => {
    const fresh = createTestApp().db
    fresh.prepare("INSERT INTO vendors (id, company_name, user_id) VALUES (1, 'V', 2)").run()
    fresh.prepare('INSERT INTO reviews (id, reviewer_id, reviewee_id, vendor_id, rating) VALUES (10, 1, 2, 1, 5)').run()
    const run = fresh.prepare('SELECT COUNT(*) AS c FROM reviews')
    expect(ensureVendorReviewIndex(fresh)).toBe(0)
    expect(run.get().c).toBe(1)
    fresh.close()
  })

  it('should keep the index off a repeat-review table if the index creation fails', () => {
    const fresh = createTestApp().db
    fresh.exec('DROP INDEX idx_reviews_vendor_once')
    fresh.prepare("INSERT INTO vendors (id, company_name, user_id) VALUES (1, 'V', 2)").run()
    const insert = fresh.prepare('INSERT INTO reviews (id, reviewer_id, reviewee_id, vendor_id, rating) VALUES (?, 1, 2, 1, ?)')
    insert.run(10, 5)
    insert.run(11, 1)
    // A clashing object with the index's name makes the creation fail: the delete rolls back.
    fresh.exec('CREATE TABLE idx_reviews_vendor_once (x)')
    expect(() => ensureVendorReviewIndex(fresh)).toThrow()
    expect(fresh.prepare('SELECT COUNT(*) AS c FROM reviews').get().c).toBe(2)
    fresh.close()
  })

  it('should seed review rows for the owners, repoint old ones and recompute ratings from rows', () => {
    const fresh = createTestApp().db
    const users = fresh.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
    for (const email of ['sarah@techflow.com', 'lisa@notion.com', 'tom@datadog.com', 'rachel@asana.com']) users.run(email, 'x', email)
    fresh.prepare("INSERT INTO vendors (id, company_name, rating, reviews_count) VALUES (1, 'ContentPro Agency', 4.9, 18)").run()
    ensureVendorOwners(fresh, 'x')
    const owner = fresh.prepare('SELECT user_id FROM vendors WHERE id = 1').get().user_id
    // An old seeded vendor review written to someone else (the demo user).
    fresh.prepare('INSERT INTO reviews (reviewer_id, reviewee_id, vendor_id, rating) VALUES (3, 2, 1, 4)').run()
    expect(seedVendorReviews(fresh)).toBe(3)
    expect(seedVendorReviews(fresh)).toBe(0)
    const rows = fresh.prepare('SELECT reviewee_id, rating FROM reviews WHERE vendor_id = 1').all()
    expect(rows).toHaveLength(4)
    expect(rows.every((r) => r.reviewee_id === owner)).toBe(true)
    const avg = Math.round((rows.reduce((sum, r) => sum + r.rating, 0) / rows.length) * 10) / 10
    expect(fresh.prepare('SELECT rating, reviews_count FROM vendors WHERE id = 1').get()).toEqual({ rating: avg, reviews_count: 4 })
    fresh.close()
  })
})
