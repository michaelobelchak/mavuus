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

  it('should leave a current table alone', () => {
    expect(ensureJobApplicationStatuses(db)).toBe(false)
  })
})
