# VideoAutoStudio 🎬

> A modern, AI-powered video editing and automation platform built with React, Node.js, and FFmpeg.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

## ✨ Features

### Core Features
- **Project Management** - Create, organize, and manage video projects
- **Google Drive Integration** - Import videos directly from Google Drive
- **AI Script Generation** - Generate professional scripts with customizable tone and language
- **AI Voiceover** - Ultra-realistic text-to-speech with multiple voices
- **Video Templates** - Pre-built templates for intros, outros, and transitions
- **Timeline Editor** - Drag-and-drop video timeline with reordering
- **Video Processing** - Merge videos, add audio, apply quality settings

### Advanced Features
- **Smart Thumbnails** - Auto-generated video thumbnails
- **Material Design 3** - Modern, beautiful UI with glassmorphism effects
- **Multi-language Support** - English and Vietnamese (i18n ready)
- **Responsive Design** - Works on desktop and mobile
- **Real-time Preview** - Preview processed videos instantly

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling with custom Material Design 3 theme
- **React Hot Toast** - Notifications
- **Material Symbols** - Icon system
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **FFmpeg** - Video processing
- **Google APIs** - Drive integration
- **Anthropic Claude** - AI script generation
- **ElevenLabs** - AI voiceover generation

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- FFmpeg installed system-wide
- Google Cloud project with Drive API enabled
- Anthropic API key
- ElevenLabs API key

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd VideoAutoStudio
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend root:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/videoautostudio
PG_HOST=localhost
PG_PORT=5432
PG_USER=videoautostudio_user
PG_PASSWORD=your_password
PG_DATABASE=videoautostudio

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRY=7d

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google Drive API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# AI Services
ANTHROPIC_API_KEY=your_anthropic_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### 3. Database Setup

```bash
# Create database
createdb videoautostudio

# Run seed data (optional)
cd backend
node seed-data.js
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

### 5. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access at: http://localhost:3000

## 📁 Project Structure

```
VideoAutoStudio/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── middleware/      # Auth, CORS, etc.
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── server.js        # Entry point
│   ├── uploads/            # User uploads
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   └── common/      # Sidebar, Topbar, etc.
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── contexts/        # React contexts
│   │   ├── i18n/            # Translations
│   │   ├── styles/          # Global CSS
│   │   └── App.jsx           # Main app
│   ├── public/
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/process` - Process video
- `GET /api/projects/:id/preview` - Preview video

### Videos
- `GET /api/videos` - List imported videos
- `POST /api/videos/import` - Import from Drive
- `DELETE /api/videos/:id` - Delete video
- `GET /api/videos/:id/thumbnail` - Get video thumbnail

### Scripts
- `GET /api/scripts` - List scripts
- `POST /api/scripts/generate` - Generate AI script
- `PUT /api/scripts/:id` - Update script
- `DELETE /api/scripts/:id` - Delete script

### Voiceovers
- `GET /api/voiceover` - List voiceovers
- `POST /api/voiceover/generate` - Generate AI voiceover
- `GET /api/voiceover/voices` - List available voices
- `DELETE /api/voiceover/:id` - Delete voiceover

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Google Drive
- `GET /api/videos/drive/auth-url` - Get OAuth URL
- `GET /api/videos/drive/folders` - List folders
- `GET /api/videos/drive/files` - List files in folder
- `POST /api/videos/drive/save-tokens` - Save auth tokens
- `DELETE /api/videos/drive/disconnect` - Disconnect Drive

## 🎨 UI/UX Features

### Design System
- **Material Design 3** color system
- **Glassmorphism** effects with backdrop blur
- **Custom animations** (fadeIn, slideUp, float, shimmer)
- **Responsive** - Mobile bottom navigation
- **Accessible** - Keyboard navigation, ARIA labels

### Pages
1. **Login** - Beautiful auth page with mesh gradient background
2. **Dashboard** - Stats, quick actions, recent projects, system health
3. **Projects** - Project cards with video thumbnails, timeline editor
4. **Templates** - Video template management
5. **Drive Videos** - Google Drive integration, import videos
6. **Scripts** - AI script generation and management
7. **Voiceover** - AI voice generation with multi-voice support
8. **Settings** - Profile, language, password management

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Token-based API access
- CORS protection
- Rate limiting
- Helmet.js security headers
- Input validation with Zod

## 🚧 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Backend (e.g., Heroku, DigitalOcean)
```bash
npm install --production
NODE_ENV=production npm start
```

### Frontend
```bash
npm run build
# Serve `dist/` folder
```

### Docker (Optional)
```bash
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Changelog

### v1.0.0 (Current)
- Initial release
- Project management
- AI script & voiceover generation
- Google Drive integration
- Video processing with FFmpeg
- Material Design 3 UI
- Multi-language support

## 📞 Roadmap

### v1.1.0 (Upcoming)
- [ ] Advanced timeline editing (trim, cut, effects)
- [ ] Subtitle/caption generator
- [ ] Social media export presets
- [ ] Real-time collaboration
- [ ] Mobile app companion
- [ ] Video analytics dashboard
- [ ] Asset library management
- [ ] Keyboard shortcuts
- [ ] Undo/redo system
- [ ] Comments & annotations
- [ ] Version history
- [ ] Batch processing
- [ ] Video enhancement (stabilization, color correction)

## 💬 Support

- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the VideoAutoStudio Team**
