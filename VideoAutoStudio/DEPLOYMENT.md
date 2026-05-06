# VideoAutoStudio Deployment Guide

## Production Deployment Checklist

### Pre-Deployment
- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure CORS origins
- [ ] Set up file storage strategy
- [ ] Configure rate limiting
- [ ] Set up monitoring & logging

---

## Environment Setup

### 1. Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- **RAM**: Minimum 4GB (8GB+ recommended)
- **CPU**: 2+ cores
- **Storage**: 20GB+ (depends on video storage needs)
- **Node.js**: v18.0.0+
- **PostgreSQL**: v14.0+
- **FFmpeg**: Latest stable
- **Nginx** (recommended for reverse proxy)

### 2. Install Dependencies

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install FFmpeg
sudo apt install ffmpeg -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 (process manager)
npm install -g pm2
```

#### Windows Server
```powershell
# Install Node.js from https://nodejs.org
# Install PostgreSQL from https://www.postgresql.org/download/windows/
# Install FFmpeg from https://ffmpeg.org/download.html
# Add FFmpeg to system PATH
# Install IIS or use PM2 for process management
```

---

## Database Setup

### 1. Create Production Database
```bash
sudo -u postgres psql

CREATE DATABASE videoautostudio_prod;
CREATE USER videoautostudio_prod_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE videoautostudio_prod TO videoautostudio_prod_user;

\q
```

### 2. Run Migrations
```bash
cd backend
NODE_ENV=production npx sequelize-cli db:migrate
```

---

## Backend Deployment

### 1. Configure Environment

Create `/path/to/VideoAutoStudio/backend/.env`:

```env
# Database (Production)
DATABASE_URL=postgresql://videoautostudio_prod_user:strong_password_here@localhost:5432/videoautostudio_prod
PG_HOST=localhost
PG_PORT=5432
PG_USER=videoautostudio_prod_user
PG_PASSWORD=strong_password_here
PG_DATABASE=videoautostudio_prod

# JWT (CHANGE THIS!)
JWT_SECRET=your_super_strong_random_jwt_secret_at_least_32_chars
JWT_EXPIRY=7d

# Server
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Google Drive API
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# AI Services
ANTHROPIC_API_KEY=your_production_anthropic_key
ELEVENLABS_API_KEY=your_production_elevenlabs_key

# Security
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Install & Build
```bash
cd backend
npm install --production
```

### 3. Start with PM2
```bash
cd backend
pm2 start src/server.js --name "videoautostudio-backend"

# Save PM2 config
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

### 4. Check Status
```bash
pm2 status
pm2 logs videoautostudio-backend
```

---

## Frontend Deployment

### 1. Configure API URL

Update `frontend/src/services/api.js`:

```javascript
const apiClient = axios.create({
    baseURL: 'https://yourdomain.com/api'  // Production URL
});
```

### 2. Build for Production
```bash
cd frontend
npm install
npm run build
```

Output will be in `frontend/dist/` folder.

### 3. Serve Static Files

#### Option A: Nginx (Recommended)
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # Frontend
    location / {
        root /path/to/VideoAutoStudio/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Option B: Vercel/Netlify (Serverless)
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/dist/**",
      "use": "@vercel/static"
    },
    {
      "src": "/api/**",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/frontend/dist/$1" }
  ]
}
```

---

## Docker Deployment (Optional)

### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

### Docker Compose
```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: videoautostudio_user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: videoautostudio
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://videoautostudio_user:password@db:5432/videoautostudio
      JWT_SECRET: your_secret
      NODE_ENV: production
    depends_on:
      - db
    volumes:
      - uploads_data:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  uploads_data:
```

Run:
```bash
docker-compose up -d --build
```

---

## SSL/TLS Setup (Let's Encrypt)

### Using Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit  # Real-time dashboard
pm2 logs  # View logs
pm2 flush  # Clear logs
```

### Log Files
- Backend: `backend/logs/`
- Nginx: `/var/log/nginx/`
- PM2: `~/.pm2/logs/`

### Health Check Endpoint
```bash
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "uptime": 123.45
}
```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Multiple backend instances
- Shared database
- Redis for session storage

### Vertical Scaling
- Increase server RAM/CPU
- Optimize FFmpeg settings
- Use SSD storage for uploads
- Enable gzip compression

### CDN for Videos
- Use CloudFlare, AWS CloudFront
- Offload video delivery
- Reduce server load

---

## Backup & Recovery

### Database Backup
```bash
# Daily backup script
pg_dump videoautostudio_prod > backup_$(date +%Y%m%d).sql

# Automated with cron
0 2 * * * pg_dump videoautostudio_prod | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### File Uploads Backup
```bash
# Backup uploads folder
rsync -avz /path/to/uploads/ /backups/uploads_$(date +%Y%m%d)/

# Or use cloud storage (AWS S3, Google Cloud Storage)
```

### Recovery
```bash
# Restore database
psql videoautostudio_prod < backup_20240101.sql

# Restore uploads
cp -r /backups/uploads_20240101/* /path/to/uploads/
```

---

## Security Checklist

- [ ] Use strong JWT secret (32+ random chars)
- [ ] Enable HTTPS only (redirect HTTP to HTTPS)
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Hide server version info (Nginx: `server_tokens off;`)
- [ ] Use security headers (Helmet.js already included)
- [ ] Regular security updates
- [ ] Monitor failed login attempts
- [ ] Encrypt sensitive data at rest

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs videoautostudio-backend

# Check port usage
sudo lsof -i :4000

# Check database connection
psql -h localhost -U videoautostudio_prod_user videoautostudio_prod
```

### Frontend shows blank page
- Check Nginx config
- Verify `baseURL` in API client
- Check browser console for errors
- Ensure SSL certificates are valid

### Videos not processing
- Verify FFmpeg is installed: `ffmpeg -version`
- Check uploads folder permissions: `chmod 755 uploads/`
- Review backend logs for FFmpeg errors

---

**For more help, check the API documentation or open an issue on GitHub! 🚀**
