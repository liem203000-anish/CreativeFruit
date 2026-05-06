const { Pool } = require('pg');
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'videoautostudio_user',
    password: 'videoautostudio_pass_2024',
    database: 'videoautostudio'
});

pool.query('SELECT user_id, expires_at, NOW() as now FROM drive_connections LIMIT 1', (err, res) => {
    if (err) {
        console.log('DB Error:', err.message);
    } else if (res.rows.length === 0) {
        console.log('KHÔNG CÓ TOKEN TRONG DB - Cần kết nối lại từ đầu!');
    } else {
        const expiresAt = new Date(res.rows[0].expires_at);
        const now = new Date(res.rows[0].now);
        console.log('Token expires at:', expiresAt.toISOString());
        console.log('Current time:', now.toISOString());
        console.log('ĐÃ HẾT HẠN?', expiresAt < now);
        
        if (expiresAt < now) {
            console.log('==> TOKEN ĐÃ HẾT HẠN! Cần DISCONNECT và CONNECT LẠI!');
        } else {
            console.log('==> TOKEN VẪN CÒN HẠN - Có thể dùng được!');
        }
    }
    pool.end();
});
