const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate, requireRole, JWT_SECRET } = require('../middleware/auth');
const db = require('../config/database');
const GoogleDriveService = require('../services/googleDrive');
const ffmpegService = require('../services/ffmpeg');
const fs = require('fs');
const path = require('path');

const driveService = new GoogleDriveService();

// Define base upload directory
const UPLOAD_BASE = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Get Google OAuth URL
router.get('/drive/auth-url', authenticate, async (req, res) => {
    try {
        const authUrl = driveService.getAuthUrl();
        res.json({ success: true, data: { authUrl } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Handle OAuth callback
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.status(400).json({ success: false, error: 'Authorization code missing' });
        }
        
        // Exchange code for tokens
        const tokens = await driveService.exchangeCode(code);
        
        // TODO: In production, you'd need to get user ID from session
        // For now, return tokens to frontend to store
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/drive-videos?tokens=${encodeURIComponent(JSON.stringify(tokens))}`);
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

  // Save Drive connection tokens
  router.post('/drive/save-tokens', authenticate, async (req, res) => {
      try {
          const { access_token, refresh_token, expires_in } = req.body;
          
          if (!access_token) {
              return res.status(400).json({ success: false, error: 'Access token required' });
          }
          
          // Calculate expires_at - use expiry_date from Google if available
          const expiresAt = new Date();
          if (expires_in) {
            // Google returns expires_in in seconds, convert to milliseconds
            expiresAt.setTime(expiresAt.getTime() + (expires_in * 1000));
          } else {
            // Default 1 hour if no expiry info
            expiresAt.setTime(expiresAt.getTime() + (3600 * 1000));
          }
          
          // Upsert drive connection
          await db.query(
              `INSERT INTO drive_connections (user_id, access_token, refresh_token, expires_at)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (user_id) 
               DO UPDATE SET access_token = $2, refresh_token = $3, expires_at = $4`,
              [req.user.id, access_token, refresh_token, expiresAt]
          );
          
          res.json({ success: true, message: 'Drive connection saved' });
      } catch (error) {
          console.error('Save tokens error:', error);
          res.status(500).json({ success: false, error: error.message });
      }
  });

  // Disconnect Drive connection
  router.delete('/drive/disconnect', authenticate, async (req, res) => {
      try {
          await db.query(
              'DELETE FROM drive_connections WHERE user_id = $1',
              [req.user.id]
          );
          res.json({ success: true, message: 'Drive disconnected' });
      } catch (error) {
          console.error('Disconnect error:', error);
          res.status(500).json({ success: false, error: error.message });
      }
  });

  // Check Drive connection status
  router.get('/drive/status', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM drive_connections WHERE user_id = $1',
            [req.user.id]
        );
        
        res.json({
            success: true,
            data: {
                connected: result.rows.length > 0,
                email: result.rows[0]?.email || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

  // List Drive folders
  router.get('/drive/folders', authenticate, async (req, res) => {
      try {
          const { parentId } = req.query;
          
          // Get tokens from DB for user
          const tokenResult = await db.query(
              'SELECT access_token, refresh_token, expires_at FROM drive_connections WHERE user_id = $1',
              [req.user.id]
          );
          
          if (tokenResult.rows.length === 0) {
              return res.status(401).json({ success: false, error: 'Google Drive not connected' });
          }
          
          let accessToken = tokenResult.rows[0].access_token;
          const refreshToken = tokenResult.rows[0].refresh_token;
          const expiresAt = new Date(tokenResult.rows[0].expires_at);
          
          // Check if token expired, if so refresh it
          if (expiresAt <= new Date() && refreshToken) {
              try {
                  // Set refresh token và refresh access token
                  driveService.oauth2Client.setCredentials({ refresh_token: refreshToken });
                  const { tokens } = await driveService.oauth2Client.refreshAccessToken();
                  accessToken = tokens.access_token;
                  // Update new tokens in DB
                  const newExpiresAt = new Date();
                  newExpiresAt.setTime(newExpiresAt.getTime() + (tokens.expiry_date || 3600 * 1000));
                  await db.query(
                      'UPDATE drive_connections SET access_token = $1, expires_at = $2 WHERE user_id = $3',
                      [accessToken, newExpiresAt, req.user.id]
                  );
              } catch (refreshError) {
                  console.error('Token refresh error:', refreshError);
                  return res.status(401).json({ success: false, error: 'Token expired, please reconnect Google Drive' });
              }
          }
          
          const folders = await driveService.listFolders(accessToken, parentId);
          
          res.json({ success: true, data: folders });
      } catch (error) {
          res.status(500).json({ success: false, error: error.message });
      }
  });

  // List videos in folder (support both GET and POST)
  const listVideosHandler = async (req, res) => {
    try {
        const folderId = req.method === 'POST' ? req.body.folderId : req.query.folderId;
        
        // Get tokens from DB
        const tokenResult = await db.query(
            'SELECT access_token, refresh_token, expires_at FROM drive_connections WHERE user_id = $1',
            [req.user.id]
        );
        
        if (tokenResult.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Google Drive not connected' });
        }
        
        let accessToken = tokenResult.rows[0].access_token;
        const refreshToken = tokenResult.rows[0].refresh_token;
        const expiresAt = new Date(tokenResult.rows[0].expires_at);
        
        // Refresh token if expired
        if (expiresAt <= new Date() && refreshToken) {
            try {
                driveService.oauth2Client.setCredentials({ refresh_token: refreshToken });
                const { tokens } = await driveService.oauth2Client.refreshAccessToken();
                accessToken = tokens.access_token;
                const newExpiresAt = new Date();
                newExpiresAt.setTime(newExpiresAt.getTime() + (tokens.expiry_date || 3600 * 1000));
                await db.query(
                    'UPDATE drive_connections SET access_token = $1, expires_at = $2 WHERE user_id = $3',
                    [accessToken, newExpiresAt, req.user.id]
                );
            } catch (refreshError) {
                return res.status(401).json({ success: false, error: 'Token expired, please reconnect Google Drive' });
            }
        }
        
        const videos = await driveService.listVideos(accessToken, folderId);
        
        res.json({ success: true, data: videos });
    } catch (error) {
        console.error('List videos error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
  };

  router.get('/drive/files', authenticate, listVideosHandler);
  router.post('/drive/files', authenticate, listVideosHandler);

// Import video from Drive
router.post('/import', authenticate, async (req, res) => {
    try {
        const { fileId, folderId } = req.body;
        
        if (!fileId) {
            return res.status(400).json({ success: false, error: 'File ID required' });
        }
        
        const tokenResult = await db.query(
            'SELECT access_token FROM drive_connections WHERE user_id = $1',
            [req.user.id]
        );
        
        if (tokenResult.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Google Drive not connected' });
        }
        
        const accessToken = tokenResult.rows[0].access_token;
        
        // Get file metadata
        const metadata = await driveService.getFileMetadata(accessToken, fileId);
        
        // Generate local filename
        const { v4: uuidv4 } = require('uuid');
        const localFilename = `${uuidv4()}_${metadata.name}`;
        const outputPath = path.join(UPLOAD_BASE, 'videos', localFilename);
        
        // Ensure directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        
        // Download file
        await driveService.downloadFile(accessToken, fileId, outputPath);
        
        // Save to database
        const result = await db.query(`
            INSERT INTO videos (user_id, drive_file_id, drive_folder_id, name, file_path, duration, file_size)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [req.user.id, fileId, folderId, metadata.name, outputPath, metadata.duration, metadata.size]);
        
        res.json({
            success: true,
            data: {
                id: result.rows[0].id,
                name: metadata.name,
                file_path: outputPath,
                duration: metadata.duration,
                file_size: metadata.size
            }
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// List imported videos
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM videos WHERE user_id = $1 ORDER BY imported_at DESC',
            [req.user.id]
        );
        
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get video thumbnail
router.get('/:id/thumbnail', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { time = 1 } = req.query; // Timestamp in seconds
        
        // Get video info
        const videoResult = await db.query(
            'SELECT file_path FROM videos WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (videoResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Video not found' });
        }
        
        const videoPath = videoResult.rows[0].file_path;
        
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ success: false, error: 'Video file not found' });
        }
        
        // Generate thumbnail
        const thumbnailDir = path.join(UPLOAD_BASE, 'thumbnails');
        fs.mkdirSync(thumbnailDir, { recursive: true });
        
        const thumbnailPath = path.join(thumbnailDir, `${id}_${time}s.jpg`);
        
        // Check if thumbnail already exists
        if (!fs.existsSync(thumbnailPath)) {
            const timeNum = parseInt(time) || 1;
            const timeStr = `00:00:${timeNum.toString().padStart(2, '0')}`;
            await ffmpegService.generateThumbnail(videoPath, thumbnailPath, timeStr);
        }
        
        res.sendFile(thumbnailPath);
    } catch (error) {
        console.error('Thumbnail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete imported video
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get file path first
        const videoResult = await db.query(
            'SELECT file_path FROM videos WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (videoResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Video not found' });
        }
        
        // Delete file from disk
        const filePath = videoResult.rows[0].file_path;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Delete thumbnail if exists
        const thumbnailDir = path.join(UPLOAD_BASE, 'thumbnails');
        const thumbnailPath = path.join(thumbnailDir, `${id}_1s.jpg`);
        if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
        }
        
        // Delete from database
        await db.query('DELETE FROM videos WHERE id = $1', [id]);
        
        res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
