const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'videoautostudio_user',
    password: 'videoautostudio_pass_2024',
    database: 'videoautostudio'
});

async function resetAdmin() {
    try {
        const password_hash = await bcrypt.hash('admin123', 10);
        
        const result = await pool.query(
            `UPDATE users 
             SET password_hash = $1 
             WHERE email = 'admin@videoautostudio.com' 
             RETURNING id, username, email, role`,
            [password_hash]
        );
        
        if (result.rows.length > 0) {
            console.log('Admin password reset successfully:', result.rows[0]);
        } else {
            console.log('Admin user not found, creating...');
            const insertResult = await pool.query(
                `INSERT INTO users (username, email, password_hash, role) 
                 VALUES ('admin', 'admin@videoautostudio.com', $1, 'admin') 
                 RETURNING id, username, email, role`,
                [password_hash]
            );
            console.log('Admin user created:', insertResult.rows[0]);
        }
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetAdmin();
