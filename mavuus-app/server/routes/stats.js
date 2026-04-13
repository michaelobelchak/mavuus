import { Router } from 'express'

const router = Router()

// Public community stats — used by HomePage hero counters
router.get('/', (req, res) => {
  const db = req.app.locals.db

  const membersCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c
  const sessionsCount = db.prepare('SELECT COUNT(*) AS c FROM sessions').get().c
  const liveSessionsCount = db.prepare("SELECT COUNT(*) AS c FROM sessions WHERE type = 'live'").get().c
  const onDemandCount = db.prepare("SELECT COUNT(*) AS c FROM sessions WHERE type = 'on-demand'").get().c
  const vendorsCount = db.prepare('SELECT COUNT(*) AS c FROM vendors').get().c
  const resourcesCount = db.prepare('SELECT COUNT(*) AS c FROM resources').get().c
  const speakersCount = db.prepare('SELECT COUNT(DISTINCT speaker_name) AS c FROM sessions WHERE speaker_name IS NOT NULL').get().c

  res.json({
    members: membersCount,
    sessions: sessionsCount,
    liveSessions: liveSessionsCount,
    onDemand: onDemandCount,
    vendors: vendorsCount,
    resources: resourcesCount,
    speakers: speakersCount,
  })
})

export default router
