const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

// Get dashboard statistics for current user
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get counts in parallel
        const [projectsResult, videosResult, scriptsResult, voiceoversResult] = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM projects WHERE user_id = $1', [userId]),
            db.query('SELECT COUNT(*) as count FROM videos WHERE user_id = $1', [userId]),
            db.query('SELECT COUNT(*) as count FROM scripts WHERE user_id = $1', [userId]),
            db.query('SELECT COUNT(*) as count FROM voiceovers WHERE user_id = $1', [userId])
        ]);

        // Get recent projects
        const recentProjectsResult = await db.query(`
            SELECT id, name, status, created_at
            FROM projects
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 3
        `, [userId]);

        res.json({
            success: true,
            data: {
                counts: {
                    projects: parseInt(projectsResult.rows[0].count),
                    videos: parseInt(videosResult.rows[0].count),
                    scripts: parseInt(scriptsResult.rows[0].count),
                    voiceovers: parseInt(voiceoversResult.rows[0].count)
                },
                recentProjects: recentProjectsResult.rows
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
