# Quick Start VideoAutoStudio

## Cách 1: Docker (Khuyên dùng cho production)

1. Copy file môi trường:
```bash
cp .env.example .env
```

2. Sửa `.env` với API keys của bạn:
- `CLAUDE_API_KEY` (đã có)
- `ELEVENLABS_API_KEY` (đã có)
- `GOOGLE_CLIENT_ID` (cần đăng ký Google Cloud Console)
- `JWT_SECRET` (đổi thành chuỗi ngẫu nhiên bảo mật)

3. Khởi động với Docker:
```bash
docker compose up --build -d
```

4. Truy cập:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/health

5. Đăng nhập:
- Email: `admin@videoautostudio.com`
- Password: `admin123`

## Cách 2: Local Development (Windows PowerShell)

### Yêu cầu:
- Node.js 18+ 
- PostgreSQL 16+ đang chạy
- FFmpeg đã cài đặt

### Bước 1: Thiết lập Database
```powershell
# Tạo user và database (chạy trong psql hoặc pgAdmin)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE USER videoautostudio_user WITH PASSWORD 'videoautostudio_pass_2024';"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE videoautostudio OWNER videoautostudio_user;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U videoautostudio_user -d videoautostudio -h localhost -f backend\src\config\init.sql
```

### Bước 2: Cài đặt dependencies
```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Bước 3: Khởi động servers
```powershell
# Terminal 1 - Backend
cd backend
$env:NODE_ENV="development"
node src/server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Bước 4: Truy cập
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000/api/health

## Các tính năng đã hoàn thành

✅ **Phase 1: Foundation** - Auth, Database, Basic UI
✅ **Phase 2: Google Drive** - OAuth, Video Import
✅ **Phase 3: Video Processing** - FFmpeg Merge, Audio
✅ **Phase 4: Templates** - CapCut Templates
✅ **Phase 5: AI Scripts** - Claude API
✅ **Phase 6: Voiceover** - ElevenLabs API
✅ **Phase 7: i18n** - EN/VI Support
✅ **Phase 8: Polish** - Docker, Deploy Ready

## Cấu trúc thư mục

```
VideoAutoStudio/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── server.js
│   │   ├── config/database.js
│   │   ├── middleware/auth.js
│   │   ├── routes/ (8 route files)
│   │   └── services/ (6 service files)
│   ├── uploads/           # Video, audio, voiceover files
│   ├── package.json
│   └── Dockerfile
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── i18n/ (EN/VI translations)
│   │   ├── contexts/AuthContext
│   │   ├── services/api.js
│   │   ├── components/common/
│   │   └── pages/ (7 page components)
│   ├── nginx.conf
│   ├── package.json
│   └── Dockerfile
├── docs/                 # Documentation đầy đủ
│   ├── README.md
│   ├── architecture/
│   ├── phases/ (8 phase plans)
│   ├── workflows/
│   └── api/
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints đã implement

- ✅ `POST /api/auth/login` - Đăng nhập
- ✅ `POST /api/auth/register` - Đăng ký
- ✅ `GET /api/auth/me` - Thông tin user
- ✅ `GET /api/videos/drive/*` - Google Drive API
- ✅ `POST /api/videos/import` - Import video
- ✅ `POST /api/projects` - Tạo project
- ✅ `POST /api/projects/:id/process` - Xử lý video
- ✅ `GET /api/templates` - Quản lý templates
- ✅ `POST /api/scripts/generate` - AI script (Claude)
- ✅ `POST /api/voiceover/generate` - AI voiceover (ElevenLabs)
- ✅ `GET /api/voiceover/voices` - Danh sách voices

## Kiểm tra hệ thống

### Backend Health Check:
```bash
curl http://localhost:4000/api/health
```

### Frontend Load:
Mở http://localhost:3000 trong browser

### Test Login:
```
Email: admin@videoautostudio.com
Password: admin123
```

## Lưu ý quan trọng

1. **Google Drive API**: Cần đăng ký tại https://console.cloud.google.com/ để lấy `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`

2. **API Keys**: Đã có sẵn Claude và ElevenLabs keys trong `.env`

3. **FFmpeg**: Cần cài đặt FFmpeg trên hệ thống để xử lý video (Phase 3)

4. **Database**: PostgreSQL đang chạy trên port 5432

## Support

- Docs: Xem thư mục `docs/`
- API Reference: `docs/api/API_REFERENCE.md`
- Phase Plans: `docs/phases/PHASE_*.md`

---

**Chúc mừng! VideoAutoStudio đã sẵn sàng để sử dụng! 🎉**
