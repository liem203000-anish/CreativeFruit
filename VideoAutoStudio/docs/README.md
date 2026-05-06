# VideoAutoStudio Documentation

> Comprehensive documentation for VideoAutoStudio - Automated Video Creation Platform

## Quick Links

| Section | Description |
|---------|-------------|
| [System Architecture](architecture/SYSTEM_ARCHITECTURE.md) | Complete system architecture, tech stack, data flow |
| [Video Creation Flow](workflows/VIDEO_CREATION_FLOW.md) | End-to-end video creation workflow |
| [API Reference](api/API_REFERENCE.md) | Complete API endpoint reference |
| **Development Phases** | |
| [Phase 1: Foundation](phases/PHASE_1_FOUNDATION.md) | Project setup, auth, DB schema, basic UI |
| [Phase 2: Google Drive](phases/PHASE_2_GOOGLE_DRIVE.md) | Google Drive OAuth, video import |
| [Phase 3: Video Merging](phases/PHASE_3_VIDEO_MERGING.md) | FFmpeg processing, TikTok audio |
| [Phase 4: Templates](phases/PHASE_4_TEMPLATES.md) | CapCut template integration |
| [Phase 5: AI Script](phases/PHASE_5_AI_SCRIPT.md) | Claude script generation |
| [Phase 6: Voiceover](phases/PHASE_6_VOICEOVER.md) | ElevenLabs voiceover system |
| [Phase 7: i18n](phases/PHASE_7_I18N.md) | English/Vietnamese support |
| [Phase 8: Polish](phases/PHASE_8_POLISH.md) | Testing, optimization, deployment |

## Project Overview

**VideoAutoStudio** is a web application that automates video creation by combining:
- **Google Drive videos** from multiple folders
- **Trending TikTok audio** tracks
- **CapCut templates** (pre-created)
- **AI-generated scripts** (Claude API)
- **AI voiceovers** (ElevenLabs API)
- **Full i18n support** (English & Vietnamese)

### Key Stats

| Metric | Value |
|--------|-------|
| **Backend** | Node.js/Express + PostgreSQL |
| **Frontend** | React 18 + Vite + React Query |
| **AI Integration** | Claude (scripts) + ElevenLabs (voice) |
| **Video Processing** | FFmpeg (merge, audio, templates) |
| **Languages** | English + Vietnamese (i18n) |
| **Deployment** | Docker Compose (3 services) |
| **Est. Duration** | 8-12 weeks (8 phases) |

## Architecture at a Glance

```
VideoAutoStudio/
├── docker-compose.yml          # 3 services: postgres, api, ui
├── .env.example                # API keys template
├── README.md                   # Project overview
├── backend/
│   └── src/
│       ├── server.js           # Express entry point (port 4000)
│       ├── config/
│       │   ├── database.js    # pg Pool connection
│       │   └── init.sql       # Full schema
│       ├── middleware/
│       │   └── auth.js        # JWT auth + RBAC
│       ├── routes/             # API route modules
│       └── services/          # External service integrations
└── frontend/
    └── src/
        ├── App.jsx            # Router + state
        ├── i18n/              # EN/VI translations
        ├── contexts/          # Auth context
        ├── services/          # API client
        └── pages/             # Page components
```

## User Roles

| Role | Access Level |
|------|-------------|
| **Admin** | Full access: users, API keys, all features |
| **Creator** | Create projects, generate scripts, export videos |
| **Viewer** | View projects, download exports |

## Development Phases Summary

| Phase | Name | Duration | Priority | Status |
|-------|------|----------|----------|--------|
| 1 | Foundation | 1-2 weeks | Critical | Not Started |
| 2 | Google Drive Integration | 1-2 weeks | High | Not Started |
| 3 | Video Merging & Audio | 2 weeks | High | Not Started |
| 4 | CapCut Templates | 2 weeks | Medium | Not Started |
| 5 | AI Script Generation | 1-2 weeks | Medium | Not Started |
| 6 | Voiceover System | 2 weeks | High | Not Started |
| 7 | i18n EN/VI | 1 week | Medium | Not Started |
| 8 | Polish & Deploy | 1-2 weeks | Critical | Not Started |

## Key Workflows

### Video Creation Flow
1. **Import Videos** → Connect Google Drive → Browse folders → Import clips
2. **Create Project** → Select videos → Arrange timeline → Trim segments
3. **Add Audio** → Browse trending TikTok sounds → Select track
4. **Apply Template** → Choose CapCut template → Fill variables
5. **Generate Script** → Select language (EN/VI) → Choose tone → Generate
6. **Create Voiceover** → Select voice → Generate TTS → Sync with video
7. **Process & Export** → Merge video + audio + voiceover + text → Export MP4

### Script Generation Flow
1. User selects language (EN/VI)
2. User selects tone (professional, casual, etc.)
3. User selects template (optional)
4. AI generates script based on inputs
5. User edits script if needed
6. Script saved to database

### Voiceover Flow
1. User selects script
2. User selects voice (EN or VI voices)
3. User adjusts speed (0.5x - 2.0x)
4. ElevenLabs API generates audio
5. Audio file saved and linked to script
6. User can play/download voiceover

## External Integrations

### Google Drive API
- **Purpose**: Import video clips from user's Drive
- **Setup**: Google Cloud Console → Enable Drive API → OAuth2 credentials
- **Scopes**: `drive.readonly`, `userinfo.email`
- **Get keys**: [Google Cloud Console](https://console.cloud.google.com/)

### ElevenLabs API
- **Purpose**: Generate AI voiceovers (EN/VI)
- **Setup**: Create account → Get API key
- **Model**: `eleven_multilingual_v2` (supports VI)
- **Get keys**: [ElevenLabs Dashboard](https://elevenlabs.io/)

### Claude API (Anthropic)
- **Purpose**: Generate video scripts
- **Setup**: Create account → Get API key
- **Model**: `claude-3-5-sonnet-20241022`
- **Get keys**: [Anthropic Console](https://console.anthropic.com/)

### TikTok (Optional)
- **Purpose**: Fetch trending audio tracks
- **Options**: Official API (approved apps) or web scraping
- **Get access**: [TikTok Developer Portal](https://developers.tiktok.com/)

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/videoautostudio
PG_HOST=localhost
PG_PORT=5432
PG_USER=videoautostudio_user
PG_PASSWORD=secure_password
PG_DATABASE=videoautostudio

# JWT
JWT_SECRET=change_this_to_secure_random_string
JWT_EXPIRY=7d

# Google Drive
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Claude AI
CLAUDE_API_KEY=your_claude_api_key

# TikTok (optional)
TIKTOK_API_KEY=your_tiktok_api_key

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Development Commands

```bash
# Start all services (Docker)
docker compose up --build

# Start locally (no Docker)
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev

# Reset database
docker compose down -v && docker compose up --build

# Run tests
cd backend && npm test
cd frontend && npm test

# Build for production
cd frontend && npm run build
```

## API Base URLs

- **Local Development**:
  - Frontend: `http://localhost:3000`
  - Backend: `http://localhost:4000/api`
- **Production**:
  - Frontend: `https://yourdomain.com`
  - Backend: `https://yourdomain.com/api`

## Contributing

This project follows coding standards based on ClipForge:

### Backend (Node.js + Express + PostgreSQL)
- Use CommonJS (`require()`/`module.exports`)
- All routes must use `authenticate` middleware unless public
- Role checks: `requireRole(['admin', 'creator'])`
- Database: Use raw `pg` queries via `db.query()`
- Wrap database operations in try/catch
- All API responses: `{ success: true, data: ... }` or `{ success: false, error: '...' }`

### Frontend (React + Vite)
- Use ESM (`import`/`export`)
- State-based routing in `App.jsx`
- All API calls through `api.js` service methods
- Auth state from `AuthContext.jsx`
- Dark theme via CSS variables
- Use `useTranslation()` for all text (i18n)

## Common Tasks

- **Add a new route**: Create file in `backend/src/routes/` and register in `server.js`
- **Add a new page**: Create file in `frontend/src/pages/` and add route in `App.jsx`
- **Add a new API method**: Add to `frontend/src/services/api.js`
- **Modify database**: Edit `backend/src/config/init.sql` and reset DB
- **Add translation**: Update `frontend/src/i18n/en.json` and `vi.json`

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify `.env` file exists with correct values
- Check port 4000 not in use: `netstat -ano | findstr :4000`

### Frontend won't start
- Check Node.js version: `node --version` (need 18+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check port 3000 not in use

### Google Drive not connecting
- Verify Client ID/Secret in `.env`
- Check redirect URI matches exactly: `http://localhost:4000/api/auth/google/callback`
- Check scopes are correct in Google Cloud Console

### ElevenLabs generation fails
- Verify API key in `.env`
- Check character quota (ElevenLabs dashboard)
- Check script length (too long may fail)

### FFmpeg errors
- Verify FFmpeg installed: `ffmpeg -version`
- Check video file formats (MP4/H.264 recommended)
- Check disk space for output files

## License

Internal use only. All rights reserved.

---

**Built based on ClipForge architecture** - A self-hosted content management platform for restaurant video marketing.
