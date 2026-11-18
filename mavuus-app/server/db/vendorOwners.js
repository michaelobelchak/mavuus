// Every seeded vendor gets an owner account (vendors.user_id), so members can review it and
// Contact Vendor can start a conversation. Owner accounts are linked from vendors.user_id and
// left out of the member directory and search (routes/members.js, routes/search.js).

/** SQL condition on a users row aliased `u`: not a vendor owner account. */
export const NOT_VENDOR_OWNER = 'NOT EXISTS (SELECT 1 FROM vendors v WHERE v.user_id = u.id)'

/** [company_name, owner email, owner name, owner title] for the seeded vendors. */
export const VENDOR_OWNERS = [
  ['ContentPro Agency', 'hello@contentpro.example', 'ContentPro Agency', 'Content marketing agency'],
  ['PipelineHQ', 'hello@pipelinehq.example', 'PipelineHQ', 'Demand gen consultancy'],
  ['BrandSpark Studio', 'hello@brandspark.example', 'BrandSpark Studio', 'Branding and design studio'],
  ['GrowthLab Analytics', 'hello@growthlab.example', 'GrowthLab Analytics', 'Marketing analytics consultancy'],
  ['Elevate PR', 'hello@elevatepr.example', 'Elevate PR', 'B2B PR firm'],
  ['PixelCraft Creative', 'hello@pixelcraft.example', 'PixelCraft Creative', 'Video production studio'],
  ['Lifecycle Labs', 'hello@lifecyclelabs.example', 'Lifecycle Labs', 'Lifecycle marketing consultancy'],
  ['NorthStar Events', 'hello@northstarevents.example', 'NorthStar Events', 'B2B event agency'],
]

/**
 * Creates the owner accounts that don't exist yet and links each seeded vendor that has no owner.
 * Idempotent: existing accounts and vendors that already have a user_id are left alone. Returns
 * the number of vendors it linked.
 */
export function ensureVendorOwners(db, passwordHash) {
  const insertOwner = db.prepare(`
    INSERT OR IGNORE INTO users (email, password_hash, name, title, company, role, membership_tier, email_verified)
    VALUES (?, ?, ?, ?, ?, 'member', 'free', 1)
  `)
  const link = db.prepare(`
    UPDATE vendors SET user_id = (SELECT id FROM users WHERE email = ?)
    WHERE company_name = ? AND user_id IS NULL
  `)
  let linked = 0
  for (const [company, email, name, title] of VENDOR_OWNERS) {
    const vendor = db.prepare('SELECT id, user_id FROM vendors WHERE company_name = ?').get(company)
    if (!vendor || vendor.user_id) continue
    insertOwner.run(email, passwordHash, name, title, company)
    linked += link.run(email, company).changes
  }
  return linked
}
