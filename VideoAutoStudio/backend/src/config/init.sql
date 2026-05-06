-- VideoAutoStudio Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'creator',
    language_preference VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Google Drive connections
CREATE TABLE IF NOT EXISTS drive_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Imported videos (from Google Drive)
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    drive_file_id VARCHAR(100),
    drive_folder_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    duration INTEGER,
    resolution VARCHAR(20),
    file_size BIGINT,
    thumbnail_url VARCHAR(500),
    imported_at TIMESTAMP DEFAULT NOW()
);

-- Audio tracks (TikTok trending)
CREATE TABLE IF NOT EXISTS audio_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    tiktok_sound_id VARCHAR(100),
    duration INTEGER,
    file_path VARCHAR(500),
    trending_rank INTEGER,
    imported_at TIMESTAMP DEFAULT NOW()
);

-- CapCut templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capcut_template_id VARCHAR(100),
    template_config JSONB,
    preview_url VARCHAR(500),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Projects (main entity)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id UUID REFERENCES templates(id),
    script_id UUID,
    voiceover_id UUID,
    status VARCHAR(20) DEFAULT 'draft',
    output_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project videos (many-to-many: projects <-> videos)
CREATE TABLE IF NOT EXISTS project_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    trim_start INTEGER DEFAULT 0,
    trim_end INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Scripts
CREATE TABLE IF NOT EXISTS scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    title VARCHAR(255),
    content TEXT NOT NULL,
    language VARCHAR(5) DEFAULT 'en',
    tone VARCHAR(50),
    generated_by_ai BOOLEAN DEFAULT FALSE,
    variables JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Voiceovers (ElevenLabs generated)
CREATE TABLE IF NOT EXISTS voiceovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    script_id UUID REFERENCES scripts(id),
    voice_id VARCHAR(100),
    voice_name VARCHAR(100),
    language VARCHAR(5) DEFAULT 'en',
    audio_file_path VARCHAR(500),
    duration INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    speed DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_videos_project_id ON project_videos(project_id);
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_voiceovers_user_id ON voiceovers(user_id);

-- Seed admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@videoautostudio.com', '$2a$10$8K1p/a0dL3LzWPVFZ0eOe.eGXzYq5aZQG6Pz1Ql7yG5q5BB5GIe', 'admin')
ON CONFLICT (username) DO NOTHING;
