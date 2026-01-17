# Keyingi Qadamlar

## ✅ Bajarilgan Ishlar

1. ✅ Dependencies o'rnatildi (`npm install --production`)
2. ✅ Database migrationlar bajarildi (`npm run migrate`)
3. ✅ Admin user yaratildi (`npm run create-admin`)

## 🔄 Keyingi Qadamlar

### 1. Status Tekshirish

```bash
cd /root/pbx-system
./check-status.sh
```

Bu skript quyidagilarni tekshiradi:
- Database ulanishi
- Database jadvallari
- Admin user mavjudligi
- Port holati

### 2. Dasturni Ishga Tushirish

**Variant 1: PM2 bilan (tavsiya etiladi)**

```bash
# PM2 o'rnatish (agar yo'q bo'lsa)
sudo npm install -g pm2

# Ishga tushirish
pm2 start ecosystem.config.js

# Status
pm2 status

# Logs
pm2 logs pbx-system

# Avtomatik start (server qayta ishga tushganda)
pm2 save
pm2 startup
```

**Variant 2: To'g'ridan-to'g'ri**

```bash
node backend/server.js
```

**Variant 3: Start skripti**

```bash
./start.sh
```

### 3. Tekshirish

```bash
# Health check
curl http://localhost:3005/health

# Port status
sudo netstat -tlnp | grep 3005

# API test (login)
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 4. Nginx Konfiguratsiyasi

```bash
# Konfiguratsiyani ko'chirish
sudo cp nginx.conf.example /etc/nginx/sites-available/call.soundz.uz

# Faollashtirish
sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/

# Tekshirish (acoustic.uz ga ta'sir qilmaydi)
sudo nginx -t

# Qayta yuklash
sudo systemctl reload nginx
```

### 5. Firewall

```bash
# SIP port (UDP)
sudo ufw allow 5060/udp

# RTP ports (UDP)
sudo ufw allow 10000:20000/udp

# Status
sudo ufw status
```

## 📊 Monitoring

```bash
# PM2 monitoring
pm2 monit

# Logs
pm2 logs pbx-system --lines 100

# Application logs
tail -f /var/www/call.soundz.uz/logs/combined.log
tail -f /var/www/call.soundz.uz/logs/error.log
```

## 🔧 Muammolarni Hal Qilish

### Migration chiqish ko'rsatmayapti

Agar migration chiqish ko'rsatmasa, qayta ishga tushiring:

```bash
npm run migrate
```

Endi console ga chiqish ko'rsatiladi.

### Admin user chiqish ko'rsatmayapti

```bash
npm run create-admin -- admin admin123 admin@call.soundz.uz
```

Endi console ga chiqish ko'rsatiladi.

### Database ulanish muammosi

```bash
# PostgreSQL status
sudo systemctl status postgresql

# Connection test
psql -h localhost -U soundzuz_user -d soundzcalldb

# Agar parol so'rasa: Soundz&2026
```

### Port band

```bash
# Portni tekshirish
sudo netstat -tlnp | grep 3005

# Agar port band bo'lsa
sudo kill -9 $(sudo lsof -t -i:3005)
```

## 📝 Muhim Ma'lumotlar

- **Port**: 3005 ✅
- **Database**: soundzcalldb
- **User**: soundzuz_user
- **Password**: Soundz&2026
- **Admin Username**: admin
- **Admin Password**: admin123
- **SIP Port**: 5060 (UDP)
- **RTP Ports**: 10000-20000 (UDP)

## 🚀 Tezkor Start

```bash
cd /root/pbx-system
pm2 start ecosystem.config.js
pm2 save
curl http://localhost:3005/health
```
