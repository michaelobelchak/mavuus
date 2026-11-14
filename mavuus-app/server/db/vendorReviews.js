// Vendor reviews: the one-review-per-member rule and the rating math. Vendor reviews are written
// to the vendor's owner account (vendors.user_id, see vendorOwners.js).

/**
 * Deletes repeat vendor reviews (same reviewer and vendor), keeping the earliest row, so the
 * unique index idx_reviews_vendor_once in schema.sql can be created on an older database. Run it
 * before db.exec(schema). Returns the number of rows deleted; 0 once the index exists.
 */
export function dedupeVendorReviews(db) {
  const hasReviews = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'reviews'").get()
  if (!hasReviews) return 0
  return db.prepare(`
    DELETE FROM reviews
    WHERE vendor_id IS NOT NULL
      AND id NOT IN (SELECT MIN(id) FROM reviews WHERE vendor_id IS NOT NULL GROUP BY reviewer_id, vendor_id)
  `).run().changes
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
