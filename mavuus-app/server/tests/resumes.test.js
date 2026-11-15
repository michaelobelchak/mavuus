import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { existsSync, mkdtempSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { createTestApp, generateTestToken } from './setup.js'
import { JWT_SECRET } from '../middleware/auth.js'
import { RESUMES_DIR, migrateResumeFiles, resumeName, resumePath, samplePdf } from '../db/resumes.js'

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
    const legacy = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee.pdf'
    writeFileSync(resumePath(legacy), PDF)
    db.prepare(`UPDATE user_profiles SET resume_url = '/uploads/resumes/${legacy}' WHERE user_id = 3`).run()
    expect((await read(cara, `/api/files/resumes/${legacy}`)).status).toBe(200)
    expect((await read(alice, `/api/files/resumes/${legacy}`)).status).toBe(404)
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

describe('the member profile', () => {
  it('should include the resume url, so the apply dialog can offer the profile resume', async () => {
    const url = (await upload(bob)).body.url
    const me = await request(app).get('/api/profile/me').set('Authorization', `Bearer ${bob}`)
    expect(me.body.resume_url).toBe(url)
  })
})

describe('resumes outside the static root', () => {
  it('should answer 404 to encoded and dotted /uploads paths and still serve the files route', async () => {
    const url = (await upload(bob)).body.url
    const name = fileOf(url)
    for (const path of [
      `/uploads/resumes/${name}`,
      `/uploads/%72esumes/${name}`,
      `/uploads/resume%73/${name}`,
      `/uploads/%2e%2e/private/resumes/${name}`,
      `/uploads/..%2fprivate%2fresumes%2f${name}`,
      `/uploads/%2E%2E/%2E%2E/private/resumes/${name}`,
    ]) {
      expect((await read(bob, path)).status, path).toBe(404)
    }
    const res = await read(bob, url)
    expect(res.status).toBe(200)
    expect(res.headers['content-security-policy']).toBe('sandbox')
  })
})

describe('migrateResumeFiles', () => {
  const UUID_PDF = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/

  it('should move resumes out of uploads, rename real PDFs, drop the rest and update the rows', () => {
    const env = createTestApp()
    const mdb = env.db
    mdb.prepare("INSERT INTO users (id, email, password_hash, name) VALUES (3, 'cara@test.com', 'x', 'Cara Test')").run()
    const from = mkdtempSync(join(tmpdir(), 'resumes-from-'))
    const to = mkdtempSync(join(tmpdir(), 'resumes-to-'))
    writeFileSync(join(from, 'resume-2-1.pdf'), PDF)
    writeFileSync(join(from, 'resume-3-1.pdf'), Buffer.from('<html>not a pdf</html>'))
    const kept = '11111111-2222-4333-8444-555555555555.pdf'
    writeFileSync(join(from, kept), PDF)
    mdb.prepare("INSERT INTO user_profiles (user_id, resume_filename, resume_url) VALUES (2, 'bob.pdf', '/uploads/resumes/resume-2-1.pdf')").run()
    mdb.prepare("INSERT INTO user_profiles (user_id, resume_filename, resume_url) VALUES (3, 'cara.pdf', '/uploads/resumes/resume-3-1.pdf')").run()
    mdb.prepare("INSERT INTO user_profiles (user_id, resume_url) VALUES (1, '/uploads/resumes/" + kept + "')").run()
    mdb.prepare("INSERT INTO job_applications (job_id, user_id, resume_url) VALUES (1, 2, '/uploads/resumes/resume-2-1.pdf')").run()
    mdb.prepare("INSERT INTO job_applications (job_id, user_id, resume_url) VALUES (1, 3, '/uploads/resumes/resume-3-1.pdf')").run()

    const first = migrateResumeFiles(mdb, { from, to })
    expect(first).toEqual({ moved: 3, renamed: 1, removed: 1 })

    expect(readdirSync(from)).toEqual([])
    const files = readdirSync(to)
    expect(files).toHaveLength(2)
    expect(files.every((name) => UUID_PDF.test(name))).toBe(true)
    const bobUrl = mdb.prepare('SELECT resume_url FROM user_profiles WHERE user_id = 2').get().resume_url
    expect(bobUrl).toMatch(/^\/api\/files\/resumes\/[0-9a-f-]{36}\.pdf$/)
    expect(files).toContain(resumeName(bobUrl))
    expect(mdb.prepare('SELECT resume_url FROM job_applications WHERE user_id = 2').get().resume_url).toBe(bobUrl)
    expect(mdb.prepare('SELECT resume_url, resume_filename FROM user_profiles WHERE user_id = 3').get()).toEqual({ resume_url: null, resume_filename: null })
    expect(mdb.prepare('SELECT resume_url FROM job_applications WHERE user_id = 3').get().resume_url).toBeNull()
    // An already random name keeps its file; the old url form still points at it.
    expect(files).toContain(kept)

    expect(migrateResumeFiles(mdb, { from, to })).toEqual({ moved: 0, renamed: 0, removed: 0 })
    expect(readdirSync(to).sort()).toEqual(files.sort())
    mdb.close()
    for (const name of readdirSync(to)) unlinkSync(join(to, name))
    rmdirSync(to)
    rmdirSync(from)
  })
})

describe('samplePdf', () => {
  it('should build a small PDF whose cross-reference table points at its objects', () => {
    const pdf = samplePdf(['Demo User', 'Marketing Director']).toString('latin1')
    expect(pdf.startsWith('%PDF-1.4')).toBe(true)
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true)
    const startxref = Number(pdf.match(/startxref\s+(\d+)/)[1])
    expect(pdf.slice(startxref, startxref + 4)).toBe('xref')
    const offsets = [...pdf.slice(startxref).matchAll(/^(\d{10}) 00000 n/gm)].map((m) => Number(m[1]))
    expect(offsets).toHaveLength(5)
    offsets.forEach((offset, i) => expect(pdf.slice(offset, offset + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`))
    expect(pdf).toContain('(Marketing Director) Tj')
  })
})
