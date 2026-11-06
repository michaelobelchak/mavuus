// The signed-in user withAuth() provides by default: the seeded demo admin (server/db/seed.js),
// in the shape GET /api/auth/me returns. It is the 7th seeded user, so its id is 7.
export const storyUser = {
  id: 7,
  email: 'demo@mavuus.com',
  name: 'Demo User',
  title: 'Marketing Director',
  company: 'Mavuus',
  avatar_url: 'https://i.pravatar.cc/150?u=demo@mavuus.com',
  role: 'admin',
  membership_tier: 'pro',
  email_verified: 1,
}
