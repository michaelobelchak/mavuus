export function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export function logAudit(db, adminId, action, entityType, entityId, details, ipAddress) {
  db.prepare(
    'INSERT INTO audit_log (admin_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(adminId, action, entityType, entityId || null, details ? JSON.stringify(details) : null, ipAddress || null)
}
