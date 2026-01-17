# ✅ PBX System - Muvaffaqiyatli O'rnatildi!

## Bajarilgan Ishlar

1. ✅ **Database Setup** - PostgreSQL database va user yaratildi
2. ✅ **Migrations** - Barcha database jadvallari yaratildi
3. ✅ **Admin User** - Admin foydalanuvchi yaratildi
4. ✅ **Application** - Dastur PM2 bilan ishga tushirildi
5. ✅ **Health Check** - Dastur to'g'ri ishlayapti

## Dastur Holati

- **Port**: 3005 ✅
- **Status**: Online ✅
- **Database**: Connected ✅
- **PM2**: Running ✅

## Admin Ma'lumotlari

- **Username**: admin
- **Password**: admin123
- **Email**: admin@call.soundz.uz

## API Endpoints

### Base URL
```
http://localhost:3005
```

### Health Check
```bash
curl http://localhost:3005/health
```

### Login
```bash
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### API Test
```bash
./test-api.sh
```

## Tekshirish

### Status Check
```bash
./check-status.sh
```

### PM2 Status
```bash
pm2 status
pm2 logs pbx-system
```

### Database Test
```bash
export PGPASSWORD='Soundz&2026'
psql -h localhost -U soundzuz_user -d soundzcalldb -c "SELECT COUNT(*) FROM extensions;"
```

## Keyingi Qadamlar

### 1. Nginx Konfiguratsiyasi

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/call.soundz.uz
sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Firewall

```bash
sudo ufw allow 5060/udp    # SIP
sudo ufw allow 10000:20000/udp  # RTP
```

### 3. Extension Yaratish

API orqali:

```bash
# Login va token olish
TOKEN=$(curl -s -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Extension yaratish
curl -X POST http://localhost:3005/api/v1/extensions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "1001",
    "password": "secure123",
    "displayName": "Test Extension"
  }'
```

### 4. Monitoring

```bash
# PM2 monitoring
pm2 monit

# Logs
pm2 logs pbx-system --lines 50

# Application logs
tail -f /var/www/call.soundz.uz/logs/combined.log
```

## Muhim Ma'lumotlar

- **Application Port**: 3005
- **SIP Port**: 5060 (UDP)
- **RTP Ports**: 10000-20000 (UDP)
- **Database**: soundzcalldb
- **Database User**: soundzuz_user
- **Database Password**: Soundz&2026

## Foydali Buyruqlar

```bash
# Restart application
pm2 restart pbx-system

# Stop application
pm2 stop pbx-system

# Start application
pm2 start ecosystem.config.js

# View logs
pm2 logs pbx-system

# Status check
./check-status.sh

# API test
./test-api.sh
```

## Muammolarni Hal Qilish

### Application ishlamayapti

```bash
pm2 restart pbx-system
pm2 logs pbx-system
```

### Database muammosi

```bash
./setup-database.sh
npm run migrate
```

### Port muammosi

```bash
sudo netstat -tlnp | grep 3005
sudo lsof -i :3005
```

## 🎉 Tabriklaymiz!

PBX System muvaffaqiyatli o'rnatildi va ishlayapti!
