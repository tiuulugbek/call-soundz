# 🎉 O'rnatish Yakunlandi!

Call Soundz PBX tizimi Desktop/call.soundz.uz papkasida to'liq o'rnatildi.

## ✅ Bajarilgan Ishlar

1. ✅ **Repository klon qilindi**
   - Manzil: `C:\Users\AzzaPRO\Desktop\call.soundz.uz`

2. ✅ **Dependencies o'rnatildi**
   - Node.js paketlari muvaffaqiyatli o'rnatildi
   - 493 packages installed

3. ✅ **Kerakli papkalar yaratildi**
   - `recordings/` - Qo'ng'iroq yozuvlari uchun
   - `voicemails/` - Voicemail yozuvlari uchun
   - `ivr/` - IVR audio fayllari uchun
   - `logs/` - Log fayllari uchun

4. ✅ **Environment variables sozlandi**
   - `.env` fayli Windows uchun sozlandi
   - Barcha yo'llar Windows formatiga moslashtirildi
   - JWT secret yangilandi

5. ✅ **Backend kodlari moslashtirildi**
   - Logger.js Windows uchun moslashtirildi
   - Log yo'llari environment variable dan olinadi

6. ✅ **Setup skriptlari yaratildi**
   - `setup-windows.ps1` - To'liq o'rnatish skripti
   - `setup-postgresql.ps1` - Database sozlash skripti
   - `install-postgresql.ps1` - PostgreSQL o'rnatish skripti
   - `start-windows.bat` - Windows start skripti

7. ✅ **Hujjatlar yaratildi**
   - `WINDOWS_SETUP.md` - To'liq o'rnatish yo'riqnomasi
   - `QUICK_START_WINDOWS.md` - Tezkor boshlash yo'riqnomasi

## ⏳ Keyingi Qadamlar

PostgreSQL o'rnatilmagan bo'lsa, quyidagi qadamlarni bajaring:

### 1. PostgreSQL O'rnatish

#### Variant A: PowerShell skripti orqali
```powershell
# Administrator huquqlari bilan
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
.\install-postgresql.ps1
```

#### Variant B: Qo'lda o'rnatish
1. https://www.postgresql.org/download/windows/ dan yuklab oling
2. O'rnatishda:
   - Port: **5432**
   - Superuser password: **postgres**
   - Locale: Default

### 2. Database va User Yaratish

PostgreSQL o'rnatilgandan keyin:

```powershell
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz

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

Default credentials:
- Username: `admin`
- Password: `admin123`

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
# Administrator huquqlari bilan PowerShell
New-NetFirewallRule -DisplayName "PBX HTTP" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "PBX SIP" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow
New-NetFirewallRule -DisplayName "PBX RTP" -Direction Inbound -LocalPort 10000-20000 -Protocol UDP -Action Allow
```

## 📍 API Endpoints

Server ishga tushgandan keyin:

- **Web Dashboard**: http://localhost:3005
- **API Base**: http://localhost:3005/api/v1
- **WebSocket**: ws://localhost:3005

## 📁 Project Strukturasi

```
C:\Users\AzzaPRO\Desktop\call.soundz.uz\
├── backend/
│   ├── src/
│   │   ├── api/          # API routes
│   │   ├── database/     # Database models & migrations
│   │   ├── sip/          # SIP handling
│   │   └── ...
│   └── server.js
├── frontend/
├── recordings/           # Qo'ng'iroq yozuvlari
├── voicemails/           # Voicemail yozuvlari
├── ivr/                  # IVR audio fayllari
├── logs/                 # Log fayllari
├── .env                  # Environment variables
├── package.json
├── setup-windows.ps1     # To'liq o'rnatish skripti
├── setup-postgresql.ps1  # Database sozlash skripti
├── install-postgresql.ps1 # PostgreSQL o'rnatish skripti
├── start-windows.bat     # Windows start skripti
├── WINDOWS_SETUP.md      # To'liq o'rnatish yo'riqnomasi
└── QUICK_START_WINDOWS.md # Tezkor boshlash yo'riqnomasi
```

## 🔐 Ma'lumotlar

- **Database Name**: soundzcalldb
- **Database User**: soundzuz_user
- **Database Password**: Soundz&2026
- **Database Host**: localhost
- **Database Port**: 5432
- **SIP Domain**: call.soundz.uz
- **SIP Port**: 5060
- **HTTP Port**: 3005
- **RTP Port Range**: 10000-20000

## 🎯 To'liq O'rnatish Skripti

Agar barcha qadamlarni avtomatik bajarishni xohlasangiz:

```powershell
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
.\setup-windows.ps1
```

Bu skript:
1. Node.js va npm ni tekshiradi
2. Dependencies ni o'rnatadi
3. Papkalarni yaratadi
4. .env faylini tekshiradi
5. PostgreSQL ni tekshiradi
6. Database ni sozlaydi
7. Migrationlarni ishga tushiradi
8. Admin user yaratadi

## ⚠️ Muammolarni Hal Qilish

Muammolar bo'lsa, `WINDOWS_SETUP.md` yoki `QUICK_START_WINDOWS.md` fayllarini ko'rib chiqing.

## 📞 Qo'llab-quvvatlash

Muammo bo'lsa yoki savol bo'lsa, issue yarating yoki administratorga murojaat qiling.
