# Changelog

## [1.0.1] - 2026-05-04

### Fixed
- Fixed duplicate function declarations in ProjectsPage.jsx (`handleTimelineReorder` and `handleRemoveVideoFromProject` were declared twice)
- Removed unused DnD sensors import that was causing build errors
- Successfully built frontend with `npm run build`

### Added
- Backend API endpoint `GET /api/videos/:id/thumbnail` for generating video thumbnails using FFmpeg
- Backend returns video data with projects API
- Documentation files: README.md, API.md, USER_GUIDE.md, DEPLOYMENT.md

### Changed
- Videos now display actual thumbnails instead of placeholder icons
- DashboardPage, ProjectsPage, and DriveVideosPage updated to show real video thumbnails
- Restored global.css to original Material Design 3 style (per user request)

## [1.0.0] - 2026-05-04

### Initial Release
- Video import from Google Drive
- Project management with drag-and-drop timeline
- Script generation and management
- Voiceover generation with multiple voices
- Video processing and rendering
- Modern UI with Material Design 3 and glassmorphism effects
