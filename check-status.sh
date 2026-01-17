#!/bin/bash

# PBX System Status Check Script

echo "=========================================="
echo "PBX System - Status Check"
echo "=========================================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✓ .env file exists"
    PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
    echo "  Port: $PORT"
else
    echo "✗ .env file not found"
fi

echo ""

# Check database connection
echo "Checking database connection..."
node -e "
const pool = require('./backend/src/database/connection');
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log('✗ Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✓ Database connected successfully');
        process.exit(0);
    }
});
" 2>&1

echo ""

# Check if tables exist
echo "Checking database tables..."
export PGPASSWORD='Soundz&2026'
TABLES=$(psql -h localhost -U soundzuz_user -d soundzcalldb -t -c "\dt" 2>/dev/null | wc -l)
if [ "$TABLES" -gt 0 ]; then
    echo "✓ Database tables exist ($TABLES tables)"
else
    echo "✗ Database tables not found (run: npm run migrate)"
fi
unset PGPASSWORD

echo ""

# Check if admin user exists
echo "Checking admin user..."
export PGPASSWORD='Soundz&2026'
ADMIN_EXISTS=$(psql -h localhost -U soundzuz_user -d soundzcalldb -t -c "SELECT COUNT(*) FROM users WHERE username='admin';" 2>/dev/null | tr -d ' ')
if [ "$ADMIN_EXISTS" = "1" ]; then
    echo "✓ Admin user exists"
else
    echo "✗ Admin user not found (run: npm run create-admin)"
fi
unset PGPASSWORD

echo ""

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✓ Dependencies installed"
else
    echo "✗ Dependencies not installed (run: npm install --production)"
fi

echo ""

# Check if PM2 is running
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 list 2>/dev/null | grep pbx-system | awk '{print $10}')
    if [ "$PM2_STATUS" = "online" ] || [ "$PM2_STATUS" = "errored" ]; then
        echo "✓ PM2: pbx-system is $PM2_STATUS"
        PM2_ID=$(pm2 list 2>/dev/null | grep pbx-system | awk '{print $2}')
        echo "  Process ID: $PM2_ID"
    else
        echo "⚠ PM2: pbx-system is not running (run: pm2 start ecosystem.config.js)"
    fi
else
    echo "⚠ PM2 not installed"
fi

echo ""

# Check port
if command -v netstat &> /dev/null; then
    PORT_CHECK=$(netstat -tlnp 2>/dev/null | grep ":3005" || echo "")
    if [ -n "$PORT_CHECK" ]; then
        echo "✓ Port 3005 is in use"
        echo "  $PORT_CHECK"
    else
        echo "⚠ Port 3005 is not in use (application may not be running)"
    fi
fi

echo ""
echo "=========================================="
