# VideoAutoStudio System Architecture

## Overview

VideoAutoStudio is a full-stack web application built with a modern JavaScript stack, designed to automate video creation by combining multiple technologies into a seamless workflow.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React Frontend (Vite) - Port 3000                │   │
│  │  • AuthContext (JWT state)                         │   │
│  │  • i18n (EN/VI translations)                       │   │
│  │  • Pages: Drive, Templates, Scripts, Voiceover    │   │
│  │  • API Service (Axios + interceptors)              │   │
│  └────────────────────────┬────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTPS/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               Node.js Backend (Express) - Port 4000        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware                                        │   │
│  │  • CORS (Frontend URL)                            │   │
│  │  • authenticate (JWT verification)                 │   │
│  │  • requireRole (RBAC)                             │   │
│  │  • rateLimit (express-rate-limit)                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Routes                                           │   │
│  │  • /api/auth (login, register, Google OAuth)      │   │
│  │  • /api/videos (Drive import, management)         │   │
│  │  • /api/audio (TikTok trending)                  │   │
│  │  • /api/templates (CapCut templates)              │   │
│  │  • /api/scripts (AI generation)                   │   │
│  │  • /api/voiceover (ElevenLabs TTS)               │   │
│  │  • /api/projects (video assembly)                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Services                                         │   │
│  │  • googleDrive.js (Google Drive API)              │   │
│  │  • tiktokAudio.js (Trending sounds)               │   │
│  │  • capcut.js (Template application)                │   │
│  │  • ffmpeg.js (Video processing)                   │   │
│  │  • ai.js (Claude script generation)               │   │
│  │  • elevenlabs.js (Voice generation)               │   │
│  └────────────────────────┬────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  PostgreSQL  │  │  File System │  │  External APIs   │
│  Port 5432   │  │  (uploads/)  │  │  • Google Drive  │
│              │  │              │  │  • TikTok         │
│  Tables:     │  │  /videos/   │  │  • ElevenLabs    │
│  • users     │  │  /audio/    │  │  • Claude (AI)   │
│  • videos    │  │  /voiceovers│  │                  │
│  • templates │  │  /projects/ │  └──────────────────┘
│  • scripts   │  └──────────────┘
│  • voiceovers│
│  • projects  │
└──────────────┘
```

## Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18+ |
| Express | Web framework | 4.x |
| PostgreSQL | Database | 16+ |
| pg | PostgreSQL client | 8.x |
| jsonwebtoken | JWT authentication | 9.x |
| bcryptjs | Password hashing | 2.4+ |
| multer | File uploads | 1.4+ |
| @anthropic-ai/sdk | Claude API | Latest |
| fluent-ffmpeg | Video processing | Latest |
| googleapis | Google Drive API | Latest |
| axios | HTTP client | Latest |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI library | 18.x |
| Vite | Build tool | 5.x |
| React Router DOM | Routing | 6.x |
| React Query (TanStack) | Data fetching/caching | 5.x |
| React Hook Form | Form handling | 7.x |
| Zod | Schema validation | 4.x |
| react-i18next | Internationalization | Latest |
| Axios | HTTP client | Latest |
| Lucide React | Icons | Latest |
| Recharts | Charts/analytics | 2.x |
| react-hot-toast | Notifications | Latest |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy (production) |
| FFmpeg | Video processing (system dependency) |

## Data Flow Diagrams

### 1. User Authentication Flow

```
User → Frontend → POST /api/auth/login
                     ↓
              Backend: Validate credentials
                     ↓
              DB: SELECT user WHERE email = ?
                     ↓
              Valid? → Generate JWT → Return token to frontend
                     ↓
              Invalid? → Return 401 Unauthorized
                     ↓
Frontend: Store JWT in localStorage/cookie
          Set AuthContext.isAuthenticated = true
```

### 2. Google Drive Video Import Flow

```
User → Frontend: Click "Connect Google Drive"
                  ↓
         GET /api/auth/google (Backend)
                  ↓
         Generate OAuth URL → Redirect to Google
                  ↓
         User authorizes → Google redirects to callback
                  ↓
         GET /api/auth/google/callback (Backend)
                  ↓
         Exchange code for tokens → Store in DB (drive_connections)
                  ↓
         Frontend: Show "Connected" status
                  ↓
         User browses folders → GET /api/videos/drive/folders
                  ↓
         User selects video → POST /api/videos/import
                  ↓
         Backend: Download from Drive → Save to uploads/videos/
                  ↓
         Store metadata in DB (videos table)
                  ↓
         Frontend: Show in "Imported Videos" list
```

### 3. Video Processing Flow

```
User → Frontend: Create Project → Select videos + audio
                  ↓
         POST /api/projects (Backend)
                  ↓
         Store project in DB → Return project ID
                  ↓
         User clicks "Process Video"
                  ↓
         POST /api/projects/:id/process (Backend)
                  ↓
         ┌─ Fetch video paths from DB
         ├─ FFmpeg: Merge videos (ffmpeg.js)
         ├─ FFmpeg: Add audio track
         ├─ CapCut: Apply template (if selected)
         └─ Output: final_video.mp4
                  ↓
         Update project with output_file_path
                  ↓
         Frontend: Show "Completed" + Preview + Download
```

### 4. AI Script Generation Flow

```
User → Frontend: Script Generator Page
         Select language (EN/VI), tone, template
                  ↓
         POST /api/scripts/generate (Backend)
                  ↓
         Build prompt (ai.js: buildPrompt())
                  ↓
         Call Claude API: messages.create()
                  ↓
         Receive generated script
                  ↓
         Store in DB (scripts table)
                  ↓
         Return script to Frontend
                  ↓
         User edits (optional) → Save script
                  ↓
         (Next: Use for voiceover generation)
```

### 5. Voiceover Generation Flow

```
User → Frontend: Voiceover Page
         Select script + voice (EN/VI) + speed
                  ↓
         POST /api/voiceover/generate (Backend)
                  ↓
         Fetch script content from DB
                  ↓
         Call ElevenLabs API: POST /text-to-speech/{voiceId}
                  ↓
         Receive audio buffer (MP3)
                  ↓
         Save to uploads/voiceovers/voiceover_{id}.mp3
                  ↓
         Get duration (ffprobe)
                  ↓
         Store in DB (voiceovers table)
                  ↓
         Return to Frontend → Show audio player + download
```

## Database Schema

### Entity Relationship Diagram (Simplified)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │  projects   │       │    videos   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │    ┌──│ id (PK)     │
│ username    │  └───│ user_id (FK)│    │  │ user_id (FK)│
│ email       │       │ name        │    │  │ drive_file_id│
│ password_hash│      │ template_id │    │  │ file_path   │
│ role        │       │ script_id   │    │  │ duration    │
│ language_pref│      │ status      │    │  │ resolution  │
└─────────────┘       └──────┬──────┘    │  └─────────────┘
                             │           │
                    ┌────────┘           │
                    │                    │
              ┌─────▼──────┐      ┌─────▼──────┐
              │project_videos│     │voiceovers  │
              ├─────────────┤      ├────────────┤
              │ id (PK)     │      │ id (PK)    │
              │ project_id  │      │ user_id(FK) │
              │ video_id    │      │ script_id  │
              │ order_index │      │ voice_id   │
              └─────────────┘      │ audio_path │
                                   └────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  templates  │       │   scripts   │       │audio_tracks │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ user_id (FK)│       │ user_id (FK)│       │ name        │
│ name        │       │ project_id  │       │ artist      │
│ config (JSON│       │ title       │       │ tiktok_id   │
│ category    │       │ content     │       │ file_path   │
└─────────────┘       │ language    │       └─────────────┘
                      │ tone        │
                      └─────────────┘
```

### Key Tables

**users**
- Authentication and profile data
- `language_preference` for i18n (en/vi)

**videos**
- Imported from Google Drive
- Metadata: duration, resolution, file_path

**templates**
- CapCut template configurations (JSON)
- Variables, elements, timing

**scripts**
- AI-generated or manual scripts
- Linked to projects
- Language and tone metadata

**voiceovers**
- ElevenLabs generated audio
- Linked to scripts
- Voice ID, duration, file path

**projects**
- Main workflow entity
- Links videos, template, script, voiceover
- Status tracking (draft → processing → completed)

**project_videos**
- Many-to-many relationship
- Ordering and trimming info

**drive_connections**
- OAuth tokens for Google Drive
- Per-user storage

## Security Architecture

### Authentication
- JWT (JSON Web Tokens) for session management
- Token stored in httpOnly cookie (recommended) or localStorage
- 7-day expiry (configurable)
- Refresh token rotation (future enhancement)

### Authorization (RBAC)
- **Admin**: Full access
- **Creator**: Create projects, generate scripts/voiceovers
- **Viewer**: Read-only access

Middleware:
```javascript
// Protect routes
router.use(authenticate); // All routes below require JWT

// Restrict by role
router.post('/templates', requireRole(['admin', 'creator']), ...);
```

### Input Validation
- express-validator for all inputs
- Zod schemas (frontend form validation)
- Parameterized SQL queries (prevent SQL injection)
- File type/size validation (multer)

### API Security
- Rate limiting (express-rate-limit)
- CORS whitelist (production: only frontend domain)
- Helmet.js (security headers)
- Environment variables (no secrets in code)

## External API Integration

### Google Drive API
```javascript
// Auth flow
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
const authUrl = oauth2Client.generateAuthUrl({ scope: ['drive.readonly'] });

// API calls
const drive = google.drive({ version: 'v3', auth: oauth2Client });
const folders = await drive.files.list({ q: "mimeType='application/vnd.google-apps.folder'" });
```

### Claude API (Anthropic)
```javascript
const anthropic = new Anthropic({ apiKey });
const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: prompt }]
});
```

### ElevenLabs API
```javascript
const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    { text, voice_settings: { stability: 0.5 } },
    { headers: { 'xi-api-key': apiKey }, responseType: 'arraybuffer' }
);
```

### TikTok API (Optional)
- Official API or web scraping
- Fetch trending sounds with metadata
- Download audio files for video processing

## Deployment Architecture

### Development
```
Docker Compose:
  1. postgres (port 5432)
  2. backend (port 4000)
  3. frontend (port 3000)
```

### Production
```
Internet
   ↓
Nginx (port 80/443, SSL termination)
   ↓
   ├─→ Frontend (React static files)
   └─→ Backend API (proxy /api requests)
         ↓
         ├─→ PostgreSQL (database)
         └─→ File System (uploads/)
```

**Docker Compose (Production)**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    
  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    
  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: ${API_URL}
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

## Scalability Considerations

### Current Architecture (MVP)
- Single server, monolithic backend
- Local file storage
- Synchronous video processing

### Future Scaling (Post-Launch)
- **Database**: Read replicas, connection pooling
- **File Storage**: Move to S3/Cloud Storage
- **Video Processing**: Queue system (Redis + Bull), worker nodes
- **API**: Rate limiting per user, caching with Redis
- **Frontend**: CDN for static assets
- **Monitoring**: Logging (Winston), metrics (Prometheus), tracing (OpenTelemetry)

## Performance Benchmarks (Estimates)

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Google Drive folder listing | < 2s | API call |
| Video import (100MB) | 30-60s | Network dependent |
| Video merge (3 clips, 1 min each) | 10-30s | CPU intensive |
| Script generation (Claude) | 3-10s | API latency |
| Voiceover generation (1 min script) | 5-15s | ElevenLabs API |
| Template application | 5-20s | FFmpeg processing |

## Monitoring & Logging

### Backend Logging (Winston)
```javascript
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

### Frontend Error Tracking
- Error boundaries in React
- Sentry or LogRocket (optional)

### Health Checks
- `GET /api/health` → `{ status: 'ok', db: 'connected' }`
- Docker healthcheck configured

## Backup Strategy

### Database
```bash
# Daily backup cron job
0 2 * * * pg_dump -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql
```

### File Storage
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### Cloud Storage (Future)
- Sync uploads to S3 periodically
- Versioned backups

---

This architecture provides a solid foundation for VideoAutoStudio, with room for scaling and enhancement as the user base grows.
