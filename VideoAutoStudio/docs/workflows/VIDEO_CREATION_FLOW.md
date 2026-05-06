# Video Creation Flow

## End-to-End Video Creation Workflow

This document describes the complete workflow of creating a video in VideoAutoStudio, from importing clips to exporting the final video.

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     VIDEO CREATION WORKFLOW                     │
└─────────────────────────────────────────────────────────────────┘

1. SETUP
   ├─ Connect Google Drive
   ├─ Browse folders
   └─ Import video clips

2. PROJECT CREATION
   ├─ Create new project
   ├─ Select imported videos
   ├─ Arrange timeline
   └─ Trim clips (optional)

3. AUDIO SELECTION
   ├─ Browse trending TikTok audio
   ├─ Search audio tracks
   └─ Select audio for project

4. TEMPLATE APPLICATION (Optional)
   ├─ Choose CapCut template
   ├─ Fill template variables
   └─ Preview template

5. SCRIPT GENERATION
   ├─ Select language (EN/VI)
   ├─ Choose tone (professional, casual, etc.)
   ├─ Generate AI script (Claude)
   └─ Edit script (optional)

6. VOICEOVER CREATION
   ├─ Select voice (EN/VI voices)
   ├─ Adjust speed
   ├─ Generate voiceover (ElevenLabs)
   └─ Sync with video timing

7. VIDEO PROCESSING
   ├─ Merge video clips (FFmpeg)
   ├─ Add audio track
   ├─ Apply template (text overlays, effects)
   ├─ Add voiceover
   └─ Export final video

8. REVIEW & EXPORT
   ├─ Preview final video
   ├─ Download MP4
   └─ Share/Publish (future)
```

## Step-by-Step Workflow

### Step 1: Connect Google Drive & Import Videos

**User Action:**
1. Navigate to "Drive Videos" page
2. Click "Connect Google Drive"
3. Authorize in Google OAuth popup
4. Browse folders in Drive
5. Select video clips
6. Click "Import Selected"

**System Process:**
```
Frontend: GET /api/auth/google → Redirect to Google
Google: User authorizes → Redirect to /api/auth/google/callback
Backend: Exchange code → Store tokens in drive_connections
Frontend: Show "Connected" status

User browses folders:
Frontend: GET /api/videos/drive/folders
Backend: drive.files.list({ q: "mimeType='application/vnd.google-apps.folder'" })
Frontend: Display folder list

User selects folder → Shows videos:
Frontend: GET /api/videos/drive/files?folderId=xxx
Backend: drive.files.list({ q: "mimeType contains 'video/'" })
Frontend: Display video thumbnails

User imports:
Frontend: POST /api/videos/import { fileId, folderId }
Backend: 
  1. drive.files.get({ fileId }) → stream to local file
  2. ffprobe → extract metadata (duration, resolution)
  3. INSERT INTO videos (...) VALUES (...)
Frontend: Show in "Imported Videos" list
```

**Database Changes:**
```sql
INSERT INTO drive_connections (user_id, access_token, refresh_token, expires_at)
VALUES (?, ?, ?, ?)
ON CONFLICT (user_id) DO UPDATE SET ...

INSERT INTO videos (user_id, drive_file_id, name, file_path, duration, resolution)
VALUES (?, ?, ?, ?, ?, ?)
```

---

### Step 2: Create Project & Select Videos

**User Action:**
1. Navigate to "Projects" page
2. Click "New Project"
3. Enter project name/description
4. Select imported videos from library
5. Arrange order via drag-and-drop
6. Trim videos (set start/end time)

**System Process:**
```
Frontend: POST /api/projects
{
  "name": "My Video Project",
  "description": "Promotional video for business",
  "videoIds": ["vid1", "vid2", "vid3"]
}

Backend:
  1. INSERT INTO projects (user_id, name, description) VALUES (...)
  2. For each videoId:
     INSERT INTO project_videos (project_id, video_id, order_index) VALUES (...)
  3. Return project ID

Frontend: Redirect to project editor
```

**Database Changes:**
```sql
INSERT INTO projects (id, user_id, name, description, status)
VALUES ('proj_123', 'user_1', 'My Project', '...', 'draft');

INSERT INTO project_videos (project_id, video_id, order_index, trim_start, trim_end)
VALUES 
  ('proj_123', 'vid_1', 0, 0, 30),
  ('proj_123', 'vid_2', 1, 5, 45),
  ('proj_123', 'vid_3', 2, 0, 60);
```

---

### Step 3: Select Audio Track

**User Action:**
1. Navigate to "Audio" tab in project editor
2. Browse trending TikTok sounds
3. Play preview
4. Select audio track for project

**System Process:**
```
Frontend: GET /api/audio/trending
Backend: 
  1. Call TikTok API or scrape trending sounds
  2. Return list: [{ id, name, artist, duration, previewUrl }]

User selects audio:
Frontend: PUT /api/projects/:id { audioTrackId: 'audio_123' }
Backend: UPDATE projects SET audio_track_id = ? WHERE id = ?
```

**Optional: Search Audio**
```
Frontend: GET /api/audio/search?q=upbeat
Backend: Filter trending sounds by keyword
```

---

### Step 4: Apply CapCut Template (Optional)

**User Action:**
1. Navigate to "Template" tab
2. Browse template gallery
3. Select template
4. Fill in template variables (text fields)
5. Preview template application

**System Process:**
```
Frontend: GET /api/templates
Backend: SELECT * FROM templates WHERE user_id = ? OR is_public = true

User selects template:
Frontend: PUT /api/projects/:id { templateId: 'template_456' }

User fills variables:
Frontend: POST /api/templates/:id/apply
{
  "projectId": "proj_123",
  "variables": {
    "title": "Welcome to Our Business",
    "subtitle": "Best services in town"
  }
}

Backend:
  1. Fetch template config (JSON)
  2. Replace {{variable}} placeholders with user values
  3. Store in project: UPDATE projects SET template_config = ?
  4. Return preview (optional: generate quick preview video)
```

**Template Config Example:**
```json
{
  "elements": [
    {
      "type": "text",
      "id": "title_text",
      "content": "{{title}}",
      "position": { "x": 540, "y": 200 },
      "font": { "size": 48, "color": "#FFFFFF" },
      "timing": { "start": 0, "end": 5 }
    }
  ]
}
```

---

### Step 5: Generate Script with AI

**User Action:**
1. Navigate to "Script" tab
2. Select language (English or Vietnamese)
3. Choose tone (professional, casual, funny, etc.)
4. Optionally select template for context
5. Click "Generate Script"
6. Edit generated script if needed

**System Process:**
```
Frontend: POST /api/scripts/generate
{
  "language": "en",
  "tone": "professional",
  "templateId": "template_456",
  "variables": {
    "businessName": "ABC Corp",
    "service": "Web Development"
  }
}

Backend:
  1. Fetch template (if provided)
  2. Build prompt using ai.js:buildPrompt()
     - Include language instructions
     - Add tone guidelines
     - Add template context
  3. Call Claude API:
     anthropic.messages.create({
       model: 'claude-3-5-sonnet-20241022',
       messages: [{ role: 'user', content: prompt }]
     })
  4. Receive generated script
  5. Save to DB:
     INSERT INTO scripts (user_id, project_id, content, language, tone, generated_by_ai)
     VALUES (?, ?, ?, ?, ?, true)
  6. Link to project: UPDATE projects SET script_id = ? WHERE id = ?
  7. Return script to frontend

Frontend: Display script in editable textarea
User edits → PUT /api/scripts/:id { content: 'edited script...' }
```

**Prompt Example (English):**
```
Write in English. Generate a professional video script for a business promotion.

Template: Business Promo Template
Variables:
- businessName: ABC Corp
- service: Web Development

Use a professional, authoritative tone suitable for business content.

Output the script in the following format:
[SCENE 1]
Visual: <description>
Audio: <text to be spoken>
Duration: <seconds>
...
```

**Prompt Example (Vietnamese):**
```
Viết bằng tiếng Việt. Tạo kịch bản video chuyên nghiệp cho quảng cáo doanh nghiệp.

Mẫu: Business Promo Template
Biến:
- businessName: ABC Corp
- service: Web Development

Sử dụng giọng điệu chuyên nghiệp, uy tín phù hợp cho nội dung doanh nghiệp.

Định dạng kịch bản như sau:
[CẢNH 1]
Hình ảnh: <mô tả>
Âm thanh: <văn bản cần đọc>
Thời lượng: <giây>
...
```

---

### Step 6: Create Voiceover

**User Action:**
1. Navigate to "Voiceover" tab
2. Select script (from Step 5)
3. Choose voice (English or Vietnamese voices from ElevenLabs)
4. Adjust speed (0.5x - 2.0x)
5. Click "Generate Voiceover"
6. Preview audio

**System Process:**
```
Frontend: POST /api/voiceover/generate
{
  "scriptId": "script_789",
  "voiceId": "elevenlabs_voice_id",
  "speed": 1.0
}

Backend:
  1. Fetch script content: SELECT content FROM scripts WHERE id = ?
  2. Fetch voice details (optional)
  3. Call ElevenLabs API:
     POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}
     Headers: { 'xi-api-key': API_KEY }
     Body: {
       text: scriptContent,
       voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 }
     }
  4. Receive audio buffer (MP3)
  5. Save to file: uploads/voiceovers/voiceover_{id}.mp3
  6. Get duration: ffprobe voiceover_{id}.mp3
  7. Save to DB:
     INSERT INTO voiceovers (user_id, script_id, voice_id, audio_file_path, duration)
     VALUES (?, ?, ?, ?, ?)
  8. Link to project: UPDATE projects SET voiceover_id = ? WHERE id = ?
  9. Return audio URL to frontend

Frontend: Display audio player
User can play/pause, download MP3
```

**Voice Selection (Frontend):**
```
Frontend: GET /api/voiceover/voices?language=en
Backend: 
  1. Call ElevenLabs: GET https://api.elevenlabs.io/v1/voices
  2. Filter by language (EN or VI)
  3. Return voice list: [{ voice_id, name, preview_url }]
```

---

### Step 7: Process & Export Video

**User Action:**
1. Navigate to "Process" tab
2. Review all selections (videos, audio, template, script, voiceover)
3. Click "Process Video"
4. Wait for processing (progress bar)
5. Preview final video
6. Download MP4

**System Process:**
```
Frontend: POST /api/projects/:id/process
Backend:
  1. Fetch project details:
     SELECT p.*, 
            json_agg(pv.*) as videos,
            t.config as template_config,
            s.content as script,
            v.audio_file_path as voiceover_path,
            a.file_path as audio_path
     FROM projects p
     LEFT JOIN project_videos pv ON p.id = pv.project_id
     LEFT JOIN templates t ON p.template_id = t.id
     LEFT JOIN scripts s ON p.script_id = s.id
     LEFT JOIN voiceovers v ON p.voiceover_id = v.id
     LEFT JOIN audio_tracks a ON p.audio_id = a.id
     WHERE p.id = ?
  
  2. Video Processing Pipeline (FFmpeg):
     
     Step 1: Merge video clips
     -----------------------------------------
     Input: video1.mp4, video2.mp4, video3.mp4
     FFmpeg: 
       ffmpeg -f concat -i filelist.txt -c copy merged.mp4
     Output: merged.mp4
     
     Step 2: Add audio track (if selected)
     -----------------------------------------
     Input: merged.mp4, tiktok_audio.mp3
     FFmpeg:
       ffmpeg -i merged.mp4 -i tiktok_audio.mp3 
              -map 0:v -map 1:a -c:v copy -c:a aac -shortest 
              merged_with_audio.mp4
     Output: merged_with_audio.mp4
     
     Step 3: Apply CapCut template (text overlays)
     -----------------------------------------
     Input: merged_with_audio.mp4, template_config (JSON)
     FFmpeg:
       For each text element in template:
         - Draw text at specified position
         - Apply timing (enable: between(t,start,end))
         - Apply animations (fade in/out)
       ffmpeg -i merged_with_audio.mp4 
              -vf "drawtext=text='Title':x=540:y=200:enable='between(t,0,5)'"
              video_with_text.mp4
     Output: video_with_text.mp4
     
     Step 4: Add voiceover (if selected)
     -----------------------------------------
     Input: video_with_text.mp4, voiceover.mp3
     FFmpeg:
       ffmpeg -i video_with_text.mp4 -i voiceover.mp3
              -map 0:v -map 1:a -c:v copy -c:a aac
              -shortest final_video.mp4
     Output: final_video.mp4
  
  3. Save output:
     UPDATE projects 
     SET output_file_path = 'uploads/projects/proj_123/final_video.mp4',
         status = 'completed'
     WHERE id = ?
  
  4. Return success to frontend

Frontend:
  - Show progress bar during processing
  - Display "Completed!" message
  - Show video preview (HTML5 video player)
  - Provide download link
```

**FFmpeg Command Summary:**
```bash
# 1. Merge videos
ffmpeg -f concat -safe 0 -i filelist.txt -c copy merged.mp4

# 2. Add audio
ffmpeg -i merged.mp4 -i audio.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -shortest merged_audio.mp4

# 3. Add text overlay (example)
ffmpeg -i merged_audio.mp4 -vf "drawtext=text='Welcome':fontfile=/fonts/arial.ttf:fontsize=48:fontcolor=white:x=540:y=200:enable='between(t,0,5)'" final.mp4

# 4. Add voiceover
ffmpeg -i final.mp4 -i voiceover.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -shortest final_voiceover.mp4
```

---

### Step 8: Review & Export

**User Action:**
1. Preview final video in browser
2. Check video/audio sync
3. Verify text overlays
4. Download MP4 file
5. Share on social media (future feature)

**System Process:**
```
Frontend: GET /api/projects/:id/preview
Backend:
  - Fetch project output_file_path
  - Stream video file (with range request support)
  - Return video/mp4 content-type

Frontend: 
  <video controls>
    <source src="/api/projects/123/preview" type="video/mp4" />
  </video>

Download:
Frontend: <a href="/api/projects/123/download" download>Download</a>
Backend: 
  res.download(project.output_file_path)
```

---

## Error Handling & Edge Cases

### Google Drive Import Fails
- **Token expired**: Auto-refresh using refresh token
- **File too large**: Show error "File exceeds 500MB limit"
- **Network error**: Retry with exponential backoff
- **Invalid file type**: "Only video files are allowed"

### Video Processing Fails
- **FFmpeg error**: Log error, show "Processing failed" with details
- **Disk full**: "Insufficient storage space"
- **Unsupported format**: "Video format not supported. Use MP4/H.264"
- **Long processing time**: Show progress updates, allow cancellation

### AI Generation Fails
- **Claude API error**: "Script generation failed. Please try again."
- **ElevenLabs quota exceeded**: "Voiceover quota exceeded. Upgrade plan."
- **Invalid API key**: "API key invalid. Check settings."

## Performance Optimization

### Video Processing
- Use streaming for large files
- Process in background (queue system) for long videos
- Cache processed segments
- Use GPU acceleration (if available): `-hwaccel cuda`

### API Calls
- Cache Google Drive folder listings (5 min TTL)
- Cache trending TikTok audio (1 hour TTL)
- Pre-fetch voices on app load

### Database
- Index frequently queried columns
- Use connection pooling
- Paginate large result sets

## Testing the Workflow

### Manual Test Checklist
- [ ] Connect Google Drive (OAuth flow)
- [ ] Import 3 video clips from different folders
- [ ] Create project with imported videos
- [ ] Arrange video order
- [ ] Trim a video segment
- [ ] Select trending TikTok audio
- [ ] Apply CapCut template with variables
- [ ] Generate EN script with professional tone
- [ ] Generate VI script with casual tone
- [ ] Create voiceover (EN voice)
- [ ] Create voiceover (VI voice)
- [ ] Process video (full pipeline)
- [ ] Preview final video
- [ ] Download MP4
- [ ] Switch language to VI (all UI updates)
- [ ] Repeat workflow in VI

### Automated Tests
- Unit tests for each service (googleDrive, ffmpeg, ai, elevenlabs)
- Integration tests for API endpoints
- E2E tests for critical flows (Cypress/Playwright)

---

This workflow provides a complete end-to-end video creation experience, combining multiple technologies into a seamless user journey.
