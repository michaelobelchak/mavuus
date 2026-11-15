import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'

let app, db, alice

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
  alice = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })
})

afterAll(() => db.close())

describe('referrals', () => {
  it('should give a member the same code every time', async () => {
    const first = await request(app).get('/api/referrals/my-code').set('Authorization', `Bearer ${alice}`)
    const second = await request(app).get('/api/referrals/my-code').set('Authorization', `Bearer ${alice}`)
    expect(first.body.code).toMatch(/^[0-9A-F]{8}$/)
    expect(second.body.code).toBe(first.body.code)
  })

  it('should count a sign-up that came with the code and list it without an email', async () => {
    const { body } = await request(app).get('/api/referrals/my-code').set('Authorization', `Bearer ${alice}`)
    const res = await request(app)
      .post(`/api/auth/register?ref=${body.code}`)
      .send({ name: 'Rita Referred', email: 'rita@test.com', password: 'Password9' })
    expect(res.status).toBe(201)
    const stats = await request(app).get('/api/referrals/stats').set('Authorization', `Bearer ${alice}`)
    expect(stats.body.count).toBe(1)
    expect(stats.body.referrals[0]).toMatchObject({ name: 'Rita Referred' })
    expect(stats.body.referrals[0]).not.toHaveProperty('email')
  })

  it('should ignore an unknown code', async () => {
    const res = await request(app)
      .post('/api/auth/register?ref=NOPE1234')
      .send({ name: 'Nora Nobody', email: 'nora@test.com', password: 'Password9' })
    expect(res.status).toBe(201)
    expect(db.prepare('SELECT COUNT(*) c FROM referral_tracking').get().c).toBe(1)
  })

  it('should ignore a referral code that is not a single value, after creating the account', async () => {
    const res = await request(app)
      .post('/api/auth/register?ref=A&ref=B')
      .send({ name: 'Arr Ay', email: 'array@test.com', password: 'Password9' })
    expect(res.status).toBe(201)
    expect(db.prepare('SELECT COUNT(*) c FROM referral_tracking').get().c).toBe(1)
  })
})
