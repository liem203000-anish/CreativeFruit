# VideoAutoStudio - Deploy Guide

## Chuẩn bị

1. Tạo repo trên GitHub
2. Push code lên:
```bash
cd CreativeFruit
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/videoautostudio.git
git push -u origin main
```

## Deploy Backend lên Railway

1. Đăng ký tài khoản tại https://railway.app (dùng GitHub login)
2. Click "New Project" → "Deploy from GitHub repo"
3. Chọn repo, chọn **backend folder** làm root
4. Add PostgreSQL database: "Add Service" → "Database" → "PostgreSQL"
5. Railway tự động inject `DATABASE_URL` vào env
6. Thêm các env variables trong Railway settings:
   - `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE` (từ Railway PostgreSQL)
   - `JWT_SECRET`: random string
   - `JWT_EXPIRY`: 7d
   - `GOOGLE_CLIENT_ID`: từ Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: từ Google Cloud Console
   - `GOOGLE_REDIRECT_URI`: https://your-backend.up.railway.app/api/auth/google/callback
   - `FRONTEND_URL`: https://your-frontend.vercel.app
   - `ELEVENLABS_API_KEY`: từ ElevenLabs
   - `CLAUDE_API_KEY`: từ Anthropic
   - `PORT`: 4000
   - `NODE_ENV`: production

7. Sau khi deploy xong, copy URL backend (ví dụ: https://videoautostudio-backend.up.railway.app)

8. Chạy SQL init: Vào Railway PostgreSQL → "Connect" → chạy file `backend/src/config/init.sql`

## Deploy Frontend lên Vercel

1. Đăng ký tại https://vercel.com (dùng GitHub login)
2. "Add New" → "Project" → Chọn repo
3. Cấu hình:
   - **Root Directory**: `VideoAutoStudio/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Thêm Environment Variable:
   - `VITE_API_URL`: https://your-backend.up.railway.app

5. Deploy và copy URL frontend (ví dụ: https://videoautostudio.vercel.app)

## Cập nhật Google OAuth

Vào Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs:
- Thêm Authorized Redirect URI: `https://your-backend.up.railway.app/api/auth/google/callback`

## Hoàn tất

- Frontend: https://your-frontend.vercel.app
- Backend API: https://your-backend.up.railway.app
- Sếp ở Mỹ truy cập frontend URL là được!

## Lưu ý

- Free tier Railway: $5 credit/tháng (đủ chạy nhỏ)
- Free tier Vercel: Không giới hạn dự án, CDN global (tốt cho user ở Mỹ)
- Nếu cần custom domain, thêm trong settings của Vercel/Railway
