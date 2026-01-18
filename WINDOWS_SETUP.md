# Windows O'rnatish Yo'riqnomasi

Bu yo'riqnoma Windows operatsion tizimida Call Soundz PBX tizimini to'liq o'rnatish uchun.

## Talablar

1. **Node.js** (v18+) - ✅ O'rnatilgan (v22.12.0)
2. **PostgreSQL** (v14+) - ⚠️ O'rnatish kerak
3. **npm** (v10+) - ✅ O'rnatilgan (v10.9.0)

## Qadam 1: PostgreSQL O'rnatish

### Variant A: PostgreSQL ni o'rnatish (Tavsiya etiladi)

1. PostgreSQL ni yuklab oling: https://www.postgresql.org/download/windows/
2. O'rnatishda quyidagilarni tanlang:
   - Port: **5432** (default)
   - Superuser password: **postgres** (yoki o'zingiz tanlagan parol)
   - Locale: **Default locale**

3. O'rnatishdan keyin PostgreSQL Server ni ishga tushiring:
   - Start Menu → PostgreSQL → pgAdmin 4
   - Yoki Services dan: `postgresql-x64-XX` servisini ishga tushiring

### Variant B: PostgreSQL ni PowerShell orqali o'rnatish

```powershell
# Chocolatey orqali (agar o'rnatilgan bo'lsa)
choco install postgresql --params '/Password:postgres'

# Yoki winget orqali
winget install PostgreSQL.PostgreSQL
```

## Qadam 2: Database va User yaratish

PostgreSQL o'rnatilgandan keyin, quyidagi buyruqlarni bajaring:

```powershell
# PostgreSQL bin papkasini PATH ga qo'shish (agar kerak bo'lsa)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# PostgreSQL ga ulanish
psql -U postgres

# Database va user yaratish
CREATE DATABASE soundzcalldb;
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\q
```

**Yoki** `setup-postgresql.ps1` skriptini ishga tushiring (avtomatik):

```powershell
.\setup-postgresql.ps1
```

## Qadam 3: Database Migrationlarni ishga tushirish

```powershell
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm run migrate
```

## Qadam 4: Admin User yaratish

```powershell
npm run create-admin
```

Yoki maxsus parol bilan:

```powershell
npm run create-admin -- admin mypassword admin@call.soundz.uz
```

## Qadam 5: Server ni ishga tushirish

### Development mode:

```powershell
npm run dev
```

### Production mode:

```powershell
npm start
```

Server `http://localhost:3005` da ishga tushadi.

## Qadam 6: Firewall Sozlamalari

Windows Firewall da quyidagi portlarni ochish kerak:

```powershell
# Administrator huquqlari bilan PowerShell ishga tushiring

# HTTP port (3005)
New-NetFirewallRule -DisplayName "PBX HTTP" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow

# SIP port (5060)
New-NetFirewallRule -DisplayName "PBX SIP" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow

# RTP ports (10000-20000)
New-NetFirewallRule -DisplayName "PBX RTP" -Direction Inbound -LocalPort 10000-20000 -Protocol UDP -Action Allow

# PostgreSQL port (5432) - faqat localhost uchun
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow -RemoteAddress LocalSubnet
```

## Qadam 7: Domain Sozlash (Static IP uchun)

Agar statik IP va domain bo'lsa:

1. DNS sozlamalarida `call.soundz.uz` ni statik IP ga yo'naltiring
2. `.env` faylida `SIP_DOMAIN=call.soundz.uz` ni saqlang

## API Endpoints

- **Web Dashboard**: http://localhost:3005
- **API Base**: http://localhost:3005/api/v1
- **WebSocket**: ws://localhost:3005

## Muammolarni Hal Qilish

### PostgreSQL ulanish muammosi

```powershell
# PostgreSQL servisini tekshirish
Get-Service postgresql*

# PostgreSQL ga ulanishni test qilish
psql -U postgres -d postgres
```

### Port muammosi

```powershell
# Portlardan foydalanilayotgan jarayonni ko'rish
netstat -ano | findstr :3005
netstat -ano | findstr :5060
```

### Database migration muammosi

```powershell
# Database ulanishini test qilish
node test-db-connection.js
```

## Qo'shimcha Ma'lumot

- **Recordings**: `C:\Users\AzzaPRO\Desktop\call.soundz.uz\recordings`
- **Voicemails**: `C:\Users\AzzaPRO\Desktop\call.soundz.uz\voicemails`
- **IVR Audio**: `C:\Users\AzzaPRO\Desktop\call.soundz.uz\ivr`
- **Logs**: `C:\Users\AzzaPRO\Desktop\call.soundz.uz\logs`
