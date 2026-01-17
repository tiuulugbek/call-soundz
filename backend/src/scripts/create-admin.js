const bcrypt = require('bcrypt');
const pool = require('../database/connection');
const logger = require('../utils/logger');

async function createAdmin() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  const email = process.argv[4] || 'admin@call.soundz.uz';

  try {
    console.log('\n==========================================');
    console.log('Creating Admin User');
    console.log('==========================================\n');
    
    // Check if admin already exists
    const checkQuery = 'SELECT * FROM users WHERE username = $1';
    const checkResult = await pool.query(checkQuery, [username]);

    if (checkResult.rows.length > 0) {
      console.log(`User '${username}' already exists. Updating password...`);
      logger.info(`User ${username} already exists. Updating password...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      const updateQuery = 'UPDATE users SET password = $1, email = $2 WHERE username = $3';
      await pool.query(updateQuery, [hashedPassword, email, username]);
      console.log(`✓ Password updated for user '${username}'`);
      logger.info(`Password updated for user ${username}`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = `
        INSERT INTO users (username, password, email, role, enabled)
        VALUES ($1, $2, $3, 'admin', TRUE)
      `;
      await pool.query(insertQuery, [username, hashedPassword, email]);
      console.log(`✓ Admin user '${username}' created successfully`);
      logger.info(`Admin user ${username} created successfully`);
    }

    console.log('\nAdmin Credentials:');
    console.log('  Username:', username);
    console.log('  Password:', password);
    console.log('  Email:', email);
    console.log('\n==========================================\n');
    
    logger.info(`Username: ${username}`);
    logger.info(`Password: ${password}`);
    logger.info(`Email: ${email}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error creating admin user:', error.message);
    logger.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
