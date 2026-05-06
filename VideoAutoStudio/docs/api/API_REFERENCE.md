# API Reference

Complete reference for VideoAutoStudio API endpoints.

## Base URL

- **Development**: `http://localhost:4000/api`
- **Production**: `https://yourdomain.com/api`

## Authentication

All endpoints except `POST /api/auth/login` and `POST /api/auth/register` require authentication.

### Header
```
Authorization: Bearer <your_jwt_token>
```

### Obtaining Token
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "user",
      "email": "user@example.com",
      "role": "creator"
    }
  }
}
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": { "id": "uuid", "username": "newuser", "role": "creator" }
  }
}
```

---

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register.

---

### GET /api/auth/google
Initiate Google OAuth2 flow.

**Response:** Redirects to Google consent screen.

---

### GET /api/auth/google/callback
Handle Google OAuth2 callback.

**Query Parameters:**
- `code` (string): Authorization code from Google
- `state` (string): CSRF state parameter

**Response:** Redirects to frontend with success/error.

---

### GET /api/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "user",
    "email": "user@example.com",
    "role": "creator",
    "language_preference": "en"
  }
}
```

---

### PUT /api/auth/password
Change password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Video Endpoints (Google Drive)

### GET /api/videos/drive/auth-url
Get Google OAuth URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

---

### GET /api/videos/drive/status
Check if user's Drive is connected.

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "email": "user@gmail.com"
  }
}
```

---

### GET /api/videos/drive/folders
List folders in Google Drive.

**Query Parameters:**
- `parentId` (optional): Parent folder ID (null for root)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "folder_id_1",
      "name": "Video Projects",
      "createdTime": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /api/videos/drive/files
List video files in a folder.

**Query Parameters:**
- `folderId` (string): Folder ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "file_id_1",
      "name": "video1.mp4",
      "size": 104857600,
      "duration": 60,
      "thumbnailUrl": "https://...",
      "mimeType": "video/mp4"
    }
  ]
}
```

---

### POST /api/videos/import
Import video from Google Drive.

**Request Body:**
```json
{
  "fileId": "drive_file_id",
  "folderId": "parent_folder_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "video_uuid",
    "name": "video1.mp4",
    "filePath": "uploads/videos/video1_uuid.mp4",
    "duration": 60,
    "resolution": "1920x1080"
  }
}
```

---

### GET /api/videos
List imported videos.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": [...],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

### DELETE /api/videos/:id
Delete imported video.

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

---

## Audio Endpoints (TikTok)

### GET /api/audio/trending
Get trending TikTok sounds.

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sound_id_1",
      "name": "Trending Sound",
      "artist": "Artist Name",
      "duration": 30,
      "previewUrl": "https://..."
    }
  ]
}
```

---

### GET /api/audio/search
Search audio tracks.

**Query Parameters:**
- `q` (string): Search query

**Response:** Same as trending.

---

### POST /api/audio/download
Download audio track.

**Request Body:**
```json
{
  "soundId": "tiktok_sound_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "audio_uuid",
    "filePath": "uploads/audio/sound.mp3",
    "duration": 30
  }
}
```

---

## Template Endpoints (CapCut)

### GET /api/templates
List templates.

**Query Parameters:**
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_uuid",
      "name": "Business Promo",
      "description": "Professional business template",
      "category": "business",
      "previewUrl": "https://...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/templates
Upload new template.

**Request:** Multipart form data
- `name` (string): Template name
- `description` (string): Description
- `category` (string): Category
- `templateFile` (file): JSON template file

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_uuid",
    "name": "Business Promo"
  }
}
```

---

### POST /api/templates/:id/apply
Apply template to project.

**Request Body:**
```json
{
  "projectId": "project_uuid",
  "variables": {
    "title": "Welcome",
    "subtitle": "To our business"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "project_uuid",
    "templateApplied": true
  }
}
```

---

## Script Endpoints (AI Generation)

### POST /api/scripts/generate
Generate AI script.

**Request Body:**
```json
{
  "language": "en",
  "tone": "professional",
  "templateId": "template_uuid",
  "variables": {
    "businessName": "ABC Corp",
    "service": "Web Development"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "script_uuid",
    "content": "[SCENE 1]\nVisual: ...\nAudio: ...",
    "language": "en",
    "tone": "professional"
  }
}
```

---

### GET /api/scripts
List user's scripts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "script_uuid",
      "title": "Generated Script",
      "language": "en",
      "tone": "professional",
      "generatedByAi": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### PUT /api/scripts/:id
Update script.

**Request Body:**
```json
{
  "content": "Updated script content..."
}
```

---

## Voiceover Endpoints (ElevenLabs)

### GET /api/voiceover/voices
List available voices.

**Query Parameters:**
- `language` (optional): Filter by language ("en" or "vi")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "voice_id": "elevenlabs_voice_id",
      "name": "Rachel",
      "language": "en",
      "preview_url": "https://..."
    }
  ]
}
```

---

### POST /api/voiceover/generate
Generate voiceover from script.

**Request Body:**
```json
{
  "scriptId": "script_uuid",
  "voiceId": "elevenlabs_voice_id",
  "speed": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "voiceover_uuid",
    "filePath": "uploads/voiceovers/voiceover_uuid.mp3",
    "duration": 60,
    "downloadUrl": "/api/voiceover/voiceover_uuid/download"
  }
}
```

---

### GET /api/voiceover
List user's voiceovers.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "voiceover_uuid",
      "voiceName": "Rachel",
      "language": "en",
      "duration": 60,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Project Endpoints

### POST /api/projects
Create new project.

**Request Body:**
```json
{
  "name": "My Video Project",
  "description": "Promotional video",
  "videoIds": ["vid1", "vid2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "project_uuid",
    "name": "My Video Project",
    "status": "draft"
  }
}
```

---

### GET /api/projects
List user's projects.

**Query Parameters:**
- `status` (optional): Filter by status ("draft", "processing", "completed")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "project_uuid",
      "name": "My Project",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/projects/:id/process
Process video (merge, add audio, apply template, add voiceover).

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job_uuid",
    "status": "processing"
  }
}
```

**Note:** This is an async operation. Poll `GET /api/projects/jobs/:jobId` for status.

---

### GET /api/projects/:id/preview
Stream preview video.

**Response:** Video file stream (video/mp4).

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient role)
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

### Example Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

---

## Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 attempts per 15 minutes per IP
- **AI generation**: 10 requests per hour per user
- **Voiceover**: 20 requests per hour per user

When rate limited, response includes:
```
HTTP 429 Too Many Requests
Retry-After: 300
```

---

## Pagination

List endpoints support pagination:

**Request:**
```
GET /api/videos?page=2&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 2,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

This API reference covers all major endpoints. For detailed request/response schemas, refer to the request validation middleware in each route file.
