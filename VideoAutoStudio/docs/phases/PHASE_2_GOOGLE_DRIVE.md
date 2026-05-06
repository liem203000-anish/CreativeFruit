# Phase 2: Google Drive Integration

**Duration**: 1-2 weeks  
**Priority**: High  
**Status**: Not Started  
**Depends On**: Phase 1 (Foundation)

## Overview

Integrate Google Drive API to allow users to browse folders, select video clips from multiple directories, and import them into the application for video processing. This phase implements OAuth2 authentication with Google and file metadata management.

## Goals

1. Implement Google OAuth2 flow for Drive access
2. Create backend services for Google Drive API operations
3. Build UI for browsing Drive folders and files
4. Import video metadata and download files locally
5. Store video references in database

## Deliverables

### 2.1 Google OAuth2 Setup

**Google Cloud Platform Configuration**
- [ ] Create project in Google Cloud Console
- [ ] Enable Google Drive API
- [ ] Configure OAuth2 consent screen (external or internal)
- [ ] Create OAuth2 credentials (Client ID + Client Secret)
- [ ] Add authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
- [ ] Add scopes:
  - `https://www.googleapis.com/auth/drive.readonly` (read-only access)
  - `https://www.googleapis.com/auth/userinfo.email` (user email)

**Backend OAuth Routes**
- [ ] `GET /api/auth/google` — Initiate OAuth flow
  - Redirect to Google consent screen
  - State parameter for CSRF protection
- [ ] `GET /api/auth/google/callback` — Handle OAuth callback
  - Exchange code for access + refresh tokens
  - Store tokens in `drive_connections` table
  - Redirect to frontend with success/error

**Token Management**
- [ ] Create `services/googleDrive.js` with:
  - `getAuthUrl()` — Generate OAuth URL
  - `exchangeCode(code)` — Exchange code for tokens
  - `refreshAccessToken(refreshToken)` — Refresh expired token
  - `isTokenExpired(expiresAt)` — Check token expiry
  - `getAuthenticatedClient(userId)` — Get authenticated Drive client

### 2.2 Google Drive Service

**File**: `backend/src/services/googleDrive.js`

**Methods to Implement**

```javascript
const { google } = require('googleapis');

class GoogleDriveService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    // Get authenticated Drive client for user
    async getDriveClient(userId) {
        // Fetch tokens from DB
        // Set credentials on oauth2Client
        // Return google.drive({ version: 'v3', auth: oauth2Client })
    }

    // List folders in Drive
    async listFolders(userId, parentId = null) {
        // Query: mimeType = 'application/vnd.google-apps.folder'
        // Return: [{ id, name, createdTime }]
    }

    // List video files in folder
    async listVideos(userId, folderId) {
        // Query: mimeType contains 'video/'
        // Return: [{ id, name, size, duration, thumbnailLink }]
    }

    // Get file metadata
    async getFileMetadata(userId, fileId) {
        // Return: { name, size, mimeType, duration, thumbnailLink, etc. }
    }

    // Download file to local storage
    async downloadFile(userId, fileId, destinationPath) {
        // Stream file from Drive to local path
        // Return: local file path
    }

    // Search files by name
    async searchFiles(userId, query) {
        // Search Drive for video files matching query
    }
}
```

### 2.3 Backend Routes

**File**: `backend/src/routes/videos.js`

**Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos/drive/auth-url` | Get Google OAuth URL |
| GET | `/api/videos/drive/status` | Check if user connected Drive |
| DELETE | `/api/videos/drive/disconnect` | Disconnect Drive account |
| GET | `/api/videos/drive/folders` | List Drive folders |
| GET | `/api/videos/drive/files` | List videos in folder |
| GET | `/api/videos/drive/files/:fileId` | Get file metadata |
| POST | `/api/videos/import` | Import video from Drive |
| GET | `/api/videos` | List imported videos |
| GET | `/api/videos/:id` | Get video details |
| DELETE | `/api/videos/:id` | Delete imported video |

**Example: List Folders Endpoint**

```javascript
router.get('/drive/folders', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { parentId } = req.query;
        
        const driveService = new GoogleDriveService();
        const folders = await driveService.listFolders(userId, parentId);
        
        res.json({ success: true, data: folders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

### 2.4 Database Operations

**New/Modified Tables**

```sql
-- Already created in Phase 1: drive_connections, videos

-- Add some useful columns if not present
ALTER TABLE videos ADD COLUMN IF NOT EXISTS drive_web_view_link VARCHAR(500);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
```

**Queries**

```javascript
// Store Drive connection
const storeConnection = async (userId, accessToken, refreshToken, expiresAt) => {
    await db.query(`
        INSERT INTO drive_connections (user_id, access_token, refresh_token, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) 
        DO UPDATE SET access_token = $2, refresh_token = $3, expires_at = $4
    `, [userId, accessToken, refreshToken, expiresAt]);
};

// Import video record
const importVideo = async (userId, driveFile, localPath) => {
    await db.query(`
        INSERT INTO videos (user_id, drive_file_id, drive_folder_id, name, file_path, 
                          duration, resolution, file_size, thumbnail_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [userId, driveFile.id, driveFile.folderId, driveFile.name, localPath,
        driveFile.duration, driveFile.resolution, driveFile.size, driveFile.thumbnail]);
};
```

### 2.5 Frontend: Drive Videos Page

**File**: `frontend/src/pages/DriveVideosPage.jsx`

**Components to Create**

1. **DriveConnectionStatus**
   - Show if Drive is connected
   - "Connect Google Drive" button (if not connected)
   - "Disconnect" button (if connected)

2. **FolderBrowser**
   - Tree view or breadcrumb navigation
   - List folders with folder icon
   - Click to enter folder
   - "Back" button to go up

3. **VideoFileList**
   - Grid or table view of video files
   - Show: thumbnail, name, duration, size
   - Checkbox selection for multiple videos
   - "Import Selected" button

4. **ImportedVideosList**
   - Show all imported videos from database
   - Thumbnail preview
   - Delete button
   - Video details modal

**State Management**

```javascript
const [isConnected, setIsConnected] = useState(false);
const [folders, setFolders] = useState([]);
const [currentFolder, setCurrentFolder] = useState(null);
const [videos, setVideos] = useState([]);
const [selectedVideos, setSelectedVideos] = useState([]);
const [importedVideos, setImportedVideos] = useState([]);
```

**API Integration**

```javascript
// Add to api.js
const driveApi = {
    getAuthUrl: () => api.get('/videos/drive/auth-url'),
    checkStatus: () => api.get('/videos/drive/status'),
    disconnect: () => api.delete('/videos/drive/disconnect'),
    listFolders: (parentId) => api.get('/videos/drive/folders', { params: { parentId } }),
    listVideos: (folderId) => api.get('/videos/drive/files', { params: { folderId } }),
    importVideo: (fileId, folderId) => api.post('/videos/import', { fileId, folderId }),
    getImportedVideos: () => api.get('/videos'),
    deleteVideo: (id) => api.delete(`/videos/${id}`)
};
```

### 2.6 Video File Handling

**Backend: File Storage**

- [ ] Create `backend/uploads/videos/` directory
- [ ] Use `fs.createWriteStream` for efficient file downloads
- [ ] Generate unique filenames (UUID + original extension)
- [ ] Store local path in database
- [ ] Validate file type (only video files)
- [ ] Limit file size (configurable, e.g., 500MB)

**Video Metadata Extraction**

- [ ] Use `ffprobe` (part of FFmpeg) to extract:
  - Duration
  - Resolution (width x height)
  - Codec information
  - Frame rate
- [ ] Store metadata in database for later use

```javascript
const extractVideoMetadata = async (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) reject(err);
            resolve({
                duration: metadata.format.duration,
                resolution: `${metadata.streams[0].width}x${metadata.streams[0].height}`,
                codec: metadata.streams[0].codec_name
            });
        });
    });
};
```

### 2.7 Error Handling & Edge Cases

**Common Issues**
- [ ] Token expired → Auto-refresh using refresh token
- [ ] Rate limiting (Google Drive API: 10,000 requests/day) → Queue requests
- [ ] Large files → Stream with progress indicator
- [ ] Network interruption → Resume download or retry
- [ ] Invalid file types → Show user-friendly error
- [ ] Quota exceeded → Notify user, suggest waiting

**Error Messages (i18n)**

```json
{
  "drive": {
    "notConnected": "Please connect your Google Drive account",
    "connectionFailed": "Failed to connect Google Drive. Please try again.",
    "tokenExpired": "Google Drive session expired. Reconnecting...",
    "importSuccess": "Video imported successfully!",
    "importFailed": "Failed to import video: {{error}}",
    "fileTooLarge": "File is too large. Maximum size is 500MB.",
    "invalidFileType": "Only video files are allowed."
  }
}
```

## Acceptance Criteria

- [ ] User can connect Google Drive account via OAuth2
- [ ] User can browse Drive folders (navigate in/out)
- [ ] User can see list of video files in selected folder
- [ ] User can import video files (downloads to local storage)
- [ ] Imported videos appear in "My Videos" list
- [ ] Video metadata (duration, resolution) is extracted and stored
- [ ] User can delete imported videos (removes file + DB record)
- [ ] UI shows loading states during API calls
- [ ] Errors are displayed with toast notifications

## Testing

**Manual Tests**
1. Connect Google Drive → Should redirect to Google consent screen
2. After consent → Should redirect back to app with success message
3. Browse folders → Should show list of folders
4. Click folder → Should show videos inside
5. Import video → Should download and show in imported list
6. Delete video → Should remove from list and delete file

**API Tests (Postman/curl)**
```bash
# Check Drive connection status
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/videos/drive/status

# List folders
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/videos/drive/folders

# Import video
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"fileId":"abc123","folderId":"folder456"}' \
  http://localhost:4000/api/videos/import
```

## Technical Debt / Notes

- Google Drive API has rate limits; consider caching folder listings
- For production, use service account for app-wide access (optional)
- Video downloads can be slow; consider background job queue (Bull/Redis) for Phase 8
- Consider using Google Drive's `alt=media` for direct file download
- Store refresh tokens securely (encrypted at rest)
- Consider supporting multiple Drive accounts per user in future

## Next Phase

Proceed to [Phase 3: Video Merging & TikTok Audio](PHASE_3_VIDEO_MERGING.md) to implement FFmpeg video processing and trending audio integration.
