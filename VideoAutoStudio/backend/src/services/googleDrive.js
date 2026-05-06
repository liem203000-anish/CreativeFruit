const { google } = require('googleapis');

class GoogleDriveService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback'
        );
    }

    // Get OAuth2 URL for authorization
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/userinfo.email'
        ];
        
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    // Exchange authorization code for tokens
    async exchangeCode(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    // Get authenticated Drive client using access token
    getDriveClient(accessToken) {
        const client = new google.auth.OAuth2();
        client.setCredentials({ access_token: accessToken });
        return google.drive({ version: 'v3', auth: client });
    }

    // List folders in Drive
    async listFolders(accessToken, parentId = null) {
        const drive = this.getDriveClient(accessToken);
        
        let query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }
        
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name, createdTime)',
            orderBy: 'name'
        });
        
        return res.data.files;
    }

    // List video files in a folder
    async listVideos(accessToken, folderId) {
        const drive = this.getDriveClient(accessToken);
        
        let query = "mimeType contains 'video/' and trashed=false";
        if (folderId) {
            query += ` and '${folderId}' in parents`;
        }
        
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name, size, mimeType, thumbnailLink, videoMediaMetadata)',
            orderBy: 'createdTime desc'
        });
        
        return res.data.files.map(file => ({
            id: file.id,
            name: file.name,
            size: parseInt(file.size) || 0,
            mimeType: file.mimeType,
            thumbnailUrl: file.thumbnailLink,
            duration: file.videoMediaMetadata?.durationMillis 
                ? Math.floor(file.videoMediaMetadata.durationMillis / 1000)
                : null
        }));
    }

    // Get file metadata
    async getFileMetadata(accessToken, fileId) {
        const drive = this.getDriveClient(accessToken);
        
        const res = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, size, mimeType, thumbnailLink, videoMediaMetadata'
        });
        
        const file = res.data;
        return {
            id: file.id,
            name: file.name,
            size: parseInt(file.size) || 0,
            mimeType: file.mimeType,
            thumbnailUrl: file.thumbnailLink,
            duration: file.videoMediaMetadata?.durationMillis 
                ? Math.floor(file.videoMediaMetadata.durationMillis / 1000)
                : null
        };
    }

    // Download file from Drive
    async downloadFile(accessToken, fileId, outputPath) {
        const drive = this.getDriveClient(accessToken);
        
        const res = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'stream' });
        
        const fs = require('fs');
        const path = require('path');
        const dest = fs.createWriteStream(outputPath);
        
        return new Promise((resolve, reject) => {
            res.data.pipe(dest);
            dest.on('finish', () => resolve(outputPath));
            dest.on('error', reject);
        });
    }
}

module.exports = GoogleDriveService;
