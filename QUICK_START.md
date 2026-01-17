# Quick Start Guide

## Tez O'rnatish

### 1. Loyihani ko'chirish

```bash
cd /var/www
# Loyiha fayllarini /var/www/call.soundz.uz ga ko'chiring
```

### 2. O'rnatish skriptini ishga tushirish

```bash
cd /var/www/call.soundz.uz
chmod +x INSTALL.sh
./INSTALL.sh
```

Yoki qo'lda:

```bash
# Dependencies
npm install --production

# Environment
cp .env.example .env
nano .env  # Sozlamalarni to'ldiring

# Database
sudo -u postgres psql
CREATE DATABASE soundzcalldb;
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\q

# Migrationlar
npm run migrate

# Admin user
npm run create-admin -- admin admin123 admin@call.soundz.uz

# PM2
pm2 start ecosystem.config.js
pm2 save
```

### 3. Nginx konfiguratsiyasi

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/call.soundz.uz
sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Firewall

```bash
sudo ufw allow 5060/udp
sudo ufw allow 10000:20000/udp
```

### 5. Tekshirish

```bash
# Health check
curl http://localhost:3005/health

# PM2 status
pm2 status

# Logs
pm2 logs pbx-system
```

## API Test

```bash
# Login
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Token ni oling va keyingi so'rovlarda ishlating
TOKEN="your-token-here"

# Extensions ro'yxati
curl http://localhost:3005/api/v1/extensions \
  -H "Authorization: Bearer $TOKEN"

# Yangi extension yaratish
curl -X POST http://localhost:3005/api/v1/extensions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "1001",
    "password": "secure123",
    "displayName": "Test User"
  }'
```

## SIP Account Sozlamalari

Extension yaratilgandan keyin:

- **Server**: call.soundz.uz
- **Port**: 5060
- **Transport**: UDP
- **Username**: Extension username (masalan: 1001)
- **Password**: Extension password
- **Domain**: call.soundz.uz

## Muammolarni Hal Qilish

### Database ulanish muammosi

```bash
# PostgreSQL status
sudo systemctl status postgresql

# Connection test
psql -h localhost -U soundzuz_user -d soundzcalldb
```

### Port muammosi

```bash
# Portni tekshirish
sudo netstat -ulnp | grep 5060
sudo netstat -tlnp | grep 3005
```

### Loglarni ko'rish

```bash
# PM2 logs
pm2 logs pbx-system

# Application logs
tail -f /var/www/call.soundz.uz/logs/combined.log
tail -f /var/www/call.soundz.uz/logs/error.log
```
