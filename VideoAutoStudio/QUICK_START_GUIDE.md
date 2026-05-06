# VideoAutoStudio - Quick Start Guide

## Cách chạy Frontend và Backend

### 1. Khởi động Backend (Port 4000)
```bash
cd C:\Users\What do u think_\Downloads\CreativeFruit\VideoAutoStudio\backend
npm run dev
```
- Backend chạy tại: http://localhost:4000
- API Health check: http://localhost:4000/api/health

### 2. Khởi động Frontend (Port 3000)
```bash
cd C:\Users\What do u think_\Downloads\CreativeFruit\VideoAutoStudio\frontend
npm run dev
```
- Frontend chạy tại: http://localhost:3000
- Nếu port 3000 bị chiếm, Vite sẽ tự động chạy port 3001

### 3. Khởi động cả hai cùng lúc (PowerShell)
```powershell
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d C:\Users\What do u think_\Downloads\CreativeFruit\VideoAutoStudio\backend && npm run dev"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d C:\Users\What do u think_\Downloads\CreativeFruit\VideoAutoStudio\frontend && npm run dev"
```

### 4. Kill process an toàn (tránh tắt opencode)
```powershell
# Kiểm tra port đang dùng
netstat -ano | findstr ":3000 :3001 :4000"

# Kill theo PID cụ thể (thay PID bằng số)
taskkill /F /PID <PID>

# Ví dụ: kill process dùng port 4000
netstat -ano | findstr ":4000" | findstr LISTENING
taskkill /F /PID <PID_tìm_được>
```

---

## Tài khoản dữ liệu (Seed Data)

### Admin Account (Đã có sẵn trong database)
- **Username**: admin
- **Email**: admin@videoautostudio.com
- **Password**: admin123
- **Role**: admin

### Tạo tài khoản mới qua API
```bash
# Đăng ký tài khoản mới
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Đăng nhập
```bash
# Đăng nhập để lấy token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@videoautostudio.com",
    "password": "admin123"
  }'
```

---

## Thông tin Database

### PostgreSQL Connection
- **Host**: localhost
- **Port**: 5432
- **Database**: videoautostudio
- **User**: videoautostudio_user
- **Password**: videoautostudio_pass_2024

### Database URL
```
postgresql://videoautostudio_user:videoautostudio_pass_2024@localhost:5432/videoautostudio
```

---

## API Keys (Đã cấu hình trong .env)

### ElevenLabs API (Text-to-Speech)
- **Key**: [Cấu hình trong backend/.env - ELEVENLABS_API_KEY]
- **Dùng cho**: Tạo voiceover cho video

### Claude API (Anthropic AI)
- **Key**: [Cấu hình trong backend/.env - CLAUDE_API_KEY]
- **Dùng cho**: Tạo kịch bản video (scripts)

### Google Drive API (Cần cấu hình)
- **Client ID**: [Cấu hình trong backend/.env - GOOGLE_CLIENT_ID]
- **Client Secret**: [Cấu hình trong backend/.env - GOOGLE_CLIENT_SECRET]
- **Redirect URI**: http://localhost:4000/api/auth/google/callback

---

## Các lệnh hữu ích

### Kiểm tra tiến trình đang chạy
```powershell
tasklist | findstr "node.exe"
```

### Kiểm tra port đang mở
```powershell
netstat -ano | findstr LISTENING
```

### Xem log Backend
Backend dùng nodemon, tự động restart khi có thay đổi file. Xem log trực tiếp trong cửa sổ cmd đang chạy.

### Xem log Frontend
Vite hiển thị log trực tiếp trong cửa sổ cmd, bao gồm lỗi build và hot reload.

---

## Troubleshooting

### Lỗi EADDRINUSE (Port đã bị chiếm)
1. Tìm process đang chiếm port: `netstat -ano | findstr ":4000"`
2. Kill process: `taskkill /F /PID <PID>`
3. Chạy lại backend

### Lỗi Database connection failed
1. Kiểm tra PostgreSQL có đang chạy không
2. Kiểm tra thông tin trong file `.env`
3. Chạy script setup: `psql -U postgres -f setup-db.sql`

### Frontend không kết nối được Backend
1. Kiểm tra CORS setting trong backend (cho phép localhost:3000)
2. Kiểm tra biến `FRONTEND_URL` trong `.env`
3. Kiểm tra backend có chạy trên port 4000 không

---

## Cấu trúc thư mục

```
VideoAutoStudio/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/    # Database schema
│   │   ├── routes/    # API endpoints
│   │   └── server.js  # Entry point
│   └── package.json
├── frontend/          # React + Vite
│   ├── src/
│   └── package.json
├── .env              # Environment variables
└── setup-db.sql      # Database setup script
```

---

**Lưu ý**: Không dùng lệnh kill tất cả process node.exe, hãy kill theo PID cụ thể để tránh tắt opencode.
