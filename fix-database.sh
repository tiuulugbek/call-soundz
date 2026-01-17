#!/bin/bash

# Database Fix Script

set -e

echo "=========================================="
echo "Database Setup & Fix"
echo "=========================================="
echo ""

# Database credentials
DB_NAME="soundzcalldb"
DB_USER="soundzuz_user"
DB_PASSWORD="Soundz&2026"

echo "1. Checking PostgreSQL service..."
sudo systemctl status postgresql --no-pager | head -3 || echo "⚠ PostgreSQL service check failed"

echo ""
echo "2. Creating database and user..."

sudo -u postgres psql << EOF
-- Drop if exists and recreate
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create user with password
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

\q
EOF

echo ""
echo "✓ Database and user created successfully"

echo ""
echo "3. Testing connection..."
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" || {
    echo "✗ Connection test failed"
    exit 1
}

echo ""
echo "✓ Connection test successful"

echo ""
echo "4. Running migrations..."
cd /root/pbx-system
npm run migrate

echo ""
echo "5. Creating admin user..."
npm run create-admin -- admin admin123 admin@call.soundz.uz

echo ""
echo "=========================================="
echo "✓ Database setup completed!"
echo "=========================================="
