// Test database connection
require('dotenv').config({ path: __dirname + '/.env' });

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'soundzcalldb',
  user: process.env.DB_USER || 'soundzuz_user',
  password: process.env.DB_PASSWORD || 'Soundz&2026',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

console.log('Testing database connection...');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Port:', process.env.DB_PORT || 5432);
console.log('Database:', process.env.DB_NAME || 'soundzcalldb');
console.log('User:', process.env.DB_USER || 'soundzuz_user');
console.log('Password:', process.env.DB_PASSWORD ? '***' : 'not set');
console.log('');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('✗ Connection failed:', err.message);
    console.error('Error code:', err.code);
    process.exit(1);
  } else {
    console.log('✓ Connection successful!');
    console.log('Server time:', res.rows[0].now);
    pool.end();
    process.exit(0);
  }
});
