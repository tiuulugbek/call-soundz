# PBX System - Full-featured VoIP PBX

To'liq funksiyali PBX tizimi Bell.uz SIP trunk integratsiyasi bilan.

## Xususiyatlar

- ✅ SIP Extensions (Telefonlar) boshqaruvi
- ✅ Bell.uz SIP Trunk integratsiyasi
- ✅ Call Management (Qo'ng'iroq boshqaruvi)
- ✅ Call Recording (Qo'ng'iroq yozib olish)
- ✅ IVR (Interactive Voice Response)
- ✅ Call Queues
- ✅ Voicemail
- ✅ Conference Calls
- ✅ Web Dashboard
- ✅ REST API
- ✅ Real-time Monitoring (WebSocket)

## Texnologiyalar

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **SIP**: Custom SIP stack
- **Frontend**: React.js (to be implemented)

## O'rnatish

### Talablar

- Node.js 18+
- PostgreSQL 14+
- Ubuntu 20.04+ yoki CentOS 8+

### 1. Loyihani klonlash

```bash
cd /var/www
git clone <repository-url> call.soundz.uz
cd call.soundz.uz
```

### 2. Dependencies o'rnatish

```bash
npm install
```

### 3. Environment sozlamalari

```bash
cp .env.example .env
nano .env
```

`.env` faylini to'ldiring:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=soundzcalldb
DB_USER=soundzuz_user
DB_PASSWORD=Soundz&2026

# SIP Configuration
SIP_DOMAIN=call.soundz.uz
TRUNK_USERNAME=99785553322
TRUNK_PASSWORD=your-trunk-password
```

### 4. Database yaratish va migrationlar

```bash
# PostgreSQL da database yaratish
sudo -u postgres psql
CREATE DATABASE soundzcalldb;
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\q

# Migrationlarni ishga tushirish
npm run migrate
```

### 5. Papkalarni yaratish

```bash
sudo mkdir -p /var/www/call.soundz.uz/{recordings,voicemails,ivr,logs}
sudo chown -R $USER:$USER /var/www/call.soundz.uz
```

### 6. Server ishga tushirish

**Development:**
```bash
npm run dev
```

**Production (PM2 bilan):**
```bash
npm install -g pm2
pm2 start backend/server.js --name pbx-system
pm2 save
pm2 startup
```

## Nginx Konfiguratsiyasi

`/etc/nginx/sites-available/call.soundz.uz`:

```nginx
server {
    listen 80;
    server_name call.soundz.uz;
    
    # Web Dashboard
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# SIP UDP port (5060) - firewall orqali ochilishi kerak
```

Nginx ni qayta yuklash:
```bash
sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Firewall Sozlamalari

```bash
# SIP port
sudo ufw allow 5060/udp

# RTP ports
sudo ufw allow 10000:20000/udp

# HTTP port
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## API Dokumentatsiyasi

### Authentication

Barcha API so'rovlarida JWT token kerak:

```
Authorization: Bearer <token>
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

### Extensions

```bash
# Barcha extensions
GET /api/v1/extensions

# Yangi extension yaratish
POST /api/v1/extensions
{
  "username": "1001",
  "password": "secure123",
  "displayName": "John Doe"
}

# Extension status
GET /api/v1/extensions/:id/status
```

### Calls

```bash
# Faol qo'ng'iroqlar
GET /api/v1/calls/active

# Qo'ng'iroq boshlash
POST /api/v1/calls
{
  "from": "1001",
  "to": "998901234567",
  "direction": "outbound"
}
```

## SIP Account Sozlamalari

Extension yaratilgandan keyin, SIP telefon sozlamalari:

- **Server**: call.soundz.uz
- **Port**: 5060
- **Transport**: UDP
- **Username**: Extension username (masalan: 1001)
- **Password**: Extension password
- **Domain**: call.soundz.uz

## Development

```bash
# Development mode
npm run dev

# Tests
npm test

# Migrationlar
npm run migrate
```

## Production Deployment

1. Environment variables ni sozlang
2. Database migrationlarni ishga tushiring
3. PM2 bilan server ishga tushiring
4. Nginx konfiguratsiyasini sozlang
5. Firewall qoidalarini oching

## Xavfsizlik

- JWT authentication
- Password encryption (bcrypt)
- Rate limiting
- Input validation
- SQL injection prevention

## Muammolarni hal qilish

### Database ulanish muammosi

```bash
# PostgreSQL status
sudo systemctl status postgresql

# Connection test
psql -h localhost -U soundzuz_user -d soundzcalldb
```

### SIP port muammosi

```bash
# Portni tekshirish
sudo netstat -ulnp | grep 5060

# Firewall status
sudo ufw status
```

## Qo'llab-quvvatlash

Muammo yoki savol bo'lsa, issue yarating yoki administratorga murojaat qiling.

## License

Proprietary - Soundz.uz
