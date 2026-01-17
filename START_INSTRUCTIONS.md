# PBX System - Ishga Tushirish Ko'rsatmalari

## Port: 3005 ✅

Barcha portlar 3005 ga o'zgartirildi.

## Tezkor Boshlash

### 1. Dependencies O'rnatish

```bash
cd /root/pbx-system
npm install --production
```

### 2. Database Tekshirish

```bash
# PostgreSQL ni tekshirish
sudo systemctl status postgresql

# Database yaratilganligini tekshirish
sudo -u postgres psql -c "\l" | grep soundzcalldb

# Agar yo'q bo'lsa, yarating:
sudo -u postgres psql << EOF
CREATE DATABASE soundzcalldb;
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\q
EOF
```

### 3. Migrationlar

```bash
npm run migrate
```

### 4. Admin User Yaratish

```bash
npm run create-admin -- admin admin123 admin@call.soundz.uz
```

### 5. Dasturni Ishga Tushirish

**Variant 1: PM2 bilan (tavsiya etiladi)**

```bash
# PM2 o'rnatish (agar yo'q bo'lsa)
sudo npm install -g pm2

# Ishga tushirish
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Server qayta ishga tushganda avtomatik start

# Status
pm2 status
pm2 logs pbx-system
```

**Variant 2: To'g'ridan-to'g'ri**

```bash
node backend/server.js
```

**Variant 3: Start skripti**

```bash
./start.sh
```

### 6. Tekshirish

```bash
# Health check
curl http://localhost:3005/health

# Portni tekshirish
sudo netstat -tlnp | grep 3005

# PM2 status
pm2 status
```

## Nginx Konfiguratsiyasi

```bash
# Konfiguratsiyani ko'chirish
sudo cp nginx.conf.example /etc/nginx/sites-available/call.soundz.uz

# Faollashtirish
sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/

# Tekshirish
sudo nginx -t

# Qayta yuklash
sudo systemctl reload nginx
```

## Firewall

```bash
# SIP port (UDP)
sudo ufw allow 5060/udp

# RTP ports (UDP)
sudo ufw allow 10000:20000/udp

# HTTP port (agar kerak bo'lsa)
sudo ufw allow 80/tcp
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
```

## Muammolarni Hal Qilish

### Database ulanish muammosi

```bash
# PostgreSQL status
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Connection test
psql -h localhost -U soundzuz_user -d soundzcalldb
```

### Port muammosi

```bash
# Portni tekshirish
sudo netstat -tlnp | grep 3005
sudo lsof -i :3005

# Agar port band bo'lsa
sudo kill -9 $(sudo lsof -t -i:3005)
```

### Loglarni Ko'rish

```bash
# PM2 logs
pm2 logs pbx-system

# Application logs
tail -f /var/www/call.soundz.uz/logs/combined.log
tail -f /var/www/call.soundz.uz/logs/error.log
```

## Muhim Ma'lumotlar

- **Port**: 3005 ✅
- **Database**: soundzcalldb
- **User**: soundzuz_user
- **Password**: Soundz&2026
- **SIP Port**: 5060 (UDP)
- **RTP Ports**: 10000-20000 (UDP)
- **Domain**: call.soundz.uz

## Keyingi Qadamlar

1. ✅ Portlar 3005 ga o'zgartirildi
2. ✅ .env fayli yaratildi
3. ⏳ Dependencies o'rnatish (npm install)
4. ⏳ Database migrationlar
5. ⏳ Admin user yaratish
6. ⏳ Dasturni ishga tushirish
