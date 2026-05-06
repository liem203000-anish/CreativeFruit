# Phase 1: Foundation & Core Setup

**Duration**: 1-2 weeks  
**Priority**: Critical  
**Status**: Not Started

## Overview

Establish the foundational infrastructure for VideoAutoStudio, including project structure, database schema, authentication system, and basic frontend layout. This phase sets up the skeleton that all other phases will build upon.

## Goals

1. Initialize project structure (backend + frontend + Docker)
2. Set up PostgreSQL database with core tables
3. Implement JWT authentication system
4. Create basic frontend layout (sidebar, topbar, routing)
5. Set up environment configuration
6. Implement basic i18n infrastructure

## Deliverables

### 1.1 Project Initialization

**Backend Setup**
- [ ] Initialize Node.js project with `package.json`
- [ ] Install dependencies: express, pg, dotenv, jsonwebtoken, bcryptjs, cors, cookie-parser
- [ ] Create `src/server.js` entry point
- [ ] Configure Express middleware (CORS, JSON parsing, cookie parsing)
- [ ] Set up error handling middleware
- [ ] Create health check endpoint (`/api/health`)

**Frontend Setup**
- [ ] Initialize Vite + React project
- [ ] Install dependencies: react-router-dom, react-query, lucide-react, react-hook-form, zod, react-i18next
- [ ] Configure Vite (`vite.config.js`) with proxy to backend
- [ ] Set up folder structure (contexts, services, components, pages)

**Docker Setup**
- [ ] Create `docker-compose.yml` with 3 services: postgres, backend, frontend
- [ ] Create `backend/Dockerfile`
- [ ] Create `frontend/Dockerfile`
- [ ] Configure volume mounts for development

### 1.2 Database Schema

**Core Tables**

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'creator', -- admin, creator, viewer
    language_preference VARCHAR(5) DEFAULT 'en', -- en, vi
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Google Drive connections
CREATE TABLE drive_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Imported videos (from Google Drive)
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    drive_file_id VARCHAR(100),
    drive_folder_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    duration INTEGER, -- in seconds
    resolution VARCHAR(20), -- e.g., "1920x1080"
    file_size BIGINT,
    thumbnail_url VARCHAR(500),
    imported_at TIMESTAMP DEFAULT NOW()
);

-- Audio tracks (TikTok trending)
CREATE TABLE audio_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    tiktok_sound_id VARCHAR(100),
    duration INTEGER,
    file_path VARCHAR(500),
    trending_rank INTEGER,
    imported_at TIMESTAMP DEFAULT NOW()
);

-- CapCut templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capcut_template_id VARCHAR(100),
    template_config JSONB, -- CapCut template configuration
    preview_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Projects (main entity)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id UUID REFERENCES templates(id),
    script TEXT,
    voiceover_id UUID,
    status VARCHAR(20) DEFAULT 'draft', -- draft, processing, completed
    output_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project videos (many-to-many: projects <-> videos)
CREATE TABLE project_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    trim_start INTEGER DEFAULT 0, -- trim start in seconds
    trim_end INTEGER, -- trim end in seconds
    created_at TIMESTAMP DEFAULT NOW()
);

-- Scripts
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    title VARCHAR(255),
    content TEXT NOT NULL,
    language VARCHAR(5) DEFAULT 'en',
    tone VARCHAR(50), -- professional, casual, funny, etc.
    generated_by_ai BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Voiceovers (ElevenLabs generated)
CREATE TABLE voiceovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    script_id UUID REFERENCES scripts(id),
    voice_id VARCHAR(100), -- ElevenLabs voice ID
    voice_name VARCHAR(100),
    language VARCHAR(5) DEFAULT 'en',
    audio_file_path VARCHAR(500),
    duration INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_project_videos_project_id ON project_videos(project_id);
CREATE INDEX idx_scripts_user_id ON scripts(user_id);
CREATE INDEX idx_voiceovers_user_id ON voiceovers(user_id);
```

### 1.3 Authentication System

**Backend**
- [ ] Create `middleware/auth.js` with:
  - `authenticate` middleware (JWT verification)
  - `requireRole` middleware (role-based access control)
- [ ] Create `routes/auth.js` with:
  - `POST /api/auth/register` — User registration
  - `POST /api/auth/login` — User login
  - `POST /api/auth/logout` — User logout
  - `GET /api/auth/me` — Get current user
  - `PUT /api/auth/password` — Change password
- [ ] Password hashing with bcryptjs (salt rounds: 10)
- [ ] JWT token generation with 7-day expiry
- [ ] Store JWT in httpOnly cookie (recommended) or localStorage

**Frontend**
- [ ] Create `contexts/AuthContext.jsx` with:
  - `login()`, `logout()`, `register()` methods
  - `user` state, `isAuthenticated` boolean
  - `language` state for i18n
- [ ] Create `services/api.js` with:
  - Axios instance with base URL
  - Request interceptor (attach JWT)
  - Response interceptor (handle 401)
- [ ] Create `LoginPage.jsx` with:
  - Login form (username/email + password)
  - Registration form toggle
  - Error handling with react-hot-toast

### 1.4 Basic Frontend Layout

**Components**
- [ ] Create `components/common/Sidebar.jsx` with:
  - Navigation links (Dashboard, Drive Videos, Templates, Scripts, Voiceover, Projects, Settings)
  - Role-based visibility
  - Active link highlighting
  - Language switcher button
- [ ] Create `components/common/Topbar.jsx` with:
  - Page title
  - User avatar + dropdown (profile, logout)
  - Language indicator
- [ ] Create `App.jsx` with:
  - React Router setup
  - Auth-based route protection
  - Layout wrapper (Sidebar + Topbar + Content)

**Pages (Skeleton)**
- [ ] `DashboardPage.jsx` — Welcome + stats placeholder
- [ ] `DriveVideosPage.jsx` — Placeholder
- [ ] `TemplatesPage.jsx` — Placeholder
- [ ] `ScriptGeneratorPage.jsx` — Placeholder
- [ ] `VoiceoverPage.jsx` — Placeholder
- [ ] `ProjectsPage.jsx` — Placeholder
- [ ] `SettingsPage.jsx` — Language preference, profile

### 1.5 i18n Infrastructure

**Setup**
- [ ] Install `react-i18next` and `i18next`
- [ ] Create `i18n/config.js` with:
  - Language detection (localStorage)
  - Fallback language (English)
  - Namespace configuration
- [ ] Create `i18n/en.json` with:
  - All UI text keys (sidebar, topbar, pages, buttons, labels)
- [ ] Create `i18n/vi.json` with:
  - Vietnamese translations for all keys
- [ ] Wrap App with `I18nextProvider`
- [ ] Add language switcher to Topbar/Sidebar

**Translation Keys Structure**
```json
{
  "sidebar": {
    "dashboard": "Dashboard",
    "driveVideos": "Drive Videos",
    "templates": "Templates",
    "scripts": "Scripts",
    "voiceover": "Voiceover",
    "projects": "Projects",
    "settings": "Settings"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "username": "Username",
    "email": "Email",
    "password": "Password"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading..."
  }
}
```

### 1.6 Environment Configuration

**Files**
- [ ] Create `.env.example` with all required variables
- [ ] Create `.gitignore` (node_modules, .env, uploads/, logs/)
- [ ] Document all environment variables in README

**Environment Variables**
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/videoautostudio
PG_HOST=localhost
PG_PORT=5432
PG_USER=videoautostudio_user
PG_PASSWORD=videoautostudio_pass
PG_DATABASE=videoautostudio

# JWT
JWT_SECRET=videoautostudio_jwt_secret_change_in_production
JWT_EXPIRY=7d

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google Drive (to be used in Phase 2)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# ElevenLabs (to be used in Phase 6)
ELEVENLABS_API_KEY=

# AI (to be used in Phase 5)
CLAUDE_API_KEY=

# TikTok (to be used in Phase 3)
TIKTOK_API_KEY=
```

## Acceptance Criteria

- [ ] User can register a new account
- [ ] User can login and receive JWT token
- [ ] Protected routes redirect to login if not authenticated
- [ ] User can switch between EN/VI languages (UI updates immediately)
- [ ] Database tables created successfully
- [ ] Docker Compose starts all 3 services without errors
- [ ] Frontend displays sidebar + topbar with correct navigation
- [ ] Health check endpoint returns `{ "status": "ok" }`

## Technical Debt / Notes

- JWT stored in httpOnly cookie is more secure than localStorage (document this)
- Consider adding rate limiting on auth endpoints (express-rate-limit)
- Database uses UUID primary keys (better for distributed systems)
- All timestamps use `TIMESTAMP` (not `TIMESTAMPTZ`) for simplicity; consider timezone needs later
- i18n uses JSON files (consider dynamic loading for larger apps)

## Next Phase

Proceed to [Phase 2: Google Drive Integration](PHASE_2_GOOGLE_DRIVE.md) to enable video importing from Google Drive.
