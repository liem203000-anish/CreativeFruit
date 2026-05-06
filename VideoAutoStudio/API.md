# VideoAutoStudio API Documentation

Base URL: `http://localhost:4000/api`

## Authentication

All API endpoints (except auth) require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

Or as query parameter:
```
/api/endpoint?token=<your_jwt_token>
```

## Endpoints

### Auth APIs

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string (min 8 chars)"
}

Response: { "success": true, "data": { "token": "...", "user": {...} }
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response: { "success": true, "data": { "token": "...", "user": {...} }
```

#### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer <token>

Response: { "success": true, "data": { "id": 1, "username": "...", ... } }
```

#### Change Password
```
POST /auth/change-password
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "string",
  "newPassword": "string (min 8 chars)"
}

Response: { "success": true, "message": "Password changed successfully" }
```

---

### Project APIs

#### List Projects
```
GET /projects?status=draft|processing|completed
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Project Name",
      "description": "Optional description",
      "status": "draft|processing|completed",
      "script_id": 1,
      "voiceover_id": 2,
      "output_file_path": "/path/to/output.mp4",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "videos": [
        {
          "id": 1,
          "name": "video.mp4",
          "file_path": "/path/to/video.mp4",
          "duration": 120
        }
      ]
    }
  ]
}
```

#### Create Project
```
POST /projects
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Video Project",
  "description": "Optional description",
  "videoIds": [1, 2, 3]
}

Response: { "success": true, "data": { "id": 1, "name": "...", ... } }
```

#### Get Project Details
```
GET /projects/:id
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "id": 1,
    "name": "Project Name",
    "videos": [
      {
        "video_id": 1,
        "name": "video1.mp4",
        "file_path": "/path/to/video1.mp4",
        "duration": 120,
        "order_index": 0
      }
    ],
    ...
  }
}
```

#### Update Project
```
PUT /projects/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "script_id": 1,
  "voiceover_id": 2
}

Response: { "success": true, "data": {...} }
```

#### Delete Project
```
DELETE /projects/:id
Headers: Authorization: Bearer <token>

Response: { "success": true, "message": "Project deleted successfully" }
```

#### Process Video
```
POST /projects/:id/process
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "quality": "low|medium|high|ultra",
  "format": "mp4|avi|mov",
  "includeAudio": true
}

Response: {
  "success": true,
  "data": {
    "status": "completed",
    "outputPath": "/path/to/output.mp4",
    "quality": "high",
    "format": "mp4"
  }
}
```

#### Reorder Videos in Project
```
PUT /projects/:id/videos/reorder
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "videoOrders": [
    { "videoId": 2, "orderIndex": 0 },
    { "videoId": 1, "orderIndex": 1 }
  ]
}

Response: { "success": true, "message": "Video order updated" }
```

#### Preview Processed Video
```
GET /projects/:id/preview?token=<jwt_token>
Headers: Range: bytes=0-1023 (optional for partial content)

Response: Video stream (video/mp4)
```

---

### Video APIs

#### List Imported Videos
```
GET /videos
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "drive_file_id": "abc123",
      "name": "video.mp4",
      "file_path": "/path/to/video.mp4",
      "duration": 120,
      "file_size": 1048576,
      "imported_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Import Video from Google Drive
```
POST /videos/import
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "google_drive_file_id",
  "folderId": "google_drive_folder_id"
}

Response: {
  "success": true,
  "data": {
    "id": 1,
    "name": "video.mp4",
    "file_path": "/path/to/video.mp4",
    "duration": 120,
    "file_size": 1048576
  }
}
```

#### Get Video Thumbnail
```
GET /videos/:id/thumbnail?time=1&token=<jwt_token>

Response: Image file (image/jpeg)
```

#### Delete Video
```
DELETE /videos/:id
Headers: Authorization: Bearer <token>

Response: { "success": true, "message": "Video deleted successfully" }
```

#### Google Drive: Get Auth URL
```
GET /videos/drive/auth-url
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

#### Google Drive: List Folders
```
GET /videos/drive/folders?parentId=optional
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "id": "folder_id",
      "name": "Folder Name",
      "mimeType": "application/vnd.google-apps.folder"
    }
  ]
}
```

#### Google Drive: List Files
```
GET /videos/drive/files?folderId=xyz
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "id": "file_id",
      "name": "video.mp4",
      "mimeType": "video/mp4",
      "size": "1048576"
    }
  ]
}
```

#### Save Drive Tokens
```
POST /videos/drive/save-tokens
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "access_token": "ya29...",
  "refresh_token": "1//...",
  "expires_in": 3600
}

Response: { "success": true, "message": "Drive connection saved" }
```

#### Disconnect Drive
```
DELETE /videos/drive/disconnect
Headers: Authorization: Bearer <token>

Response: { "success": true, "message": "Drive disconnected" }
```

---

### Script APIs

#### List Scripts
```
GET /scripts
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "My Script",
      "content": "Script content...",
      "language": "en|vi",
      "tone": "professional|casual|funny|inspirational|educational",
      "template_id": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Generate AI Script
```
POST /scripts/generate
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "templateId": 1,
  "variables": {
    "title": "My Video Title"
  },
  "language": "en|vi",
  "tone": "professional"
}

Response: {
  "success": true,
  "data": {
    "id": 1,
    "title": "Generated Script",
    "content": "Generated content...",
    "language": "en",
    "tone": "professional"
  }
}
```

#### Update Script
```
PUT /scripts/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated script content..."
}

Response: { "success": true, "data": {...} }
```

#### Delete Script
```
DELETE /scripts/:id
Headers: Authorization: Bearer <token>

Response: { "success": true, "message": "Script deleted" }
```

---

### Voiceover APIs

#### List Voiceovers
```
GET /voiceover
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "script_id": 1,
      "voice_name": "Rachel",
      "language": "en|vi",
      "speed": 1.0,
      "audio_file_path": "/path/to/audio.mp3",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Generate AI Voiceover
```
POST /voiceover/generate
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "scriptId": 1,
  "voiceId": "rachel",
  "speed": 1.0
}

Response: {
  "success": true,
  "data": {
    "id": 1,
    "voice_name": "Rachel",
    "audio_file_path": "/path/to/audio.mp3"
  }
}
```

#### Download Voiceover
```
GET /voiceover/:id/download?token=<jwt_token>

Response: Audio file (audio/mpeg)
```

#### List Available Voices
```
GET /voiceover/voices?language=en
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "voice_id": "rachel",
      "name": "Rachel",
      "language": "en",
      "gender": "female"
    }
  ]
}
```

#### Delete Voiceover
```
DELETE /voiceover/:id
Headers: Authorization: Bearer <token>

Response: { "success": true, "message": "Voiceover deleted" }
```

---

### Template APIs

#### List Templates
```
GET /templates?category=intro|outro|transition|lower_third|title|music_promo
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Intro Template",
      "description": "Template description",
      "category": "intro",
      "template_config": {...},
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Template
```
POST /templates
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Template",
  "description": "Template description",
  "category": "intro",
  "template_config": {
    "duration": 10,
    "transitions": [...]
  }
}

Response: { "success": true, "data": {...} }
```

#### Update Template
```
PUT /templates/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  ...
}

Response: { "success": true, "data": {...} }
```

#### Delete Template
```
DELETE /templates/:id
Headers: Authorization: Bearer <token>

Response: { "success": true, "message": "Template deleted" }
```

---

### Stats API

#### Get Dashboard Stats
```
GET /stats
Headers: Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "totalProjects": 10,
    "completedProjects": 5,
    "totalScripts": 8,
    "totalVoiceovers": 6,
    "totalVideos": 15
  }
}
```

---

## Error Responses

All endpoints return errors in format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Login: 10 attempts per 15 minutes per IP
- Register: 10 attempts per 15 minutes per IP

Rate limit headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

**For more details, see the source code in `/backend/src/routes/`**
