require('dotenv').config();
const { Pool } = require('pg');

// Railway provides DATABASE_URL, fallback to individual vars
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      })
    : new Pool({
        host: process.env.PG_HOST || 'localhost',
        port: process.env.PG_PORT || 5432,
        user: process.env.PG_USER || 'videoautostudio_user',
        password: process.env.PG_PASSWORD || 'videoautostudio_pass_2024',
        database: process.env.PG_DATABASE || 'videoautostudio',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
