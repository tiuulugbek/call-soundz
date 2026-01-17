const fs = require('fs');
const path = require('path');
const pool = require('../connection');
const logger = require('../../utils/logger');

async function runMigrations() {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files`);
  logger.info(`Found ${files.length} migration files`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Running migration: ${file}`);
    logger.info(`Running migration: ${file}`);
    
    try {
      await pool.query(sql);
      console.log(`✓ Migration ${file} completed successfully`);
      logger.info(`Migration ${file} completed successfully`);
    } catch (error) {
      console.error(`✗ Error running migration ${file}:`, error.message);
      logger.error(`Error running migration ${file}:`, error);
      throw error;
    }
  }

  console.log('\n✓ All migrations completed successfully!');
  logger.info('All migrations completed');
  process.exit(0);
}

runMigrations().catch(error => {
  console.error('\n✗ Migration failed:', error.message);
  logger.error('Migration failed:', error);
  process.exit(1);
});
