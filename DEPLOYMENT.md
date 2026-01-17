# Deployment Guide - call.soundz.uz

Bu qo'llanma call.soundz.uz dasturini serverga o'rnatish uchun.

## Muhim Eslatmalar

⚠️ **E'tiborli bo'ling**: acoustic.uz ma'lumotlari va konfiguratsiyalari o'chmasligi kerak!

- acoustic.uz nginx konfiguratsiyasiga tegmaslik
- acoustic.uz database ma'lumotlariga tegmaslik
- acoustic.uz fayllariga tegmaslik

## 1. Server Talablari

- Ubuntu 20.04+ yoki CentOS 8+
- Node.js 18+
- PostgreSQL 14+
- Nginx
- Minimum 4GB RAM
- Minimum 2 CPU cores
- 50GB+ disk space

## 2. Dasturlarni O'rnatish

```bash
# Node.js o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL o'rnatish
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Nginx o'rnatish (agar yo'q bo'lsa)
sudo apt-get install -y nginx

# PM2 o'rnatish
sudo npm install -g pm2
```

## 3. Database Sozlash

```bash
# PostgreSQL ga kirish
sudo -u postgres psql

# Database va user yaratish
CREATE DATABASE soundzcalldb;
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\q
```

## 4. Loyihani O'rnatish

```bash
# Papka yaratish
sudo mkdir -p /var/www/call.soundz.uz
sudo chown -R $USER:$USER /var/www/call.soundz.uz

# Loyihani ko'chirish (yoki git clone)
cd /var/www/call.soundz.uz
# ... loyiha fayllarini ko'chiring ...

# Dependencies o'rnatish
npm install --production

# Environment sozlamalari
cp .env.example .env
nano .env  # Sozlamalarni to'ldiring

# Database migrationlar
npm run migrate

# Papkalarni yaratish
mkdir -p recordings voicemails ivr logs
```

## 5. Nginx Konfiguratsiyasi

**Muhim**: acoustic.uz konfiguratsiyasiga tegmaslik!

```bash
# Yangi konfiguratsiya yaratish
sudo nano /etc/nginx/sites-available/call.soundz.uz
```

Quyidagi konfiguratsiyani qo'shing (nginx.conf.example faylidan ko'chirib oling):

```nginx
server {
    listen 80;
    server_name call.soundz.uz;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Konfiguratsiyani faollashtirish
sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/

# Nginx konfiguratsiyasini tekshirish
sudo nginx -t

# Nginx ni qayta yuklash (acoustic.uz ga ta'sir qilmaydi)
sudo systemctl reload nginx
```

## 6. Firewall Sozlamalari

```bash
# SIP UDP port
sudo ufw allow 5060/udp

# RTP ports (media uchun)
sudo ufw allow 10000:20000/udp

# HTTP portlar (agar kerak bo'lsa)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Firewall status
sudo ufw status
```

## 7. PM2 bilan Ishga Tushirish

```bash
cd /var/www/call.soundz.uz

# PM2 bilan ishga tushirish
pm2 start ecosystem.config.js

# PM2 ni saqlash
pm2 save

# PM2 startup script (server qayta ishga tushganda avtomatik start)
pm2 startup
# Chiqgan buyruqni bajarish kerak
```

## 8. Tekshirish

```bash
# Server status
pm2 status

# Loglarni ko'rish
pm2 logs pbx-system

# Health check
curl http://localhost:3000/health

# Nginx status
sudo systemctl status nginx

# PostgreSQL status
sudo systemctl status postgresql
```

## 9. Monitoring

```bash
# PM2 monitoring
pm2 monit

# Loglarni ko'rish
tail -f /var/www/call.soundz.uz/logs/combined.log
tail -f /var/www/call.soundz.uz/logs/error.log
```

## 10. Yangilash

```bash
cd /var/www/call.soundz.uz

# Kodni yangilash
git pull  # yoki yangi kodlarni ko'chirish

# Dependencies yangilash
npm install --production

# Migrationlar (agar yangi migrationlar bo'lsa)
npm run migrate

# PM2 ni qayta ishga tushirish
pm2 restart pbx-system
```

## 11. Backup

```bash
# Database backup
pg_dump -U soundzuz_user soundzcalldb > backup_$(date +%Y%m%d).sql

# Fayllarni backup
tar -czf recordings_backup_$(date +%Y%m%d).tar.gz recordings/
tar -czf voicemails_backup_$(date +%Y%m%d).tar.gz voicemails/
```

## 12. Muammolarni Hal Qilish

### Database ulanish muammosi

```bash
# PostgreSQL ni tekshirish
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Connection test
psql -h localhost -U soundzuz_user -d soundzcalldb
```

### Port muammosi

```bash
# Portni tekshirish
sudo netstat -ulnp | grep 5060
sudo netstat -tlnp | grep 3000

# Process ni topish
ps aux | grep node
```

### Nginx muammosi

```bash
# Nginx loglari
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Konfiguratsiyani tekshirish
sudo nginx -t
```

## 13. Xavfsizlik

- `.env` faylida parollarni o'zgartiring
- JWT_SECRET ni kuchli qiling
- Firewall qoidalarini tekshiring
- Regular backup qiling
- Loglarni monitoring qiling

## 14. Support

Muammo bo'lsa:
1. Loglarni tekshiring
2. PM2 status ni ko'ring
3. Database connection ni tekshiring
4. Administratorga murojaat qiling
