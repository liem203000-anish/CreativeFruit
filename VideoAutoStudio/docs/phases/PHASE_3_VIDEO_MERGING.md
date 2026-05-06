# Phase 3: Video Merging & TikTok Audio

**Duration**: 2 weeks  
**Priority**: High  
**Status**: Not Started  
**Depends On**: Phase 1 (Foundation), Phase 2 (Google Drive)

## Overview

Implement video processing capabilities using FFmpeg to merge multiple video clips, add trending TikTok audio tracks, and prepare videos for template application. This phase focuses on the core video manipulation functionality.

## Goals

1. Set up FFmpeg for video processing (merge, trim, audio)
2. Integrate TikTok trending audio API/scraping
3. Build video preview and editing UI
4. Implement video merging with audio overlay
5. Create project-based video assembly workflow

## Deliverables

### 3.1 FFmpeg Setup & Service

**Installation**
- [ ] Install FFmpeg on development machine
- [ ] Add FFmpeg to Docker images (backend Dockerfile)
- [ ] Verify FFmpeg installation in backend container

**Backend: FFmpeg Service**

**File**: `backend/src/services/ffmpeg.js`

```javascript
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

class FFmpegService {
    // Merge multiple video files
    async mergeVideos(videoPaths, outputPath, options = {}) {
        return new Promise((resolve, reject) => {
            let command = ffmpeg();
            
            // Add input videos
            videoPaths.forEach(path => {
                command = command.input(path);
            });
            
            // Concat filter
            command
                .complexFilter([
                    {
                        filter: 'concat',
                        options: { n: videoPaths.length, v: 1, a: 1 },
                        outputs: ['outv', 'outa']
                    }
                ])
                .outputOptions([
                    '-map', '[outv]',
                    '-map', '[outa]'
                ])
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err))
                .run();
        });
    }

    // Add audio to video
    async addAudioToVideo(videoPath, audioPath, outputPath, options = {}) {
        // audioOptions: { volume: 0.5, fadeIn: 2, fadeOut: 2 }
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .input(audioPath)
                .outputOptions([
                    '-map', '0:v',
                    '-map', '1:a',
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-shortest' // End when shortest stream ends
                ])
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err))
                .run();
        });
    }

    // Trim video
    async trimVideo(videoPath, outputPath, startTime, endTime) {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .setStartTime(startTime)
                .setDuration(endTime - startTime)
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err))
                .run();
        });
    }

    // Get video metadata
    async getMetadata(videoPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) reject(err);
                resolve({
                    duration: metadata.format.duration,
                    resolution: `${metadata.streams[0].width}x${metadata.streams[0].height}`,
                    videoCodec: metadata.streams[0].codec_name,
                    audioCodec: metadata.streams[1]?.codec_name,
                    frameRate: eval(metadata.streams[0].r_frame_rate)
                });
            });
        });
    }

    // Generate thumbnail
    async generateThumbnail(videoPath, outputPath, time = '00:00:01') {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: [time],
                    filename: outputPath,
                    size: '320x240'
                })
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err))
                .run();
        });
    }
}
```

**Dependencies**
```bash
npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg
```

### 3.2 TikTok Trending Audio

**Options for Getting Trending Audio**

1. **TikTok Official API** (if available/approved)
   - Apply for TikTok Developer account
   - Use Research API or Business API
   - Endpoint: `/video/list/` with trending filter

2. **Third-party API** (RapidAPI, etc.)
   - Search for "TikTok trending sounds API"
   - Usually paid but reliable

3. **Web Scraping** (TikTok website)
   - Use Puppeteer/Playwright to scrape trending sounds
   - Less reliable, may break with UI changes
   - Good for MVP/prototype

**Backend: TikTok Audio Service**

**File**: `backend/src/services/tiktokAudio.js`

```javascript
class TikTokAudioService {
    // Get trending sounds (using scraping or API)
    async getTrendingAudio(limit = 20) {
        // Implementation depends on chosen method
        // Return: [{ id, name, artist, duration, previewUrl }]
    }

    // Download audio from TikTok
    async downloadAudio(soundId, outputPath) {
        // Download audio file to local storage
    }

    // Search sounds by keyword
    async searchAudio(query) {
        // Search trending sounds by name/artist
    }
}
```

**Routes**

**File**: `backend/src/routes/audio.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audio/trending` | Get trending TikTok sounds |
| GET | `/api/audio/search` | Search audio by keyword |
| POST | `/api/audio/download` | Download audio track |
| GET | `/api/audio` | List downloaded audio |
| DELETE | `/api/audio/:id` | Delete audio track |

### 3.3 Video Processing Routes

**File**: `backend/src/routes/projects.js`

**New Endpoints for Video Processing**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/merge` | Merge selected videos |
| POST | `/api/projects/:id/add-audio` | Add audio to merged video |
| POST | `/api/projects/:id/trim` | Trim video segment |
| GET | `/api/projects/:id/preview` | Get preview URL |
| POST | `/api/projects/:id/process` | Full processing pipeline |

**Processing Pipeline Example**

```javascript
router.post('/:id/process', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { videoIds, audioId, options } = req.body;
        
        // 1. Fetch video paths from DB
        const videos = await getProjectVideos(id);
        const videoPaths = videos.map(v => v.file_path);
        
        // 2. Merge videos
        const mergedPath = `/uploads/projects/${id}/merged.mp4`;
        await ffmpegService.mergeVideos(videoPaths, mergedPath);
        
        // 3. Add audio (if selected)
        if (audioId) {
            const audio = await getAudioById(audioId);
            const finalPath = `/uploads/projects/${id}/final.mp4`;
            await ffmpegService.addAudioToVideo(mergedPath, audio.file_path, finalPath);
            
            // Update project with output path
            await updateProjectOutput(id, finalPath);
        }
        
        res.json({ success: true, data: { outputPath: finalPath } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

### 3.4 Frontend: Projects Page

**File**: `frontend/src/pages/ProjectsPage.jsx`

**Features**

1. **Project List**
   - Grid/table of user's projects
   - Create new project button
   - Filter by status (draft, processing, completed)
   - Delete project action

2. **Project Editor (Modal/Separate Page)**
   - **Video Selection Tab**
     - Select imported videos (from Phase 2)
     - Drag-and-drop reordering
     - Trim controls (start/end time)
     - Preview thumbnails
   
   - **Audio Selection Tab**
     - Browse trending TikTok audio
     - Search audio
     - Preview audio (play button)
     - Select audio for project
   
   - **Processing Tab**
     - "Process Video" button
     - Progress bar during processing
     - Preview processed video
     - Download button

**Components**

```jsx
// ProjectCard.jsx
const ProjectCard = ({ project, onEdit, onDelete }) => {
    return (
        <div className="project-card">
            <img src={project.thumbnail} alt={project.name} />
            <h3>{project.name}</h3>
            <span className={`status ${project.status}`}>{project.status}</span>
            <button onClick={() => onEdit(project)}>Edit</button>
            <button onClick={() => onDelete(project.id)}>Delete</button>
        </div>
    );
};

// VideoTimeline.jsx
const VideoTimeline = ({ videos, onReorder, onTrim }) => {
    return (
        <div className="timeline">
            {videos.map((video, index) => (
                <div key={video.id} className="timeline-item">
                    <img src={video.thumbnail} />
                    <input type="range" min="0" max={video.duration} 
                           value={video.trimStart} onChange={...} />
                    <span>{video.duration}s</span>
                </div>
            ))}
        </div>
    );
};

// AudioBrowser.jsx
const AudioBrowser = ({ onSelect }) => {
    const [trending, setTrending] = useState([]);
    const [search, setSearch] = useState('');
    
    // Fetch trending audio
    useEffect(() => {
        audioApi.getTrending().then(res => setTrending(res.data));
    }, []);
    
    return (
        <div className="audio-browser">
            <input placeholder="Search audio..." value={search} onChange={...} />
            <div className="audio-list">
                {trending.map(audio => (
                    <div key={audio.id} onClick={() => onSelect(audio)}>
                        <span>{audio.name} - {audio.artist}</span>
                        <button>Preview</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

### 3.5 Video Preview

**Backend: Streaming Video**

```javascript
// Serve processed videos as static files or stream
router.get('/projects/:id/preview', authenticate, async (req, res) => {
    const { id } = req.params;
    const project = await getProjectById(id);
    
    if (!project.output_file_path) {
        return res.status(404).json({ error: 'Video not processed yet' });
    }
    
    // Stream video file
    const videoPath = path.join(__dirname, '../..', project.output_file_path);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
        // Handle range requests for video streaming
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        });
        file.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        });
        fs.createReadStream(videoPath).pipe(res);
    }
});
```

**Frontend: Video Player**

```jsx
// Use HTML5 video element or React player library
import ReactPlayer from 'react-player';

const VideoPreview = ({ videoUrl }) => {
    return (
        <div className="video-preview">
            <ReactPlayer 
                url={videoUrl} 
                controls 
                width="100%" 
                height="400px"
            />
        </div>
    );
};
```

### 3.6 Progress Tracking

**Backend: Job Queue (Simple)**

For MVP, use in-memory job tracking. For production, use Redis + Bull.

```javascript
const processingJobs = new Map();

// Start processing job
const startJob = (projectId) => {
    const jobId = uuidv4();
    processingJobs.set(jobId, { projectId, status: 'processing', progress: 0 });
    
    // Process asynchronously
    processVideo(projectId).then(() => {
        processingJobs.set(jobId, { ...processingJobs.get(jobId), status: 'completed', progress: 100 });
    });
    
    return jobId;
};

// Get job status
router.get('/jobs/:jobId', (req, res) => {
    const job = processingJobs.get(req.params.jobId);
    res.json(job);
});
```

**Frontend: Progress Bar**

```jsx
const ProcessingStatus = ({ jobId }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('processing');
    
    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await api.get(`/projects/jobs/${jobId}`);
            setProgress(res.data.progress);
            setStatus(res.data.status);
            if (res.data.status === 'completed') clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [jobId]);
    
    return (
        <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }} />
            <span>{status}: {progress}%</span>
        </div>
    );
};
```

## Acceptance Criteria

- [ ] User can create a new project
- [ ] User can select multiple videos from imported videos
- [ ] User can reorder videos in timeline
- [ ] User can trim video segments (start/end time)
- [ ] User can browse trending TikTok audio
- [ ] User can add audio to video project
- [ ] "Process" button merges videos and adds audio
- [ ] Processing shows progress bar
- [ ] User can preview processed video
- [ ] User can download final video
- [ ] Video metadata (duration, resolution) displayed correctly

## Testing

**FFmpeg Tests**
```bash
# Test FFmpeg installation
ffmpeg -version

# Test merge command manually
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4
```

**API Tests**
```bash
# Create project
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","videoIds":["id1","id2"]}' \
  http://localhost:4000/api/projects

# Process project
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/projects/{id}/process
```

## Technical Debt / Notes

- FFmpeg processing is CPU-intensive; consider limiting concurrent jobs
- Large videos take time to process; implement background queue (Bull/Redis) for Phase 8
- TikTok audio copyright issues; consider using royalty-free music as alternative
- Video format compatibility; ensure all inputs are compatible (MP4/H.264)
- Storage space; processed videos can be large, implement cleanup policy
- Consider using cloud video processing (AWS MediaConvert) for scale

## Next Phase

Proceed to [Phase 4: CapCut Templates](PHASE_4_TEMPLATES.md) to integrate CapCut template system for professional video assembly.
