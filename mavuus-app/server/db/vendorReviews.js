// Vendor reviews: the one-review-per-member rule, the rating math and the seeded review rows.
// Vendor reviews are written to the vendor's owner account (vendors.user_id, see vendorOwners.js).

/**
 * Creates the unique index idx_reviews_vendor_once (one review per member per vendor) if it
 * doesn't exist yet. An older database may hold repeat vendor reviews, which the index would
 * refuse, so in one transaction it first deletes them, keeping each member's latest review of a
 * vendor (the highest id: the latest opinion wins), recalculates the ratings and creates the
 * index. Run it after db.exec(schema). Returns the number of reviews deleted; 0 once the index
 * exists.
 */
export function ensureVendorReviewIndex(db) {
  const exists = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'idx_reviews_vendor_once'").get()
  if (exists) return 0
  return db.transaction(() => {
    const deleted = db.prepare(`
      DELETE FROM reviews
      WHERE vendor_id IS NOT NULL
        AND id NOT IN (SELECT MAX(id) FROM reviews WHERE vendor_id IS NOT NULL GROUP BY reviewer_id, vendor_id)
    `).run().changes
    if (deleted > 0) recalcAllVendorRatings(db)
    db.exec('CREATE UNIQUE INDEX idx_reviews_vendor_once ON reviews(reviewer_id, vendor_id) WHERE vendor_id IS NOT NULL')
    return deleted
  })()
}

/** Sets a vendor's rating (average, one decimal, 0 without reviews) and review count from its rows. */
export function recalcVendorRating(db, vendorId) {
  db.prepare(`
    UPDATE vendors SET
      rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE vendor_id = ?), 0),
      reviews_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id = ?)
    WHERE id = ?
  `).run(vendorId, vendorId, vendorId)
}

/** recalcVendorRating for every vendor. */
export function recalcAllVendorRatings(db) {
  for (const { id } of db.prepare('SELECT id FROM vendors').all()) recalcVendorRating(db, id)
}

/** Points every vendor review at its vendor's owner account (older seeds used the demo user). */
export function repointVendorReviews(db) {
  return db.prepare(`
    UPDATE reviews SET reviewee_id = (SELECT user_id FROM vendors WHERE vendors.id = reviews.vendor_id)
    WHERE vendor_id IS NOT NULL
      AND (SELECT user_id FROM vendors WHERE vendors.id = reviews.vendor_id) IS NOT NULL
      AND reviewee_id != (SELECT user_id FROM vendors WHERE vendors.id = reviews.vendor_id)
  `).run().changes
}

/** [vendor company_name, reviewer email, rating, text, created_at]: 3 to 5 per seeded vendor. */
export const VENDOR_REVIEWS = [
  ['ContentPro Agency', 'sarah@techflow.com', 5, 'ContentPro Agency transformed our content pipeline. Their team understood our B2B audience perfectly and delivered consistent, high-quality work.', '2026-02-15T10:00:00Z'],
  ['ContentPro Agency', 'lisa@notion.com', 5, 'Their writers ramped up on a technical product in two weeks. Our organic signups doubled in a quarter.', '2026-02-26T09:30:00Z'],
  ['ContentPro Agency', 'tom@datadog.com', 4, 'Strong editorial process and clear briefs. Turnaround slipped once during a launch, but they owned it.', '2026-03-04T15:00:00Z'],
  ['ContentPro Agency', 'rachel@asana.com', 5, 'The SEO content clusters they built still bring in our best leads. Easy to work with.', '2026-03-12T11:00:00Z'],

  ['PipelineHQ', 'marcus@growthbase.com', 5, 'PipelineHQ rebuilt our ABM motion from target list to sales handoff. Pipeline from named accounts grew 40%.', '2026-01-22T10:00:00Z'],
  ['PipelineHQ', 'priya@cloudscale.com', 5, 'They know enterprise demand gen. Clear playbooks, honest reporting and no vanity metrics.', '2026-02-09T13:00:00Z'],
  ['PipelineHQ', 'alex@stripe.com', 4, 'Great strategy work. We needed more hands-on campaign help than the retainer covered.', '2026-02-28T16:00:00Z'],
  ['PipelineHQ', 'jennifer@hubspot.com', 5, 'The best ABM partner we have worked with. Their intent data setup paid for itself in a month.', '2026-03-15T09:00:00Z'],
  ['PipelineHQ', 'ryan@shopify.com', 5, 'Fast, data driven and great at aligning marketing with sales. Would hire again.', '2026-03-20T14:30:00Z'],

  ['BrandSpark Studio', 'elena@drift.com', 4, 'BrandSpark Studio delivered a stunning rebrand for us. Creative, professional, and great at meeting deadlines. Would definitely work with them again.', '2026-02-20T14:00:00Z'],
  ['BrandSpark Studio', 'omar@canva.com', 5, 'They turned a messy positioning brief into a brand system our whole team uses. Thoughtful designers.', '2026-03-02T10:00:00Z'],
  ['BrandSpark Studio', 'maya@spotify.com', 4, 'Beautiful work and a smooth process. Plan extra time for the guidelines document.', '2026-03-18T12:00:00Z'],

  ['GrowthLab Analytics', 'james@amplitude.com', 5, 'GrowthLab set up attribution we finally trust. The board deck practically writes itself now.', '2026-01-30T11:00:00Z'],
  ['GrowthLab Analytics', 'david@twilio.com', 4, 'Solid analysts who explain their models. The first dashboard took longer than planned.', '2026-02-18T15:00:00Z'],
  ['GrowthLab Analytics', 'nina@intercom.com', 5, 'They cleaned up our martech data and showed us which channels actually drive revenue.', '2026-03-06T10:30:00Z'],
  ['GrowthLab Analytics', 'aisha@figma.com', 4, 'Useful insights and a practical roadmap. Great partner for a lean ops team.', '2026-03-22T13:00:00Z'],

  ['Elevate PR', 'aisha@figma.com', 5, 'Elevate PR landed us three tier one stories in our launch week. Sharp pitching and great media relationships.', '2026-02-03T09:00:00Z'],
  ['Elevate PR', 'david@twilio.com', 4, 'Good analyst relations work. Reporting could be more frequent, but results were there.', '2026-02-24T14:00:00Z'],
  ['Elevate PR', 'sarah@techflow.com', 4, 'They helped our executives find their voice. Thoughtful about which stories to tell.', '2026-03-11T16:00:00Z'],

  ['PixelCraft Creative', 'maya@spotify.com', 5, 'PixelCraft made customer story videos our sales team actually sends. Great storytelling and fast edits.', '2026-01-27T12:00:00Z'],
  ['PixelCraft Creative', 'ryan@shopify.com', 5, 'Top quality product demos on a startup budget. They handled scripting through final cut.', '2026-02-14T10:00:00Z'],
  ['PixelCraft Creative', 'omar@canva.com', 4, 'Creative team with a good eye for brand. A round of revisions ran long, but the result was worth it.', '2026-03-09T11:00:00Z'],
  ['PixelCraft Creative', 'lisa@notion.com', 5, 'Our launch film beat every engagement benchmark we had. Already booked them again.', '2026-03-25T15:30:00Z'],

  ['Lifecycle Labs', 'nina@intercom.com', 5, 'Lifecycle Labs rebuilt our onboarding emails and trial conversion went up 18%.', '2026-02-05T10:00:00Z'],
  ['Lifecycle Labs', 'alex@stripe.com', 5, 'They think in experiments, not campaigns. Every test came with a clear readout.', '2026-02-22T13:00:00Z'],
  ['Lifecycle Labs', 'jennifer@hubspot.com', 4, 'Strong retention strategy and CRM hygiene. Needed a bit of help getting dev time on our side.', '2026-03-14T09:30:00Z'],

  ['NorthStar Events', 'marcus@growthbase.com', 5, 'NorthStar ran our executive dinner series flawlessly. Every event turned into pipeline.', '2026-01-25T18:00:00Z'],
  ['NorthStar Events', 'elena@drift.com', 5, 'Our virtual summit felt like a TV production. Great speaker management and follow up.', '2026-02-12T17:00:00Z'],
  ['NorthStar Events', 'tom@datadog.com', 4, 'Well organized field events. Venue options in smaller cities were limited.', '2026-03-03T12:00:00Z'],
  ['NorthStar Events', 'james@amplitude.com', 5, 'They handled every detail of our user conference so our team could focus on customers.', '2026-03-27T10:00:00Z'],
]

/**
 * Adds the seeded vendor reviews a database doesn't have yet (one per reviewer and vendor),
 * written to each vendor's owner, then recalculates every vendor's rating and count from its
 * rows. Run after ensureVendorOwners. Returns the number of reviews added.
 */
export function seedVendorReviews(db) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO reviews (reviewer_id, reviewee_id, vendor_id, rating, text, created_at)
    SELECT u.id, v.user_id, v.id, ?, ?, ?
    FROM users u, vendors v
    WHERE u.email = ? AND v.company_name = ? AND v.user_id IS NOT NULL AND v.user_id != u.id
  `)
  let added = 0
  for (const [company, email, rating, text, createdAt] of VENDOR_REVIEWS) {
    added += insert.run(rating, text, createdAt, email, company).changes
  }
  repointVendorReviews(db)
  recalcAllVendorRatings(db)
  return added
}
