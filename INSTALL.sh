#!/bin/bash

# PBX System Installation Script
# Bu script call.soundz.uz dasturini o'rnatish uchun

set -e

echo "=========================================="
echo "PBX System Installation Script"
echo "call.soundz.uz"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root${NC}"
   exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL not found. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

# Create directories
echo -e "${GREEN}Creating directories...${NC}"
sudo mkdir -p /var/www/call.soundz.uz/{recordings,voicemails,ivr,logs}
sudo chown -R $USER:$USER /var/www/call.soundz.uz

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install --production

# Setup environment
if [ ! -f .env ]; then
    echo -e "${GREEN}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your settings${NC}"
    echo -e "${YELLOW}Press Enter to continue after editing...${NC}"
    read
fi

# Database setup
echo -e "${GREEN}Setting up database...${NC}"
echo "Creating database and user..."
sudo -u postgres psql << EOF
CREATE DATABASE soundzcalldb;
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\q
EOF

# Run migrations
echo -e "${GREEN}Running database migrations...${NC}"
npm run migrate

# Create admin user
echo -e "${GREEN}Creating admin user...${NC}"
echo "Enter admin username (default: admin):"
read ADMIN_USER
ADMIN_USER=${ADMIN_USER:-admin}

echo "Enter admin password (default: admin123):"
read -s ADMIN_PASS
ADMIN_PASS=${ADMIN_PASS:-admin123}

npm run create-admin -- $ADMIN_USER $ADMIN_PASS

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${GREEN}Installing PM2...${NC}"
    sudo npm install -g pm2
fi

# Setup firewall
echo -e "${GREEN}Setting up firewall rules...${NC}"
sudo ufw allow 5060/udp comment 'SIP'
sudo ufw allow 10000:20000/udp comment 'RTP'

# Nginx configuration
echo -e "${GREEN}Setting up Nginx...${NC}"
if [ ! -f /etc/nginx/sites-available/call.soundz.uz ]; then
    sudo cp nginx.conf.example /etc/nginx/sites-available/call.soundz.uz
    sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
fi

# Start with PM2
echo -e "${GREEN}Starting application with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save

echo ""
echo -e "${GREEN}=========================================="
echo "Installation completed!"
echo "=========================================="
echo ""
echo "Admin credentials:"
echo "  Username: $ADMIN_USER"
echo "  Password: $ADMIN_PASS"
echo ""
echo "Access the system at: http://call.soundz.uz"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check status"
echo "  pm2 logs pbx-system - View logs"
echo "  pm2 restart pbx-system - Restart"
echo ""
echo -e "${NC}"
