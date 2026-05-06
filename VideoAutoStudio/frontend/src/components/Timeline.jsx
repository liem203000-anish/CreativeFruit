import React, { useState, useRef } from 'react';

const Timeline = ({ project, onReorder, onRemoveVideo }) => {
  const [dragging, setDragging] = useState(null);
  const timelineRef = useRef(null);
  
  if (!project || !project.videos || project.videos.length === 0) {
    return (
      <div className="text-center py-12 glass rounded-xl">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 block mb-4">video_library</span>
        <p className="text-on-surface-variant">No videos in timeline</p>
      </div>
    );
  }

  const videos = project.videos || [];
  const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
  
  // Calculate start times
  let currentTime = 0;
  const videoBlocks = videos.map((v, index) => {
    const start = currentTime;
    currentTime += (v.duration || 0);
    return {
      ...v,
      start,
      width: totalDuration > 0 ? ((v.duration || 0) / totalDuration) * 100 : 0,
      index
    };
  });

  const handleDragStart = (e, videoId) => {
    setDragging(videoId);
    e.dataTransfer.setData('text/plain', videoId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!dragging) return;
    
    const sourceIndex = videoBlocks.findIndex(v => (v.video_id || v.id) === dragging);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;
    
    const newVideos = [...videoBlocks];
    const [moved] = newVideos.splice(sourceIndex, 1);
    newVideos.splice(targetIndex, 0, moved);
    
    const videoOrders = newVideos.map((v, idx) => ({
      videoId: v.video_id || v.id,
      orderIndex: idx
    }));
    
    if (onReorder) {
      onReorder(videoOrders);
    }
    
    setDragging(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined">timeline</span>
          Timeline
        </h4>
        <span className="text-sm text-on-surface-variant">
          Total: {formatTime(totalDuration)}
        </span>
      </div>

      {/* Time Ruler */}
      <div className="relative h-8 bg-surface-container-highest rounded-lg overflow-hidden">
        {[0, 25, 50, 75, 100].map(percent => (
          <div 
            key={percent}
            className="absolute top-0 bottom-0 border-l border-white/10"
            style={{ left: `${percent}%` }}
          >
            <span className="absolute -top-6 left-1 text-xs text-on-surface-variant">
              {formatTime((percent / 100) * totalDuration)}
            </span>
          </div>
        ))}
      </div>

      {/* Video Track */}
      <div 
        ref={timelineRef}
        className="relative bg-surface-container-highest rounded-xl p-4 min-h-[120px] border border-white/5"
        onDragOver={handleDragOver}
      >
        <div className="text-[10px] text-on-surface-variant/50 mb-2 font-bold uppercase tracking-wider">Video Track</div>
        <div className="relative h-20">
          {videoBlocks.map((block, idx) => (
            <div
              key={block.video_id || block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, block.video_id || block.id)}
              onDrop={(e) => handleDrop(e, idx)}
              className={`absolute top-0 bottom-0 rounded-lg cursor-move transition-all duration-200 hover:shadow-lg group ${
                dragging === (block.video_id || block.id) ? 'opacity-50 scale-95' : ''
              }`}
              style={{
                left: `${block.width > 0 ? (block.start / totalDuration) * 100 : 0}%`,
                width: `${Math.max(block.width, 3)}%`,
                background: `linear-gradient(135deg, #3b82f6, #6366f1)`
              }}
            >
              {/* Thumbnail preview */}
              <div className="absolute inset-0 opacity-20 bg-cover bg-center rounded-lg overflow-hidden">
                <img 
                  src={`/api/videos/${block.video_id || block.id}/thumbnail`}
                  alt={block.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="relative p-2 h-full flex flex-col justify-center">
                <div className="flex items-center gap-1 text-white text-xs font-medium truncate">
                  <span className="material-symbols-outlined text-sm">drag_indicator</span>
                  {block.name}
                </div>
                <div className="text-white/70 text-xs">
                  {formatTime(block.duration || 0)}
                </div>
              </div>
              {/* Remove button */}
              {onRemoveVideo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveVideo(block.video_id || block.id);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from project"
                >
                  <span className="material-symbols-outlined text-xs text-white">close</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audio Track (if voiceover exists) */}
      {project.voiceover_id && (
        <div className="relative bg-surface-container-highest rounded-xl p-4 min-h-[80px] border border-white/5">
          <div className="text-[10px] text-on-surface-variant/50 mb-2 font-bold uppercase tracking-wider">Audio Track</div>
          <div 
            className="absolute top-4 left-4 right-4 bottom-4 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 flex items-center px-4 backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-white mr-2 text-sm">mic</span>
            <span className="text-white text-sm font-medium">Voiceover</span>
            <span className="text-white/70 text-xs ml-auto">
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>
      )}

      {/* Timeline Controls */}
      <div className="flex gap-2">
        <button className="px-4 py-2 glass glass-hover rounded-lg text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm align-middle mr-1">zoom_in</span>
          Zoom In
        </button>
        <button className="px-4 py-2 glass glass-hover rounded-lg text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm align-middle mr-1">zoom_out</span>
          Zoom Out
        </button>
        <button className="px-4 py-2 glass glass-hover rounded-lg text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm align-middle mr-1">fit_screen</span>
          Fit to Screen
        </button>
      </div>
    </div>
  );
};

export default Timeline;
