# Quick Start - Windows

Bu yo'riqnoma Windows da Call Soundz PBX tizimini tezda ishga tushirish uchun.

## ✅ Bajarilgan Qadamlar

1. ✅ Repository klon qilindi
2. ✅ npm packages o'rnatildi
3. ✅ Kerakli papkalar yaratildi
4. ✅ .env fayli Windows uchun sozlandi

## 🔄 Keyingi Qadamlar

### 1. PostgreSQL O'rnatish

PostgreSQL o'rnatilmagan bo'lsa, quyidagi usullardan birini tanlang:

#### Variant A: winget orqali (Tavsiya etiladi)

```powershell
# Administrator huquqlari bilan PowerShell oching
.\install-postgresql.ps1
```

#### Variant B: Qo'lda o'rnatish

1. https://www.postgresql.org/download/windows/ dan yuklab oling
2. O'rnatishda:
   - Port: **5432** (default)
   - Superuser password: **postgres** (yoki o'zingiz tanlagan)
   - Locale: Default locale
3. PostgreSQL servisini ishga tushiring

### 2. Database va User Yaratish

PostgreSQL o'rnatilgandan keyin:

```powershell
# Avtomatik (tavsiya etiladi)
.\setup-postgresql.ps1

# Yoki qo'lda
psql -U postgres
CREATE DATABASE soundzcalldb;
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\q
```

### 3. Database Migrationlar

```powershell
npm run migrate
```

### 4. Admin User Yaratish

```powershell
npm run create-admin
```

Default: username=`admin`, password=`admin123`

Maxsus parol bilan:
```powershell
npm run create-admin admin mypassword admin@call.soundz.uz
```

### 5. Server ni Ishga Tushirish

#### Development mode:

```powershell
npm run dev
```

#### Production mode:

```powershell
npm start
```

Yoki Windows batch fayli:

```powershell
.\start-windows.bat
```

### 6. Firewall Sozlamalari

Windows Firewall da portlarni ochish:

```powershell
# Administrator huquqlari bilan
New-NetFirewallRule -DisplayName "PBX HTTP" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "PBX SIP" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow
New-NetFirewallRule -DisplayName "PBX RTP" -Direction Inbound -LocalPort 10000-20000 -Protocol UDP -Action Allow
```

## 📍 API Endpoints

- **Web Dashboard**: http://localhost:3005
- **API Base**: http://localhost:3005/api/v1
- **WebSocket**: ws://localhost:3005

## 🔧 To'liq O'rnatish

Agar barcha qadamlarni avtomatik bajarishni xohlasangiz:

```powershell
.\setup-windows.ps1
```

## ⚠️ Muammolarni Hal Qilish

### PostgreSQL ulanish muammosi

```powershell
# Servisni tekshirish
Get-Service postgresql*

# Servisni ishga tushirish
Start-Service postgresql-x64-16  # (raqam o'zgarishi mumkin)

# Ulanishni test qilish
psql -U postgres -d postgres
```

### Port muammosi

```powershell
# Portlardan foydalanilayotgan jarayonni ko'rish
netstat -ano | findstr :3005
netstat -ano | findstr :5060

# Jarayonni to'xtatish (agar kerak bo'lsa)
taskkill /PID <PID> /F
```

### Database migration muammosi

```powershell
# Database ulanishini test qilish
node test-db-connection.js
```

## 📁 Papka Strukturasi

```
call.soundz.uz/
├── backend/
├── frontend/
├── recordings/      # Qo'ng'iroq yozuvlari
├── voicemails/      # Voicemail yozuvlari
├── ivr/            # IVR audio fayllari
├── logs/           # Log fayllari
└── .env            # Environment variables
```

## 🔐 Ma'lumotlar

- **Database**: soundzcalldb
- **Database User**: soundzuz_user
- **Database Password**: Soundz&2026
- **SIP Domain**: call.soundz.uz
- **SIP Port**: 5060
- **HTTP Port**: 3005

## 📞 Qo'llab-quvvatlash

Muammo bo'lsa, `WINDOWS_SETUP.md` faylini ko'rib chiqing yoki issue yarating.
