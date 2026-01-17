#!/bin/bash

# PBX System Start Script
# Port: 3005

set -e

cd "$(dirname "$0")"

echo "=========================================="
echo "PBX System - Starting..."
echo "Port: 3005"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Check database connection
echo "Checking database connection..."
node -e "
const pool = require('./backend/src/database/connection');
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('Database connected successfully');
        process.exit(0);
    }
});
" || {
    echo "Warning: Database connection check failed"
    echo "Make sure PostgreSQL is running and database is created"
}

# Start with PM2 if available
if command -v pm2 &> /dev/null; then
    echo "Starting with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    echo ""
    echo "Application started with PM2"
    echo "Use 'pm2 status' to check status"
    echo "Use 'pm2 logs pbx-system' to view logs"
else
    echo "PM2 not found. Starting directly..."
    echo "Press Ctrl+C to stop"
    node backend/server.js
fi
