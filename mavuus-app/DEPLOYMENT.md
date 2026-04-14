# Mavuus Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Steps
1. Clone the repository
2. Install dependencies:
   ```bash
   cd mavuus-app/server && npm install
   cd ../client && npm install
   ```
3. Copy environment files:
   ```bash
   cp .env.example server/.env
   ```
4. Set up the database:
   ```bash
   cd server
   node db/seed.js
   ```
5. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```
6. Open http://localhost:5173
7. Demo login: demo@mavuus.com / demo123 (admin access)

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3001 | Server port |
| JWT_SECRET | Yes | - | Secret for JWT token signing. Use a long random string in production |
| NODE_ENV | No | development | Set to `production` for production builds |
| CORS_ORIGIN | No | localhost:5173 | Comma-separated allowed origins |
| GOOGLE_CLIENT_ID | No | - | Google OAuth client ID (optional) |
| GOOGLE_CLIENT_SECRET | No | - | Google OAuth client secret (optional) |
| GOOGLE_CALLBACK_URL | No | http://localhost:3001/api/auth/google/callback | OAuth callback URL |

## Database

The app uses SQLite via better-sqlite3. The database file is stored at `server/db/mavuus.db`.

### Reset Database
```bash
cd server
rm -f db/mavuus.db
node db/seed.js
```

### Schema
See `server/db/schema.sql` for the full schema.

## Running Tests
```bash
cd server
npm test
```

## Deploying to Railway (Server)

1. Create a new Railway project
2. Connect your GitHub repository
3. Set the root directory to `mavuus-app/server`
4. Add environment variables:
   - `JWT_SECRET` (generate a strong random string)
   - `NODE_ENV=production`
   - `PORT=3001`
5. Railway will auto-detect the Dockerfile and build

## Deploying to Vercel (Client)

1. Create a new Vercel project
2. Connect your GitHub repository
3. Set the root directory to `mavuus-app/client`
4. Framework Preset: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add environment variable: `VITE_API_URL=https://your-api.railway.app`

## Combined Deployment (Express serves client)

1. Build the client: `cd client && npm run build`
2. Set `NODE_ENV=production` on the server
3. The server will automatically serve the client from `client/dist/`
4. Deploy only the server (with client/dist included)

## Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth Client ID
5. Set authorized redirect URI: `https://your-domain.com/api/auth/google/callback`
6. Copy Client ID and Client Secret to environment variables
7. The app gracefully handles missing OAuth config (returns 501)

## Production Checklist

- [ ] Set strong `JWT_SECRET` (minimum 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` with your production domain
- [ ] Set up HTTPS (handled by Railway/Vercel)
- [ ] Configure Google OAuth if needed
- [ ] Seed the database with `node db/seed.js`
- [ ] Verify admin login works (demo@mavuus.com / demo123)
- [ ] Update demo user password in production
- [ ] Set up database backups (copy mavuus.db periodically)
