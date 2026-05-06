# Phase 6: Voiceover System (ElevenLabs)

**Duration**: 2 weeks  
**Priority**: High  
**Status**: Not Started  
**Depends On**: Phase 1 (Foundation), Phase 5 (AI Script)

## Overview

Integrate ElevenLabs API to generate high-quality AI voiceovers from scripts. Support both English and Vietnamese voices, with options for voice selection, speed adjustment, and audio synchronization with video.

## Goals

1. Set up ElevenLabs API integration
2. Create voice library with EN/VI voices
3. Generate voiceovers from scripts
4. Build voiceover management UI
5. Sync voiceovers with video timing

## Deliverables

### 6.1 ElevenLabs Service

**File**: `backend/src/services/elevenlabs.js`

```javascript
const axios = require('axios');

class ElevenLabsService {
    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY;
        this.baseURL = 'https://api.elevenlabs.io/v1';
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'xi-api-key': this.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }
    
    // Get available voices
    async getVoices() {
        try {
            const response = await this.client.get('/voices');
            return response.data.voices;
        } catch (error) {
            console.error('Failed to fetch voices:', error);
            throw new Error('Could not fetch voices from ElevenLabs');
        }
    }
    
    // Generate voiceover from text
    async generateVoiceover(text, voiceId, options = {}) {
        const {
            model = 'eleven_multilingual_v2', // Supports EN + VI
            stability = 0.5,
            similarityBoost = 0.75,
            style = 0.0,
            speed = 1.0
        } = options;
        
        try {
            const response = await this.client.post(
                `/text-to-speech/${voiceId}`,
                {
                    text: text,
                    model_id: model,
                    voice_settings: {
                        stability,
                        similarity_boost: similarityBoost,
                        style,
                        speed
                    }
                },
                {
                    responseType: 'arraybuffer' // Get audio as binary
                }
            );
            
            return {
                success: true,
                audioBuffer: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            console.error('Voiceover generation failed:', error);
            throw new Error(`Voiceover generation failed: ${error.message}`);
        }
    }
    
    // Get voice by language
    getVoicesByLanguage(voices, language) {
        const languageMap = {
            'en': ['English', 'en-'],
            'vi': ['Vietnamese', 'vi-', 'Nguyen', 'Linh'] // Common VI voice names
        };
        
        const keywords = languageMap[language] || languageMap['en'];
        return voices.filter(voice => 
            keywords.some(kw => 
                voice.name.includes(kw) || 
                voice.labels?.language?.includes(kw)
            )
        );
    }
    
    // Estimate cost (ElevenLabs pricing)
    estimateCost(text) {
        const characterCount = text.length;
        const costPerChar = 0.000015; // Approximate, check current pricing
        return characterCount * costPerChar;
    }
}
```

**Environment Variables**
```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 6.2 Voiceover Backend Routes

**File**: `backend/src/routes/voiceover.js`

**Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/voiceover/voices` | List available voices |
| GET | `/api/voiceover/voices/:lang` | List voices by language |
| POST | `/api/voiceover/generate` | Generate voiceover from script |
| GET | `/api/voiceover` | List user's voiceovers |
| GET | `/api/voiceover/:id` | Get voiceover details |
| DELETE | `/api/voiceover/:id` | Delete voiceover |
| GET | `/api/voiceover/:id/download` | Download voiceover file |

**Generate Voiceover Endpoint**

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/voiceovers/' });

router.post('/generate', authenticate, async (req, res) => {
    try {
        const { scriptId, voiceId, language = 'en', speed = 1.0 } = req.body;
        
        // Fetch script
        const scriptResult = await db.query(
            'SELECT * FROM scripts WHERE id = $1 AND user_id = $2',
            [scriptId, req.user.id]
        );
        
        if (scriptResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Script not found' });
        }
        
        const script = scriptResult.rows[0];
        
        // Generate voiceover
        const elevenLabs = new ElevenLabsService();
        const voiceover = await elevenLabs.generateVoiceover(
            script.content,
            voiceId,
            { speed, language }
        );
        
        // Save audio file
        const fileName = `voiceover_${uuidv4()}.mp3`;
        const filePath = `uploads/voiceovers/${fileName}`;
        fs.writeFileSync(filePath, voiceover.audioBuffer);
        
        // Get audio duration
        const duration = await getAudioDuration(filePath);
        
        // Save to database
        const result = await db.query(`
            INSERT INTO voiceovers (user_id, script_id, voice_id, voice_name, language, audio_file_path, duration)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [
            req.user.id,
            scriptId,
            voiceId,
            voiceId, // Will fetch voice name separately if needed
            language,
            filePath,
            duration
        ]);
        
        res.json({
            success: true,
            data: {
                id: result.rows[0].id,
                filePath: filePath,
                duration: duration
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

### 6.3 Voiceover Data Model

**Database Schema (Already in Phase 1)**

```sql
-- voiceovers table (created in Phase 1)
-- Additional columns if needed:

ALTER TABLE voiceovers ADD COLUMN IF NOT EXISTS 
    speed DECIMAL(3, 2) DEFAULT 1.0;
ALTER TABLE voiceovers ADD COLUMN IF NOT EXISTS 
    model VARCHAR(100) DEFAULT 'eleven_multilingual_v2';
ALTER TABLE voiceovers ADD COLUMN IF NOT EXISTS 
    file_size BIGINT;
ALTER TABLE voiceovers ADD COLUMN IF NOT EXISTS 
    download_url VARCHAR(500);
```

### 6.4 Frontend: Voiceover Page

**File**: `frontend/src/pages/VoiceoverPage.jsx`

**Features**

1. **Voice Library**
   - Browse available voices (EN + VI)
   - Filter by language
   - Preview voice samples
   - Select voice for generation

2. **Voiceover Generator**
   - Select script from library
   - Choose voice
   - Adjust speed (0.5x - 2.0x)
   - "Generate Voiceover" button
   - Progress indicator during generation

3. **Voiceover Library**
   - List of generated voiceovers
   - Play audio in browser
   - Download MP3
   - Delete voiceover
   - Link to associated script

4. **Audio Player**
   - Play/pause controls
   - Progress bar
   - Volume control
   - Waveform visualization (optional, using wavesurfer.js)

**Components**

```jsx
// VoiceSelector.jsx
const VoiceSelector = ({ language, onSelect }) => {
    const [voices, setVoices] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        voiceoverApi.getVoices(language).then(res => {
            setVoices(res.data);
            setLoading(false);
        });
    }, [language]);
    
    return (
        <div className="voice-selector">
            <h3>Select Voice</h3>
            {loading ? <p>Loading voices...</p> : (
                <div className="voice-list">
                    {voices.map(voice => (
                        <div key={voice.voice_id} className="voice-item">
                            <span>{voice.name}</span>
                            <button onClick={() => previewVoice(voice.voice_id)}>
                                Preview
                            </button>
                            <button onClick={() => onSelect(voice)}>
                                Select
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// VoiceoverGenerator.jsx
const VoiceoverGenerator = () => {
    const [scripts, setScripts] = useState([]);
    const [selectedScript, setSelectedScript] = useState(null);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [speed, setSpeed] = useState(1.0);
    const [generating, setGenerating] = useState(false);
    
    const handleGenerate = async () => {
        if (!selectedScript || !selectedVoice) {
            toast.error('Please select script and voice');
            return;
        }
        
        setGenerating(true);
        try {
            await voiceoverApi.generate({
                scriptId: selectedScript.id,
                voiceId: selectedVoice.voice_id,
                speed
            });
            toast.success('Voiceover generated successfully!');
        } catch (error) {
            toast.error('Failed to generate voiceover');
        } finally {
            setGenerating(false);
        }
    };
    
    return (
        <div className="voiceover-generator">
            <div className="script-select">
                <label>Select Script:</label>
                <select onChange={(e) => setSelectedScript(scripts.find(s => s.id === e.target.value))}>
                    <option>-- Choose a script --</option>
                    {scripts.map(script => (
                        <option key={script.id} value={script.id}>
                            {script.title}
                        </option>
                    ))}
                </select>
            </div>
            
            <VoiceSelector language={selectedScript?.language || 'en'} onSelect={setSelectedVoice} />
            
            <div className="speed-control">
                <label>Speed: {speed}x</label>
                <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1"
                    value={speed} 
                    onChange={(e) => setSpeed(parseFloat(e.target.value))} 
                />
            </div>
            
            <button onClick={handleGenerate} disabled={generating || !selectedScript || !selectedVoice}>
                {generating ? 'Generating...' : 'Generate Voiceover'}
            </button>
        </div>
    );
};

// AudioPlayer.jsx
const AudioPlayer = ({ audioUrl }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };
    
    return (
        <div className="audio-player">
            <audio 
                ref={audioRef} 
                src={audioUrl}
                onTimeUpdate={(e) => setProgress(e.target.currentTime / e.target.duration * 100)}
            />
            <button onClick={togglePlay}>
                {isPlaying ? '⏸️' : '▶️'}
            </button>
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
};
```

### 6.5 Audio Synchronization

**Sync Voiceover with Video**

When applying voiceover to video (Phase 3 + 4), ensure timing matches:

```javascript
// In project processing pipeline:
async function addVoiceoverToVideo(videoPath, voiceoverPath, outputPath) {
    // Get voiceover duration
    const voiceoverDuration = await getAudioDuration(voiceoverPath);
    
    // Adjust video duration to match voiceover (loop or trim)
    const videoDuration = await getVideoDuration(videoPath);
    
    if (videoDuration < voiceoverDuration) {
        // Loop video to match voiceover duration
        return loopVideoToDuration(videoPath, voiceoverDuration, outputPath);
    } else {
        // Trim video to voiceover duration
        return trimVideo(videoPath, 0, voiceoverDuration, outputPath);
    }
    
    // Then add voiceover audio
    // ... FFmpeg command to mux audio + video
}
```

### 6.6 Cost Management

**Track ElevenLabs Usage**

```javascript
// Log usage after each generation
await db.query(`
    INSERT INTO usage_logs (user_id, service, characters_used, cost_estimate)
    VALUES ($1, 'elevenlabs', $2, $3)
`, [req.user.id, text.length, estimatedCost]);

// Add usage to voiceover record
ALTER TABLE voiceovers ADD COLUMN IF NOT EXISTS 
    characters_used INTEGER;
ALTER TABLE voiceovers ADD COLUMN IF NOT EXISTS 
    cost_estimate DECIMAL(10, 4);
```

**Usage Dashboard (Optional)**

Show user their usage stats:
- Characters used this month
- Estimated cost
- Number of voiceovers generated

### 6.7 Error Handling

**Common Issues**

1. **API Key Invalid**
   - Check API key in settings
   - Show error: "Invalid ElevenLabs API key. Please check settings."

2. **Quota Exceeded**
   - ElevenLabs has character limits
   - Show error: "Character quota exceeded. Upgrade your plan."

3. **Voice Not Found**
   - Voice ID may be deprecated
   - Fallback to default voice

4. **Text Too Long**
   - Split into chunks and generate separately
   - Or show error: "Script too long. Please shorten to X characters."

**Error Messages (i18n)**

```json
{
  "voiceover": {
    "generating": "Generating voiceover...",
    "success": "Voiceover generated successfully!",
    "error": "Failed to generate voiceover: {{error}}",
    "invalidApiKey": "Invalid ElevenLabs API key. Please check settings.",
    "quotaExceeded": "Character quota exceeded. Please upgrade your plan.",
    "selectScript": "Please select a script first.",
    "selectVoice": "Please select a voice."
  }
}
```

## Acceptance Criteria

- [ ] User can browse EN and VI voices from ElevenLabs
- [ ] User can preview voice samples
- [ ] User can select a script and generate voiceover
- [ ] User can adjust voice speed (0.5x - 2.0x)
- [ ] Generated voiceover is saved and playable
- [ ] User can download voiceover as MP3
- [ ] User can delete voiceovers
- [ ] Voiceovers are linked to scripts in database
- [ ] Audio duration is extracted and stored
- [ ] Cost estimation is displayed before generation

## Testing

**API Test**
```bash
# Get voices
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/voiceover/voices

# Generate voiceover
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "scriptId": "script123",
    "voiceId": "voice_id_here",
    "language": "en",
    "speed": 1.0
  }' \
  http://localhost:4000/api/voiceover/generate
```

**Manual Tests**
1. Select EN script → Generate with EN voice → Should produce English audio
2. Select VI script → Generate with VI voice → Should produce Vietnamese audio
3. Adjust speed → Audio should play faster/slower
4. Generate long script → Should handle (or show error if too long)
5. Delete voiceover → File and DB record should be removed

## Technical Debt / Notes

- ElevenLabs API has rate limits; implement queue for bulk generation
- Audio files can be large; consider cloud storage (S3) for production
- Voice preview requires sample text; use standard samples per language
- Consider caching generated voiceovers to avoid re-generation
- ElevenLabs multilingual model supports VI but quality may vary; test thoroughly
- For better VI support, consider local TTS solutions as fallback (VietTTS)

## Next Phase

Proceed to [Phase 7: Internationalization (EN/VI)](PHASE_7_I18N.md) to complete the language support system across the entire application.
