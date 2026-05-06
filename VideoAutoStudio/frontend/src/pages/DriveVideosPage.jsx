import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { videosAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const DriveVideosPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [importedVideos, setImportedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [driveConnected, setDriveConnected] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokensStr = params.get('tokens');
    
    if (tokensStr) {
      try {
        const tokens = JSON.parse(decodeURIComponent(tokensStr));
        localStorage.setItem('googleTokens', JSON.stringify(tokens));
        
        videosAPI.saveDriveTokens({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in
        }).then(() => {
          console.log('Tokens saved to database');
        }).catch(err => {
          console.error('Failed to save tokens:', err);
        });
        
        window.history.replaceState({}, document.title, window.location.pathname);
        setDriveConnected(true);
        loadFolders();
      } catch (err) {
        console.error('Failed to parse tokens:', err);
      }
    }
    
    checkDriveConnection();
    loadImportedVideos();
  }, []);

  const checkDriveConnection = () => {
    const tokensStr = localStorage.getItem('googleTokens');
    if (!tokensStr) {
      setDriveConnected(false);
      return;
    }
    try {
      const tokens = JSON.parse(tokensStr);
      if (tokens.access_token) {
        setDriveConnected(true);
      } else {
        setDriveConnected(false);
      }
    } catch (err) {
      setDriveConnected(false);
    }
  };

  const loadImportedVideos = async () => {
    try {
      const res = await videosAPI.listImported();
      setImportedVideos(res.data.data || []);
    } catch (err) {
      console.error('Failed to load imported videos:', err);
    }
  };

  const handleConnectDrive = async () => {
    try {
      setLoading(true);
      const res = await videosAPI.getDriveAuthUrl();
      window.location.href = res.data.data.authUrl;
    } catch (err) {
      setError('Failed to connect Google Drive');
      toast.error('Failed to connect Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await videosAPI.disconnectDrive();
      localStorage.removeItem('googleTokens');
      setDriveConnected(false);
      setFolders([]);
      setVideos([]);
      toast.success('Google Drive disconnected!');
    } catch (err) {
      setError('Failed to disconnect');
      toast.error('Failed to disconnect');
    }
  };

  const loadFolders = async (parentId = null) => {
    try {
      setLoading(true);
      const tokensStr = localStorage.getItem('googleTokens');
      if (!tokensStr) {
        setError('Google Drive not connected');
        return;
      }
      const res = await videosAPI.getFolders(parentId);
      setFolders(res.data.data || []);
      setCurrentFolder(parentId);
    } catch (err) {
      setError('Failed to load folders');
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (folderId) => {
    try {
      setLoading(true);
      const res = await videosAPI.getVideos(folderId);
      setVideos(res.data.data || []);
    } catch (err) {
      setError('Failed to load videos');
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderId) => {
    loadVideos(folderId);
  };

  const handleImportVideo = async (fileId, folderId) => {
    try {
      setLoading(true);
      await videosAPI.importVideo(fileId, folderId);
      await loadImportedVideos();
      toast.success('Video imported successfully!');
    } catch (err) {
      setError('Failed to import video');
      toast.error('Failed to import video');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm(t('common.confirm'))) return;
    
    try {
      await videosAPI.delete(videoId);
      await loadImportedVideos();
      toast.success('Video deleted');
    } catch (err) {
      setError('Failed to delete video');
      toast.error('Failed to delete video');
    }
  };

  return (
    <div className="animate-fade-in p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-h1 text-heading-1 text-on-surface">{t('sidebar.driveVideos')}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Import and manage videos from Google Drive</p>
      </div>
      
      {error && (
        <div className="glass border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Drive Connection Status */}
      <div className="glass glass-hover rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-h3 text-heading-3 text-on-surface mb-1">Google Drive Status</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {driveConnected ? '✅ Connected' : '❌ Not connected'}
            </p>
          </div>
          {!driveConnected ? (
            <button 
              onClick={handleConnectDrive}
              className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-primary flex items-center gap-2"
              disabled={loading}
            >
              <span className="material-symbols-outlined">folder_open</span>
              {loading ? t('common.loading') : 'Connect Google Drive'}
            </button>
          ) : (
            <button 
              onClick={handleDisconnect}
              className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-red-400 flex items-center gap-2 hover:bg-red-500/10"
            >
              <span className="material-symbols-outlined">link_off</span>
              Disconnect Drive
            </button>
          )}
        </div>
      </div>

      {/* Folder Browser (if connected) */}
      {driveConnected && (
        <div className="glass rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-h3 text-heading-3 text-on-surface">Browse Drive</h3>
            <button 
              onClick={() => loadFolders()} 
              className="glass glass-hover px-4 py-2 rounded-lg font-bold text-primary text-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
          </div>

          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <h4 className="font-h4 text-heading-4 text-on-surface-variant mb-3">Folders</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {folders.map(folder => (
                  <div 
                    key={folder.id}
                    onClick={() => handleFolderClick(folder.id)}
                    className="glass glass-hover p-4 rounded-lg cursor-pointer flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-primary">folder</span>
                    <span className="font-medium text-on-surface">{folder.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <h4 className="font-h4 text-heading-4 text-on-surface-variant mb-3">Videos in this folder</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map(video => (
                  <div key={video.id} className="glass glass-hover p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-primary">movie</span>
                      <span className="font-medium text-on-surface flex-1">{video.name}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-3">
                      Size: {(video.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button 
                      onClick={() => handleImportVideo(video.id, currentFolder)}
                      className="w-full glass glass-hover py-2 rounded-lg font-bold text-primary text-sm flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Import
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && <p className="text-on-surface-variant">{t('common.loading')}</p>}
        </div>
      )}

               {/* Imported Videos */}
       <div className="glass rounded-xl p-6">
         <h3 className="font-h3 text-heading-3 text-on-surface mb-4">Imported Videos</h3>
         {importedVideos.length === 0 ? (
           <div className="text-center py-12">
             <span className="material-symbols-outlined text-6xl text-on-surface-variant/50 mb-4 block">movie</span>
             <p className="text-on-surface-variant">{t('common.noData')}</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {importedVideos.map(video => (
               <div key={video.id} className="glass glass-hover rounded-xl overflow-hidden group transition-all duration-300 hover:translate-y-[-4px]">
                 {/* Video Thumbnail */}
                 <div className="relative h-40 bg-surface-container-highest overflow-hidden">
                   <img 
                     src={`/api/videos/${video.id}/thumbnail?token=${localStorage.getItem('token')}`}
                     alt={video.name}
                     className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                     onError={(e) => {
                       e.target.style.display = 'none';
                       e.target.nextSibling.style.display = 'flex';
                     }}
                   />
                   <div className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container">
                     <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">movie</span>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                     <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
                   </div>
                   {/* Duration Badge */}
                   {video.duration && (
                     <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                       {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                     </div>
                   )}
                 </div>
                 
                 {/* Video Info */}
                 <div className="p-4">
                   <h4 className="font-medium text-on-surface mb-2 truncate">{video.name}</h4>
                   <p className="text-xs text-on-surface-variant mb-3">
                     {video.file_size ? `${(video.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                   </p>
                   <button 
                     onClick={() => handleDeleteVideo(video.id)}
                     className="w-full glass glass-hover py-2 rounded-lg font-bold text-on-surface-variant text-sm flex items-center justify-center gap-1 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                   >
                     <span className="material-symbols-outlined text-sm">delete</span>
                     Delete
                   </button>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
    </div>
  );
};

export default DriveVideosPage;
