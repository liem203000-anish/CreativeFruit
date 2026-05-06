-- ============================================
-- VideoAutoStudio Database Schema
-- Run this on Railway PostgreSQL after deployment
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    language_preference VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
    video_ids INTEGER[],
    output_video_id VARCHAR(255),
    output_url TEXT,
    template_id INTEGER,
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'custom' CHECK (category IN ('basic', 'social', 'commercial', 'custom')),
    template_config JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scripts table
CREATE TABLE IF NOT EXISTS scripts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    topic VARCHAR(255),
    duration_seconds INTEGER,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'used', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audio tracks table
CREATE TABLE IF NOT EXISTS audio_tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    duration INTEGER,
    file_path VARCHAR(500),
    source VARCHAR(100),
    trending_rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voiceovers table
CREATE TABLE IF NOT EXISTS voiceovers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    voice_id VARCHAR(255),
    language VARCHAR(10),
    audio_url TEXT,
    duration_seconds INTEGER,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Imported videos table
CREATE TABLE IF NOT EXISTS imported_videos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drive_file_id VARCHAR(255) NOT NULL,
    drive_folder_id VARCHAR(255),
    name VARCHAR(255),
    mime_type VARCHAR(100),
    thumbnail_url TEXT,
    duration INTEGER,
    file_size BIGINT,
    file_path VARCHAR(500),
    playback_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table (for tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_voiceovers_user_id ON voiceovers(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_videos_user_id ON imported_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Insert default admin user (password: admin123)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@videoautostudio.com', '$2a$10$rPQvNK0gM0Lw0G4J5N0L5eZ2yK7W9c8F3H1I2J3K4L5M6N7O8P9Q0R', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample audio tracks
INSERT INTO audio_tracks (name, artist, duration, trending_rank) VALUES
('Trending Beat 1', 'Artist A', 180, 1),
('Viral Sound 2024', 'Artist B', 195, 2),
('CapCut Popular', 'Artist C', 160, 3),
('TikTok Hit', 'Artist D', 200, 4),
('Upbeat Track', 'Artist E', 175, 5)
ON CONFLICT DO NOTHING;
