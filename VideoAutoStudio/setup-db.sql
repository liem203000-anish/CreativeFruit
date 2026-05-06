-- Script tạo database và user cho VideoAutoStudio
-- Chạy với quyền superuser (postgres)

-- Tạo user
CREATE USER videoautostudio_user WITH PASSWORD 'videoautostudio_pass_2024';

-- Tạo database
CREATE DATABASE videoautostudio OWNER videoautostudio_user;

-- Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE videoautostudio TO videoautostudio_user;

-- Kết nối đến database mới và chạy init.sql
\c videoautostudio videoautostudio_user;

-- Chạy schema
\i backend/src/config/init.sql
