const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const aiService = require('../services/ai');

// Generate AI script
router.post('/generate', authenticate, async (req, res) => {
    try {
        const { 
            templateId, 
            variables, 
            language = 'en', 
            tone = 'professional'
        } = req.body;
        
        if (!variables || !variables.title) {
            return res.status(400).json({ success: false, error: 'Title is required in variables' });
        }
        
        // Fetch template if provided
        let template = null;
        if (templateId) {
            const result = await db.query(
                'SELECT * FROM templates WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)',
                [templateId, req.user.id]
            );
            if (result.rows.length > 0) {
                template = result.rows[0];
            }
        }
        
        // Generate script
        const scriptResult = await aiService.generateFromTemplate(
            template, 
            { ...variables, tone, language }, 
            language
        );
        
        if (!scriptResult.success) {
            return res.status(500).json({ success: false, error: 'Failed to generate script' });
        }
        
        // Save to database
        const saveResult = await db.query(`
            INSERT INTO scripts (user_id, project_id, title, content, language, tone, generated_by_ai, variables)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `, [
            req.user.id,
            variables?.projectId || null,
            variables?.title || 'Generated Script',
            scriptResult.content,
            language,
            tone,
            true,
            variables ? JSON.stringify(variables) : null
        ]);
        
        // Update project if projectId provided
        if (variables?.projectId) {
            await db.query(
                'UPDATE projects SET script_id = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
                [saveResult.rows[0].id, variables.projectId, req.user.id]
            );
        }
        
        res.json({
            success: true,
            data: {
                id: saveResult.rows[0].id,
                content: scriptResult.content,
                usage: scriptResult.usage
            }
        });
    } catch (error) {
        console.error('Script generation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all scripts
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM scripts WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get script by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'SELECT * FROM scripts WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Script not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update script
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, title } = req.body;
        
        const result = await db.query(`
            UPDATE scripts 
            SET content = COALESCE($1, content),
                title = COALESCE($2, title),
                updated_at = NOW()
            WHERE id = $3 AND user_id = $4
            RETURNING *
        `, [content, title, id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Script not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete script
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'DELETE FROM scripts WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Script not found' });
        }
        
        res.json({ success: true, message: 'Script deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
