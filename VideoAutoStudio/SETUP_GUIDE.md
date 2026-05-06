# VideoAutoStudio - Quick Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 16+
- Google Drive API credentials
- ElevenLabs API key (free tier available)
- Anthropic Claude API key (optional, for AI scripts)

## 1. Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE videoautostudio;
CREATE USER videoautostudio_user WITH PASSWORD 'videoautostudio_pass_2024';
GRANT ALL PRIVILEGES ON DATABASE videoautostudio TO videoautostudio_user;
\q

# Run schema
psql -U videoautostudio_user -d videoautostudio -f backend/setup-db.sql
```

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your credentials:
```
PG_HOST=localhost
PG_PORT=5432
PG_USER=videoautostudio_user
PG_PASSWORD=videoautostudio_pass_2024
PG_DATABASE=videoautostudio
JWT_SECRET=your-super-secret-jwt-key-change-this
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ELEVENLABS_API_KEY=your-elevenlabs-key
ANTHROPIC_API_KEY=your-claude-api-key
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm start
# or for development
npm run dev
```

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## 4. Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:4000/api/videos/drive/callback`
6. Copy Client ID and Secret to `.env`

## 5. API Keys Setup

### ElevenLabs (Voiceover)
1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Go to Profile → API Key
3. Copy key to `ELEVENLABS_API_KEY`

### Anthropic Claude (AI Scripts)
1. Sign up at [Anthropic](https://console.anthropic.com)
2. Create API key
3. Copy key to `ANTHROPIC_API_KEY`

## 6. Running the App

1. Start PostgreSQL
2. Start backend: `cd backend && npm start`
3. Start frontend: `cd frontend && npm run dev`
4. Open http://localhost:3000
5. Register a new account
6. Connect Google Drive from Drive Videos page
7. Start creating!

## Default Admin Account
- Email: admin@videoautostudio.com
- Password: admin123

## Features Completed
✅ Authentication (JWT + roles)
✅ Google Drive integration
✅ Video import & management
✅ AI script generation (Claude)
✅ Voiceover generation (ElevenLabs)
✅ Project management
✅ Template management (CapCut)
✅ TikTok trending audio
✅ Dashboard with real stats
✅ i18n (EN/VI)
✅ Security (helmet, rate limiting)
✅ Error boundaries
✅ Password change

## Need Help?
Check the `docs/` folder for detailed documentation.
