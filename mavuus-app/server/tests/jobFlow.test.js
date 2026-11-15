import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import request from 'supertest'
import { createTestApp, generateTestToken } from './setup.js'
import { ensureJobApplicationStatuses } from '../db/jobApplications.js'

let app, db, alice, bob

beforeAll(() => {
  const env = createTestApp()
  app = env.app
  db = env.db
  alice = generateTestToken({ id: 1, email: 'alice@test.com', name: 'Alice Test' })
  bob = generateTestToken({ id: 2, email: 'bob@test.com', name: 'Bob Test' })
  const insertJob = db.prepare(
    'INSERT INTO jobs (id, title, company, type, seniority, posted_by, moderation_status, admin_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  )
  insertJob.run(10, 'Hire Me Job', 'TestCo', 'contract', 'Senior', 1, 'approved', 'internal note')
  insertJob.run(11, 'Hidden Job', 'TestCo', 'contract', 'Junior', 1, 'hidden', 'spam?')
  insertJob.run(12, 'Removed Job', 'TestCo', 'contract', 'Senior', 1, 'removed', null)
})

afterAll(() => {
  db.close()
})

describe('hiring an applicant', () => {
  it('should mark the application hired and move the job to in-progress with the hired member', async () => {
    const applied = await request(app).post('/api/jobs/10/apply').set('Authorization', `Bearer ${bob}`).send({ cover_letter: 'Hi' })
    expect(applied.status).toBe(201)
    const { id } = db.prepare('SELECT id FROM job_applications WHERE job_id = 10 AND user_id = 2').get()

    const res = await request(app)
      .put(`/api/jobs/applications/${id}/status`)
      .set('Authorization', `Bearer ${alice}`)
      .send({ status: 'hired' })

    expect(res.status).toBe(200)
    expect(db.prepare('SELECT status FROM job_applications WHERE id = ?').get(id).status).toBe('hired')
    const job = db.prepare('SELECT status, hired_user_id FROM jobs WHERE id = 10').get()
    expect(job).toEqual({ status: 'in-progress', hired_user_id: 2 })
  })
})

describe('ensureJobApplicationStatuses', () => {
  function oldDatabase() {
    const old = new Database(':memory:')
    old.exec(`
      CREATE TABLE users (id INTEGER PRIMARY KEY);
      CREATE TABLE jobs (id INTEGER PRIMARY KEY);
      CREATE TABLE job_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        cover_letter TEXT,
        resume_filename TEXT,
        resume_url TEXT,
        status TEXT DEFAULT 'applied' CHECK(status IN ('applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn')),
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, user_id)
      );
      INSERT INTO users (id) VALUES (1), (2);
      INSERT INTO jobs (id) VALUES (5);
      INSERT INTO job_applications (id, job_id, user_id, cover_letter, status) VALUES (7, 5, 2, 'Hello', 'reviewing');
    `)
    old.pragma('foreign_keys = ON')
    return old
  }

  it('should rebuild an old table so it accepts hired, keeping its rows and ids', () => {
    const old = oldDatabase()
    expect(() => old.prepare("UPDATE job_applications SET status = 'hired' WHERE id = 7").run()).toThrow()

    expect(ensureJobApplicationStatuses(old)).toBe(true)

    expect(old.prepare('SELECT id, job_id, user_id, cover_letter, status FROM job_applications').all()).toEqual([
      { id: 7, job_id: 5, user_id: 2, cover_letter: 'Hello', status: 'reviewing' },
    ])
    old.prepare("UPDATE job_applications SET status = 'hired' WHERE id = 7").run()
    expect(() => old.prepare("UPDATE job_applications SET status = 'bogus' WHERE id = 7").run()).toThrow()
    expect(() => old.prepare('INSERT INTO job_applications (job_id, user_id) VALUES (5, 2)').run()).toThrow()
    old.close()
  })

  it('should never reuse an id the old table handed out', () => {
    const old = oldDatabase()
    old.prepare("INSERT INTO job_applications (id, job_id, user_id) VALUES (9, 5, 1)").run()
    old.prepare('DELETE FROM job_applications WHERE id = 9').run()
    expect(old.prepare("SELECT seq FROM sqlite_sequence WHERE name = 'job_applications'").get().seq).toBe(9)

    ensureJobApplicationStatuses(old)

    const { lastInsertRowid } = old.prepare('INSERT INTO job_applications (job_id, user_id) VALUES (5, 1)').run()
    expect(Number(lastInsertRowid)).toBeGreaterThan(9)
    old.close()
  })

  it('should leave a current table alone', () => {
    expect(ensureJobApplicationStatuses(db)).toBe(false)
  })
})

describe('job status changes', () => {
  it('should refuse a status the jobs table does not allow', async () => {
    const res = await request(app).put('/api/jobs/10').set('Authorization', `Bearer ${alice}`).send({ status: 'paused' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/status/i)
  })

  it('should change the status for the poster', async () => {
    const res = await request(app).put('/api/jobs/10').set('Authorization', `Bearer ${alice}`).send({ status: 'completed' })
    expect(res.status).toBe(200)
    expect(db.prepare('SELECT status FROM jobs WHERE id = 10').get().status).toBe('completed')
  })
})

describe('public job routes', () => {
  it('should leave hidden and removed jobs out of the list and never send admin fields', async () => {
    const res = await request(app).get('/api/jobs?limit=100')
    const titles = res.body.data.map((job) => job.title)
    expect(titles).toContain('Hire Me Job')
    expect(titles).not.toContain('Hidden Job')
    expect(titles).not.toContain('Removed Job')
    expect(res.body.total).toBe(res.body.data.length)
    for (const job of res.body.data) {
      expect(job).not.toHaveProperty('admin_notes')
      expect(job).not.toHaveProperty('moderation_status')
    }
  })

  it('should answer 404 for a hidden job unless the poster asks', async () => {
    expect((await request(app).get('/api/jobs/11')).status).toBe(404)
    expect((await request(app).get('/api/jobs/11').set('Authorization', `Bearer ${bob}`)).status).toBe(404)
    const own = await request(app).get('/api/jobs/11').set('Authorization', `Bearer ${alice}`)
    expect(own.status).toBe(200)
    expect(own.body).not.toHaveProperty('admin_notes')
  })

  it('should not send admin fields on a single job or saved jobs', async () => {
    const job = await request(app).get('/api/jobs/10')
    expect(job.status).toBe(200)
    expect(job.body).not.toHaveProperty('admin_notes')
    expect(job.body).not.toHaveProperty('moderation_status')

    await request(app).post('/api/jobs/10/save').set('Authorization', `Bearer ${bob}`)
    const saved = await request(app).get('/api/jobs/saved').set('Authorization', `Bearer ${bob}`)
    expect(saved.body.map((j) => j.id)).toContain(10)
    for (const row of saved.body) expect(row).not.toHaveProperty('admin_notes')
  })

  it('should filter the list by seniority on the server', async () => {
    const res = await request(app).get('/api/jobs?seniority=Senior&limit=100')
    expect(res.body.data.map((job) => job.title)).toEqual(['Hire Me Job'])
    expect(res.body.total).toBe(1)
  })
})

describe('hidden and removed jobs for members', () => {
  it('should refuse to apply to or save a job that is not approved', async () => {
    const applied = await request(app).post('/api/jobs/11/apply').set('Authorization', `Bearer ${bob}`).send({})
    expect(applied.status).toBe(404)
    const saved = await request(app).post('/api/jobs/12/save').set('Authorization', `Bearer ${bob}`)
    expect(saved.status).toBe(404)
  })

  it('should leave them out of saved jobs and mark them unavailable in my applications', async () => {
    db.prepare('INSERT INTO saved_jobs (user_id, job_id) VALUES (2, 11)').run()
    db.prepare("INSERT INTO job_applications (job_id, user_id, status) VALUES (12, 2, 'applied')").run()

    const saved = await request(app).get('/api/jobs/saved').set('Authorization', `Bearer ${bob}`)
    expect(saved.body.map((job) => job.id)).not.toContain(11)

    const apps = await request(app).get('/api/jobs/my-applications').set('Authorization', `Bearer ${bob}`)
    const byJob = Object.fromEntries(apps.body.map((app) => [app.job_id, app]))
    expect(byJob[12].unavailable).toBe(true)
    expect(byJob[10].unavailable).toBe(false)
    expect(byJob[12]).not.toHaveProperty('moderation_status')
  })
})
