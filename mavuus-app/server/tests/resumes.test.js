import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { existsSync, readdirSync, unlinkSync, writeFileSync } from 'fs'
import { createTestApp, generateTestToken } from './setup.js'
import { JWT_SECRET } from '../middleware/auth.js'
import { RESUMES_DIR, resumeName, resumePath } from '../db/resumes.js'

let app, db, alice, bob, cara, admin
const before = new Set(existsSync(RESUMES_DIR) ? readdirSync(RESUMES_DIR) : [])
const PDF = Buffer.from('%PDF-1.4\n% test resume\n')

const upload = (token, body = PDF, filename = 'cv.pdf', contentType = 'application/pdf') =>
  request(app).post('/api/profile/me/resume').set('Authorization', `Bearer ${token}`).attach('resume', body, { filename, contentType })
const read = (token, url) => {
  const req = request(app).get(url)
  return token ? req.set('Authorization', `Bearer ${token}`) : req
}
const fileOf = (url) => resumeName(url)

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
  db.prepare("INSERT INTO users (id, email, password_hash, name) VALUES (3, 'cara@test.com', 'x', 'Cara Test')").run()
  db.prepare("INSERT INTO users (id, email, password_hash, name, role) VALUES (4, 'admin@test.com', 'x', 'Admin', 'admin')").run()
  alice = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })
  bob = generateTestToken({ id: 2, email: 'bob@test.com', name: 'Bob Test' })
  cara = generateTestToken({ id: 3, email: 'cara@test.com', name: 'Cara Test' })
  admin = jwt.sign({ id: 4, email: 'admin@test.com', name: 'Admin', role: 'admin' }, JWT_SECRET)
})

afterAll(() => {
  // Remove the files these tests wrote.
  for (const name of readdirSync(RESUMES_DIR)) if (!before.has(name)) unlinkSync(resumePath(name))
  db.close()
})

describe('resume upload', () => {
  it('should store a PDF under a random .pdf name, whatever it was called, behind the files route', async () => {
    const res = await upload(bob, PDF, 'evil.html')
    expect(res.status).toBe(200)
    expect(res.body.url).toMatch(/^\/api\/files\/resumes\/[0-9a-f-]{36}\.pdf$/)
    expect(res.body.filename).toBe('evil.html')
    expect(existsSync(resumePath(fileOf(res.body.url)))).toBe(true)
  })

  it('should refuse a file that says it is a PDF but is not, and keep nothing', async () => {
    const files = readdirSync(RESUMES_DIR).length
    const res = await upload(bob, Buffer.from('<html>hi</html>'), 'cv.pdf')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Only PDF files are allowed')
    expect(readdirSync(RESUMES_DIR).length).toBe(files)
  })

  it('should refuse a file over 5 MB', async () => {
    const big = Buffer.concat([PDF, Buffer.alloc(5 * 1024 * 1024)])
    const res = await upload(bob, big)
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/5 MB/)
  })
})

describe('reading a resume', () => {
  let bobUrl

  beforeAll(async () => {
    bobUrl = (await upload(bob)).body.url
    db.prepare("INSERT INTO user_profiles (user_id, profile_visibility) VALUES (2, 'private') ON CONFLICT(user_id) DO UPDATE SET profile_visibility = 'private'").run()
  })

  it('should not be served as a static file', async () => {
    expect((await read(bob, `/uploads/resumes/${fileOf(bobUrl)}`)).status).toBe(404)
  })

  it('should let the owner and admins read it and nobody else', async () => {
    const own = await read(bob, bobUrl)
    expect(own.status).toBe(200)
    expect(own.headers['content-type']).toMatch(/application\/pdf/)
    expect((await read(admin, bobUrl)).status).toBe(200)
    expect((await read(cara, bobUrl)).status).toBe(404)
    expect((await read(null, bobUrl)).status).toBe(401)
  })

  it('should let the poster of a job the owner applied to with it read it', async () => {
    expect((await read(alice, bobUrl)).status).toBe(404)
    const applied = await request(app).post('/api/jobs/1/apply').set('Authorization', `Bearer ${bob}`).send({ resume_url: bobUrl })
    expect(applied.status).toBe(201)
    expect((await read(alice, bobUrl)).status).toBe(200)
  })

  it('should let members who may see a public profile read its resume', async () => {
    const caraUrl = (await upload(cara)).body.url
    expect((await read(bob, caraUrl)).status).toBe(200)
    db.prepare("UPDATE user_profiles SET profile_visibility = 'connections' WHERE user_id = 3").run()
    expect((await read(bob, caraUrl)).status).toBe(404)
  })

  it('should still serve a resume stored under the old /uploads/resumes url', async () => {
    writeFileSync(resumePath('legacy-cara.pdf'), PDF)
    db.prepare("UPDATE user_profiles SET resume_url = '/uploads/resumes/legacy-cara.pdf' WHERE user_id = 3").run()
    expect((await read(cara, '/api/files/resumes/legacy-cara.pdf')).status).toBe(200)
    expect((await read(alice, '/api/files/resumes/legacy-cara.pdf')).status).toBe(404)
  })

  it('should refuse names that try to leave the folder', async () => {
    expect((await read(admin, '/api/files/resumes/..%2F..%2Findex.js')).status).toBe(404)
  })
})

describe('replacing and deleting a resume', () => {
  it('should keep the old file while an application uses it and delete it otherwise', async () => {
    const first = (await upload(cara)).body.url
    db.prepare("UPDATE user_profiles SET profile_visibility = 'public' WHERE user_id = 3").run()
    await request(app).post('/api/jobs/1/apply').set('Authorization', `Bearer ${cara}`).send({ resume_url: first })
    const second = (await upload(cara)).body.url
    expect(existsSync(resumePath(fileOf(first)))).toBe(true)
    expect((await read(alice, first)).status).toBe(200)

    await upload(cara)
    expect(existsSync(resumePath(fileOf(second)))).toBe(false)

    const removed = await request(app).delete('/api/profile/me/resume').set('Authorization', `Bearer ${cara}`)
    expect(removed.status).toBe(200)
    expect(existsSync(resumePath(fileOf(first)))).toBe(true)
  })
})

describe('applying with a resume', () => {
  it("should refuse a resume that isn't the member's own", async () => {
    db.prepare("INSERT INTO jobs (id, title, company, posted_by) VALUES (40, 'Another Job', 'TestCo', 1)").run()
    const bobUrl = (await upload(bob)).body.url
    const res = await request(app).post('/api/jobs/40/apply').set('Authorization', `Bearer ${cara}`).send({ resume_url: bobUrl })
    expect(res.status).toBe(400)
    const odd = await request(app).post('/api/jobs/40/apply').set('Authorization', `Bearer ${cara}`).send({ resume_url: 'https://evil.example/cv.pdf' })
    expect(odd.status).toBe(400)
  })

  it("should accept no resume or the member's own", async () => {
    db.prepare("INSERT INTO jobs (id, title, company, posted_by) VALUES (41, 'Third Job', 'TestCo', 1)").run()
    expect((await request(app).post('/api/jobs/41/apply').set('Authorization', `Bearer ${cara}`).send({})).status).toBe(201)
    const own = (await upload(bob)).body.url
    expect((await request(app).post('/api/jobs/41/apply').set('Authorization', `Bearer ${bob}`).send({ resume_url: own })).status).toBe(201)
  })
})
