import { Router } from 'express'
import express from 'express'
import { existsSync } from 'fs'
import { authenticateToken } from '../middleware/auth.js'
import { canReadResume, resumeName, resumePath, resumeUrl } from '../db/resumes.js'

const router = Router()

// GET /api/files/resumes/:name - a resume PDF, for the members canReadResume allows. The session
// cookie (or the Authorization header) signs the request, so a plain link works in the browser.
// Anything the member may not read answers 404, so the route doesn't reveal which files exist.
router.get('/resumes/:name', authenticateToken, (req, res) => {
  const name = resumeName(resumeUrl(req.params.name))
  const db = req.app.locals.db
  if (!name || !canReadResume(db, req.user, name) || !existsSync(resumePath(name))) {
    return res.status(404).json({ error: 'File not found' })
  }
  res.set('Cache-Control', 'private, no-store')
  res.type('application/pdf')
  res.set('Content-Disposition', 'inline; filename="resume.pdf"')
  res.sendFile(resumePath(name))
})

/**
 * Static /uploads (avatars and images) without the resumes folder: resumes go through the
 * route above.
 */
export function uploadsStatic(dir) {
  const files = express.static(dir)
  return (req, res, next) => {
    if (req.path.toLowerCase().startsWith('/resumes')) return res.status(404).json({ error: 'File not found' })
    return files(req, res, next)
  }
}

export default router
