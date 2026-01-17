#!/bin/bash

# Database Setup Script
# Bu skript database va userni yaratadi

set -e

DB_NAME="soundzcalldb"
DB_USER="soundzuz_user"
DB_PASSWORD="Soundz&2026"

echo "=========================================="
echo "Database Setup"
echo "=========================================="
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "This script needs sudo privileges"
   exit 1
fi

echo "1. Creating PostgreSQL user and database..."

sudo -u postgres psql << 'EOF'
-- Drop if exists
DROP DATABASE IF EXISTS soundzcalldb;
DROP USER IF EXISTS soundzuz_user;

-- Create user with password (using single quotes to handle special characters)
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';

-- Create database
CREATE DATABASE soundzcalldb OWNER soundzuz_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
EOF

echo ""
echo "2. Setting up schema privileges..."

sudo -u postgres psql -d soundzcalldb << 'EOF'
-- Grant schema privileges
GRANT ALL ON SCHEMA public TO soundzuz_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO soundzuz_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO soundzuz_user;
EOF

echo ""
echo "✓ Database and user created successfully!"
echo ""
echo "3. Testing connection..."

# Test connection with PGPASSWORD
export PGPASSWORD='Soundz&2026'
psql -h localhost -U soundzuz_user -d soundzcalldb -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Connection test successful!"
else
    echo "✗ Connection test failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Database setup completed!"
echo "Now run: npm run migrate"
echo "=========================================="
