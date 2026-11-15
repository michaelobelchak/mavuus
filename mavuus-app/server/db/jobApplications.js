// Job application statuses. Hiring sets an application to 'hired', which older databases refuse:
// their job_applications CHECK predates it, and SQLite can't change a CHECK in place.

/** Every status an application can have, in the order a hire moves through them. */
export const APPLICATION_STATUSES = ['applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn', 'hired']

/**
 * Rebuilds job_applications when its CHECK doesn't allow 'hired' yet (databases created before
 * the status was added), keeping every row, id and the AUTOINCREMENT counter, so an id the old
 * table handed out is never reused. Runs in one transaction, so a failure leaves the old table.
 * Run it after db.exec(schema). Returns true when it rebuilt the table.
 *
 * SQLite's full table-change recipe turns foreign_keys off around the rebuild. That isn't needed
 * here: no table references job_applications, so dropping it can't break or cascade into another
 * table, and its own references (jobs, users) are copied row for row and stay valid.
 */
export function ensureJobApplicationStatuses(db) {
  const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'job_applications'").get()
  if (!table || table.sql.includes("'hired'")) return false
  const checked = APPLICATION_STATUSES.map((status) => `'${status}'`).join(', ')
  const sequence = db.prepare("SELECT seq FROM sqlite_sequence WHERE name = 'job_applications'").get()?.seq ?? 0
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
    // The copy sets the counter to the highest id left; keep the old one when it was higher.
    db.prepare("UPDATE sqlite_sequence SET seq = MAX(seq, ?) WHERE name = 'job_applications'").run(sequence)
    if (!db.prepare("SELECT 1 FROM sqlite_sequence WHERE name = 'job_applications'").get()) {
      db.prepare("INSERT INTO sqlite_sequence (name, seq) VALUES ('job_applications', ?)").run(sequence)
    }
  })()
  return true
}
