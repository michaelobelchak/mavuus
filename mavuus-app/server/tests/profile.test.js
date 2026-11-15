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

const update = (body) => request(app).put('/api/profile/me').set('Authorization', `Bearer ${alice}`).send(body)
const me = async () => (await request(app).get('/api/profile/me').set('Authorization', `Bearer ${alice}`)).body

describe('PUT /api/profile/me', () => {
  it('should save the fields it gets and keep the others', async () => {
    const res = await update({ title: 'Head of Growth', bio: 'Hello', linkedin_url: 'https://linkedin.com/in/alice', years_experience: 12 })
    expect(res.status).toBe(200)
    const profile = await me()
    expect(profile).toMatchObject({ name: 'Alice Test', title: 'Head of Growth', bio: 'Hello', years_experience: 12 })
  })

  it('should refuse a visibility that is not public, connections or private', async () => {
    const res = await update({ profile_visibility: 'everyone' })
    expect(res.status).toBe(400)
    expect((await me()).profile_visibility).not.toBe('everyone')
    expect((await update({ profile_visibility: 'connections' })).status).toBe(200)
    expect((await me()).profile_visibility).toBe('connections')
  })

  it('should refuse links that are not http or https', async () => {
    expect((await update({ linkedin_url: 'javascript:alert(1)' })).status).toBe(400)
    expect((await update({ website_url: 'ftp://example.com' })).status).toBe(400)
    expect((await me()).linkedin_url).toBe('https://linkedin.com/in/alice')
  })

  it('should refuse text over the length limits', async () => {
    expect((await update({ bio: 'a'.repeat(2001) })).status).toBe(400)
    expect((await update({ name: 'a'.repeat(201) })).status).toBe(400)
    expect((await update({ location: 'a'.repeat(201) })).status).toBe(400)
  })

  it('should refuse years of experience that are not a whole number from 0 to 70', async () => {
    for (const years of [-1, 71, 2.5, 'ten']) {
      expect((await update({ years_experience: years })).status, String(years)).toBe(400)
    }
    expect((await me()).years_experience).toBe(12)
  })

  it('should take notification settings only as on or off', async () => {
    expect((await update({ notification_email: 'yes' })).status).toBe(400)
    expect((await update({ notification_email: 0 })).status).toBe(200)
    expect((await me()).notification_email).toBe(0)
  })
})
