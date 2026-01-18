const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  console.log('==========================================');
  console.log('Database Setup');
  console.log('==========================================\n');

  // Try common PostgreSQL passwords
  const passwords = [
    process.env.POSTGRES_PASSWORD,
    'postgres',
    'admin',
    'root',
    '', // Try empty password (trust auth)
    process.env.POSTGRES_PASSWORD || 'postgres'
  ].filter(p => p !== undefined);

  let adminClient;
  let connected = false;

  for (const password of passwords) {
    try {
      console.log(`Parol bilan ulanish sinab ko'rilmoqda...`);
      adminClient = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: 'postgres', // Connect to default postgres database
        user: 'postgres', // Default postgres user
        password: password || undefined
      });
      
      await adminClient.connect();
      connected = true;
      console.log('✓ PostgreSQL ga ulandi!\n');
      break;
    } catch (error) {
      if (password === passwords[passwords.length - 1]) {
        // Last attempt failed
        throw error;
      }
      // Try next password
      continue;
    }
  }

  if (!connected) {
    throw new Error('PostgreSQL ga ulana olmadi');
  }

  try {
    // Create database
    console.log('Database yaratilmoqda: soundzcalldb');
    try {
      await adminClient.query('CREATE DATABASE soundzcalldb');
      console.log('✓ Database yaratildi!\n');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('⚠ Database allaqachon mavjud\n');
      } else {
        throw error;
      }
    }

    // Create user
    console.log('User yaratilmoqda: soundzuz_user');
    try {
      await adminClient.query(`
        CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026'
      `);
      console.log('✓ User yaratildi!\n');
    } catch (error) {
      if (error.code === '42710') {
        console.log('⚠ User allaqachon mavjud\n');
      } else {
        throw error;
      }
    }

    // Grant privileges
    console.log('Privileges berilmoqda...');
    await adminClient.query('GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user');
    console.log('✓ Privileges berildi!\n');

    // Close admin connection
    await adminClient.end();

    // Connect to our new database to grant schema privileges
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: 'soundzcalldb',
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'Bismillah'
    });

    await dbClient.connect();
    await dbClient.query('GRANT ALL ON SCHEMA public TO soundzuz_user');
    await dbClient.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO soundzuz_user');
    await dbClient.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO soundzuz_user');
    await dbClient.end();

    console.log('==========================================');
    console.log('✓ Database setup muvaffaqiyatli yakunlandi!');
    console.log('==========================================\n');
    console.log('Database: soundzcalldb');
    console.log('User: soundzuz_user');
    console.log('Password: Soundz&2026\n');
    console.log('Keyingi qadam: npm run migrate');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Xatolik:', error.message);
    
    if (error.code === '28P01') {
      console.error('\nPostgreSQL parol noto\'g\'ri!');
      console.error('PostgreSQL postgres user uchun parolni kiriting:');
      console.error('  POSTGRES_PASSWORD=your_password node setup-database.js');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nPostgreSQL servis ishlamayapti!');
      console.error('PostgreSQL servisni ishga tushiring:');
      console.error('  Start Menu → PostgreSQL → pgAdmin 4');
      console.error('  Yoki: Get-Service postgresql* | Start-Service');
    } else {
      console.error('\nXatolik tafsilotlari:', error);
    }
    
    process.exit(1);
  }
}

setupDatabase();
