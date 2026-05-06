const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const ffmpegService = require('../services/ffmpeg');
const path = require('path');
const fs = require('fs');

// Define base upload directory
const UPLOAD_BASE = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Create new project
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, description, videoIds } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, error: 'Project name required' });
        }
        
        // Create project
        const result = await db.query(`
            INSERT INTO projects (user_id, name, description)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [req.user.id, name, description || null]);
        
        const projectId = result.rows[0].id;
        
        // Add videos to project
        if (videoIds && videoIds.length > 0) {
            for (let i = 0; i < videoIds.length; i++) {
                await db.query(`
                    INSERT INTO project_videos (project_id, video_id, order_index)
                    VALUES ($1, $2, $3)
                `, [projectId, videoIds[i], i]);
            }
        }
        
        res.status(201).json({
            success: true,
            data: { id: projectId, name, description }
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all projects
router.get('/', authenticate, async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = `
            SELECT p.*, 
                   json_agg(
                       json_build_object(
                           'id', v.id,
                           'name', v.name,
                           'file_path', v.file_path
                       )
                   ) FILTER (WHERE v.id IS NOT NULL) as videos
            FROM projects p
            LEFT JOIN project_videos pv ON p.id = pv.project_id
            LEFT JOIN videos v ON pv.video_id = v.id
            WHERE p.user_id = $1
        `;
        const params = [req.user.id];
        
        if (status) {
            query += ' AND p.status = $2';
            params.push(status);
        }
        
        query += ' GROUP BY p.id ORDER BY p.created_at DESC';
        
        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get project by ID (with videos)
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get project
        const projectResult = await db.query(
            'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        
        const project = projectResult.rows[0];
        
        // Get project videos with details
        const videosResult = await db.query(`
            SELECT pv.*, v.name, v.file_path, v.duration
            FROM project_videos pv
            JOIN videos v ON pv.video_id = v.id
            WHERE pv.project_id = $1
            ORDER BY pv.order_index
        `, [id]);
        
        project.videos = videosResult.rows;
        
        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update project
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, template_id, script_id, voiceover_id } = req.body;
        
        const result = await db.query(`
            UPDATE projects 
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                template_id = COALESCE($3, template_id),
                script_id = COALESCE($4, script_id),
                voiceover_id = COALESCE($5, voiceover_id),
                updated_at = NOW()
            WHERE id = $6 AND user_id = $7
            RETURNING *
        `, [name, description, template_id, script_id, voiceover_id, id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete project videos first
        await db.query('DELETE FROM project_videos WHERE project_id = $1', [id]);
        
        // Delete project
        const result = await db.query(
            'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update video order in project
router.put('/:id/videos/reorder', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { videoOrders } = req.body; // Array of { videoId, orderIndex }
        
        if (!Array.isArray(videoOrders)) {
            return res.status(400).json({ success: false, error: 'videoOrders must be an array' });
        }
        
        // Verify project belongs to user
        const projectCheck = await db.query(
            'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        
        // Update order for each video
        for (const item of videoOrders) {
            await db.query(`
                UPDATE project_videos 
                SET order_index = $1, updated_at = NOW()
                WHERE project_id = $2 AND video_id = $3
            `, [item.orderIndex, id, item.videoId]);
        }
        
        res.json({ success: true, message: 'Video order updated' });
    } catch (error) {
        console.error('Reorder error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove video from project
router.delete('/:id/videos/:videoId', authenticate, async (req, res) => {
    try {
        const { id, videoId } = req.params;
        
        // Verify project belongs to user
        const projectCheck = await db.query(
            'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        
        // Remove video from project
        await db.query(
            'DELETE FROM project_videos WHERE project_id = $1 AND video_id = $2',
            [id, videoId]
        );
        
        res.json({ success: true, message: 'Video removed from project' });
    } catch (error) {
        console.error('Remove video error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Process video with quality options
router.post('/:id/process', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { quality = 'high', format = 'mp4', includeAudio = true } = req.body;
        
        // Get project with all data
        const projectResult = await db.query(
            'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        
        const project = projectResult.rows[0];
        
        // Update status to processing
        await db.query(
            "UPDATE projects SET status = 'processing', updated_at = NOW() WHERE id = $1",
            [id]
        );
        
        // Get project videos
        const videosResult = await db.query(`
            SELECT pv.*, v.file_path
            FROM project_videos pv
            JOIN videos v ON pv.video_id = v.id
            WHERE pv.project_id = $1
            ORDER BY pv.order_index
        `, [id]);
        
        const videoPaths = videosResult.rows.map(v => v.file_path);
        
        if (videoPaths.length === 0) {
            return res.status(400).json({ success: false, error: 'No videos in project' });
        }
        
        // Create output directory
        const outputDir = path.join(UPLOAD_BASE, 'projects', id);
        fs.mkdirSync(outputDir, { recursive: true });
        
        // Step 1: Merge videos
        let currentPath = path.join(outputDir, 'merged.mp4');
        await ffmpegService.mergeVideos(videoPaths, currentPath);
        
        // Step 2: Add voiceover audio (if available and requested)
        if (includeAudio && project.voiceover_id) {
            const voiceoverResult = await db.query(
                'SELECT audio_file_path FROM voiceovers WHERE id = $1',
                [project.voiceover_id]
            );
            
            if (voiceoverResult.rows.length > 0) {
                let audioPath = voiceoverResult.rows[0].audio_file_path;
                // Convert to absolute path if needed
                if (!path.isAbsolute(audioPath)) {
                    audioPath = path.join(UPLOAD_BASE, audioPath);
                }
                
                const audioOutput = path.join(outputDir, 'with_audio.mp4');
                await ffmpegService.addAudioToVideo(currentPath, audioPath, audioOutput, { quality });
                currentPath = audioOutput;
            }
        }
        
        // Step 3: Apply quality settings and format conversion
        const finalOutput = path.join(outputDir, `final_${quality}.${format}`);
        await ffmpegService.applyQuality(currentPath, finalOutput, { quality, format });
        
        // Update project with output path
        await db.query(`
            UPDATE projects 
            SET status = 'completed', 
                output_file_path = $1,
                updated_at = NOW()
            WHERE id = $2
        `, [finalOutput, id]);
        
        res.json({
            success: true,
            data: {
                status: 'completed',
                outputPath: finalOutput,
                quality,
                format
            }
        });
    } catch (error) {
        console.error('Process error:', error);
        await db.query(
            "UPDATE projects SET status = 'draft' WHERE id = $1",
            [req.params.id]
        );
        res.status(500).json({ success: false, error: error.message });
    }
});

// Preview video
router.get('/:id/preview', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'SELECT output_file_path FROM projects WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0 || !result.rows[0].output_file_path) {
            return res.status(404).json({ success: false, error: 'Video not found' });
        }
        
        let videoPath = result.rows[0].output_file_path;
        
        // Convert to absolute path if needed
        if (!path.isAbsolute(videoPath)) {
            videoPath = path.join(UPLOAD_BASE, videoPath);
        }
        
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ success: false, error: 'Video file not found' });
        }
        
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;
        
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
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
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
