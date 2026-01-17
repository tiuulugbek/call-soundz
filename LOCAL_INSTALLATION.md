# Lokal O'rnatish Qo'llanmasi

Bu qo'llanma loyihani lokal kompyuteringizda o'rnatish va ishga tushirish uchun.

## Talablar

- Node.js 18+ ([yuklab olish](https://nodejs.org/))
- PostgreSQL 14+ ([yuklab olish](https://www.postgresql.org/download/))
- Git ([yuklab olish](https://git-scm.com/downloads))
- npm yoki yarn

## 1. Loyihani klonlash

```bash
# GitHub dan loyihani klonlash
git clone https://github.com/tiuulugbek/call-soundz.git
cd call-soundz
```

## 2. Dependencies o'rnatish

```bash
npm install
```

## 3. PostgreSQL o'rnatish va sozlash

### Ubuntu/Debian:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS (Homebrew):

```bash
brew install postgresql@14
brew services start postgresql@14
```

### Windows:

PostgreSQL ni rasmiy saytdan yuklab oling va o'rnating.

### Database yaratish:

```bash
# PostgreSQL ga kirish
sudo -u postgres psql

# Database va user yaratish
CREATE DATABASE soundzcalldb;
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
ALTER DATABASE soundzcalldb OWNER TO soundzuz_user;
\q
```

## 4. Environment sozlamalari

```bash
# .env.example dan .env faylini yaratish
cp .env.example .env
```

`.env` faylini tahrirlang va quyidagilarni sozlang:

```env
# Server Configuration
PORT=3005
HOST=0.0.0.0
NODE_ENV=development

# SIP Configuration
SIP_HOST=0.0.0.0
SIP_PORT=5060
SIP_TRANSPORT=udp
SIP_DOMAIN=localhost  # Lokal uchun localhost

# SIP Trunk Configuration (Bell.uz)
TRUNK_SERVER=bell.uz
TRUNK_USERNAME=99785553322
TRUNK_PASSWORD=your-trunk-password  # O'z parolingizni kiriting
TRUNK_PORT=5060
TRUNK_TRANSPORT=udp

# Media Configuration
RTP_START_PORT=10000
RTP_END_PORT=20000
ECHO_CANCELLATION=true

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=soundzcalldb
DB_USER=soundzuz_user
DB_PASSWORD=Soundz&2026
DB_SSL=false

# Recording Configuration
RECORDING_ENABLED=true
RECORDING_FORMAT=wav
RECORDING_PATH=./recordings  # Lokal uchun nisbiy yo'l
RECORDING_MAX_SIZE=104857600

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Voicemail Configuration
VOICEMAIL_PATH=./voicemails  # Lokal uchun nisbiy yo'l
VOICEMAIL_MAX_DURATION=300

# IVR Configuration
IVR_AUDIO_PATH=./ivr  # Lokal uchun nisbiy yo'l

# Logging
LOG_LEVEL=info
```

## 5. Database migrationlarni ishga tushirish

```bash
npm run migrate
```

Yoki qo'lda:

```bash
node backend/src/database/migrations/run.js
```

## 6. Kerakli papkalarni yaratish

```bash
mkdir -p recordings voicemails ivr logs
```

## 7. Admin user yaratish (ixtiyoriy)

```bash
node backend/src/scripts/create-admin.js
```

## 8. Server ishga tushirish

### Development mode:

```bash
npm run dev
```

Yoki:

```bash
node backend/server.js
```

### Production mode (PM2 bilan):

```bash
# PM2 o'rnatish
npm install -g pm2

# Server ishga tushirish
pm2 start backend/server.js --name pbx-system

# Status tekshirish
pm2 status

# Loglarni ko'rish
pm2 logs pbx-system
```

## 9. Server tekshirish

Server ishga tushgandan keyin:

- **Web Dashboard**: http://localhost:3005
- **API**: http://localhost:3005/api/v1
- **SIP Port**: 5060 (UDP)

## 10. Firewall sozlamalari (agar kerak bo'lsa)

### Linux:

```bash
# SIP port
sudo ufw allow 5060/udp

# RTP ports
sudo ufw allow 10000:20000/udp
```

### macOS:

Firewall System Preferences > Security & Privacy > Firewall orqali boshqariladi.

### Windows:

Windows Firewall orqali portlarni oching.

## Muammolarni hal qilish

### Database ulanish muammosi

```bash
# PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Connection test
psql -h localhost -U soundzuz_user -d soundzcalldb
```

### Port allaqachon ishlatilmoqda

```bash
# Portni tekshirish
sudo netstat -ulnp | grep 5060  # Linux
lsof -i :5060  # macOS

# Agar port band bo'lsa, .env faylida boshqa port tanlang
```

### Node modules muammosi

```bash
# node_modules ni o'chirib qayta o'rnatish
rm -rf node_modules package-lock.json
npm install
```

### Migration muammosi

```bash
# Database ni qayta yaratish
sudo -u postgres psql
DROP DATABASE soundzcalldb;
CREATE DATABASE soundzcalldb;
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\q

# Migrationlarni qayta ishga tushirish
npm run migrate
```

## Test qilish

### API test:

```bash
# Server ishga tushirilgan bo'lishi kerak
curl http://localhost:3005/api/v1/health
```

### Database test:

```bash
node test-db-connection.js
```

### SIP test:

```bash
node test-sip-connection.js
```

## Keyingi qadamlar

1. Web dashboard ga kirish: http://localhost:3005
2. Admin user yaratish (agar yaratilmagan bo'lsa)
3. Extension yaratish
4. SIP telefon sozlash
5. Qo'ng'iroq sinab ko'rish

## Qo'shimcha ma'lumot

- [README.md](README.md) - Asosiy qo'llanma
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Muammolarni hal qilish

## Yordam

Muammo yoki savol bo'lsa:
- GitHub Issues: https://github.com/tiuulugbek/call-soundz/issues
- Administratorga murojaat qiling
