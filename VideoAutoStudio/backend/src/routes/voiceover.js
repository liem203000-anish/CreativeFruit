const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');
const elevenlabs = require('../services/elevenlabs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Get available voices
router.get('/voices', authenticate, async (req, res) => {
    try {
        const { language } = req.query;
        
        const voices = await elevenlabs.getVoices();
        
        if (language) {
            const filtered = elevenlabs.getVoicesByLanguage(voices, language);
            return res.json({ success: true, data: filtered });
        }
        
        res.json({ success: true, data: voices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate voiceover
router.post('/generate', authenticate, async (req, res) => {
    try {
        const { scriptId, voiceId, speed = 1.0 } = req.body;
        
        if (!scriptId || !voiceId) {
            return res.status(400).json({ success: false, error: 'Script ID and Voice ID required' });
        }
        
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
        const voiceoverResult = await elevenlabs.generateVoiceover(
            script.content,
            voiceId,
            { speed, language: script.language }
        );
        
        if (!voiceoverResult.success) {
            return res.status(500).json({ success: false, error: 'Failed to generate voiceover' });
        }
        
        // Save audio file
        const fileName = `voiceover_${uuidv4()}.mp3`;
        const uploadsDir = path.join(__dirname, '../../uploads/voiceovers');
        const filePath = path.join(uploadsDir, fileName);
        
        // Ensure directory exists
        fs.mkdirSync(uploadsDir, { recursive: true });
        
        fs.writeFileSync(filePath, voiceoverResult.audioBuffer);
        
        // Get audio duration using ffprobe (simplified - store as 0 for now)
        const duration = 0; // TODO: implement ffprobe to get actual duration
        
        // Save to database
        const result = await db.query(`
            INSERT INTO voiceovers (user_id, script_id, voice_id, voice_name, language, audio_file_path, duration, speed)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `, [
            req.user.id,
            scriptId,
            voiceId,
            voiceId, // TODO: fetch actual voice name
            script.language,
            filePath,
            duration,
            speed
        ]);
        
        // Update project if script has project_id
        if (script.project_id) {
            await db.query(
                'UPDATE projects SET voiceover_id = $1, updated_at = NOW() WHERE id = $2',
                [result.rows[0].id, script.project_id]
            );
        }
        
        res.json({
            success: true,
            data: {
                id: result.rows[0].id,
                filePath: filePath,
                downloadUrl: `/api/voiceover/${result.rows[0].id}/download`
            }
        });
    } catch (error) {
        console.error('Voiceover generation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all voiceovers
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM voiceovers WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Download voiceover
router.get('/:id/download', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'SELECT * FROM voiceovers WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Voiceover not found' });
        }
        
        const voiceover = result.rows[0];
        
        // Convert relative path to absolute if needed
        let audioPath = voiceover.audio_file_path;
        if (!path.isAbsolute(audioPath)) {
            audioPath = path.join(__dirname, '../../', audioPath);
        }
        
        if (!fs.existsSync(audioPath)) {
            return res.status(404).json({ success: false, error: 'Audio file not found' });
        }
        
        res.download(audioPath);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
