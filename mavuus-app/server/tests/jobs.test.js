import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'

let app, db, token

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
  token = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })
})

afterAll(() => {
  db.close()
})

describe('GET /api/jobs', () => {
  it('should return 200 with a data array', async () => {
    const res = await request(app).get('/api/jobs')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })
})

describe('POST /api/jobs', () => {
  it('should create a job with auth and return 201', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Test Job', company: 'NewCo', description: 'A new job' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it('should return 401 without auth', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .send({ title: 'Unauthorized Job', company: 'NoCo' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })
})

describe('GET /api/jobs/:id', () => {
  it('should return 200 for an existing job', async () => {
    const res = await request(app).get('/api/jobs/1')

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Test Job')
    expect(res.body.company).toBe('TestCo')
  })
})
