const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'videoautostudio_user',
    password: 'videoautostudio_pass_2024',
    database: 'videoautostudio'
});

async function seedData() {
    try {
        console.log('Seeding audio tracks...');
        await pool.query(`
            INSERT INTO audio_tracks (name, artist, duration, trending_rank) VALUES
            ('Trending Beat 1', 'Artist A', 180, 1),
            ('Viral Sound 2024', 'Artist B', 195, 2),
            ('CapCut Popular', 'Artist C', 160, 3),
            ('TikTok Hit', 'Artist D', 200, 4),
            ('Upbeat Track', 'Artist E', 175, 5)
            ON CONFLICT DO NOTHING;
        `);

        console.log('Seeding templates...');
        await pool.query(`
            INSERT INTO templates (user_id, name, description, category, template_config) 
            SELECT 
                id as user_id,
                'Basic Edit' as name,
                'Simple video editing template' as description,
                'basic' as category,
                '{"transitions": "fade", "effects": ["blur"]}'::jsonb as template_config
            FROM users WHERE username = 'admin'
            ON CONFLICT DO NOTHING;
        `);

        console.log('Seed data inserted successfully!');
        
        const audioCount = await pool.query('SELECT COUNT(*) FROM audio_tracks');
        const templateCount = await pool.query('SELECT COUNT(*) FROM templates');
        
        console.log(`Audio tracks: ${audioCount.rows[0].count}`);
        console.log(`Templates: ${templateCount.rows[0].count}`);
        
        await pool.end();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
