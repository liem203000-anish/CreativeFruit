const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Get all templates
router.get('/', authenticate, async (req, res) => {
    try {
        const { category } = req.query;
        
        let query = 'SELECT * FROM templates WHERE user_id = $1 OR user_id IS NULL';
        let params = [req.user.id];
        
        if (category) {
            query += ' AND category = $2';
            params.push(category);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get template by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'SELECT * FROM templates WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Template not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new template
router.post('/', authenticate, requireRole(['admin', 'creator']), async (req, res) => {
    try {
        const { name, description, category, template_config } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, error: 'Template name required' });
        }
        
        const result = await db.query(`
            INSERT INTO templates (user_id, name, description, category, template_config)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [req.user.id, name, description, category, template_config || null]);
        
        res.status(201).json({ success: true, data: { id: result.rows[0].id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete template
router.delete('/:id', authenticate, requireRole(['admin', 'creator']), async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'DELETE FROM templates WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Template not found' });
        }
        
        res.json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
