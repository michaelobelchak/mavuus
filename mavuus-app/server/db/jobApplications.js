// Job application statuses. Hiring sets an application to 'hired', which older databases refuse:
// their job_applications CHECK predates it, and SQLite can't change a CHECK in place.

/** Every status an application can have, in the order a hire moves through them. */
export const APPLICATION_STATUSES = ['applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn', 'hired']

/**
 * Rebuilds job_applications when its CHECK doesn't allow 'hired' yet (databases created before
 * the status was added), keeping every row and id. Runs in one transaction, so a failure leaves
 * the old table. Run it after db.exec(schema). Returns true when it rebuilt the table.
 */
export function ensureJobApplicationStatuses(db) {
  const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'job_applications'").get()
  if (!table || table.sql.includes("'hired'")) return false
  const checked = APPLICATION_STATUSES.map((status) => `'${status}'`).join(', ')
  db.transaction(() => {
    db.exec(`
      CREATE TABLE job_applications_next (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        cover_letter TEXT,
        resume_filename TEXT,
        resume_url TEXT,
        status TEXT DEFAULT 'applied' CHECK(status IN (${checked})),
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, user_id)
      );
      INSERT INTO job_applications_next (id, job_id, user_id, cover_letter, resume_filename, resume_url, status, applied_at, updated_at)
        SELECT id, job_id, user_id, cover_letter, resume_filename, resume_url, status, applied_at, updated_at FROM job_applications;
      DROP TABLE job_applications;
      ALTER TABLE job_applications_next RENAME TO job_applications;
    `)
  })()
  return true
}
