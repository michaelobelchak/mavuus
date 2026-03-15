import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'

let app, db

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
})

afterAll(() => {
  db.close()
})

describe('POST /api/auth/register', () => {
  it('should register a new user with valid data and return 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@test.com', password: 'StrongPass1', name: 'New User' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user.email).toBe('newuser@test.com')
  })

  it('should return 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@test.com', password: 'StrongPass1', name: 'Alice Dup' })

    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('error')
  })

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'StrongPass1', name: 'Bad Email' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})

describe('POST /api/auth/login', () => {
  it('should login with valid credentials and return 200', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user.email).toBe('alice@test.com')
  })

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'WrongPassword1' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })
})

describe('GET /api/profile/me', () => {
  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/profile/me')

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('should return 200 with a valid token', async () => {
    const token = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })

    const res = await request(app)
      .get('/api/profile/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('alice@test.com')
    expect(res.body.name).toBe('Alice Test')
  })
})
