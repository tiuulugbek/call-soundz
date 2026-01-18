# SIP Status Check - Muammolarni Hal Qilish

## 📊 Hozirgi Holat

Tekshirish natijalari:
- ✅ Database ulanishi: OK
- ✅ DID Number topildi: `998785553322`
- ⚠️ DID Number da trunk_username va trunk_password yo'q
- ✅ Extension topildi: `1001`
- ❌ SIP Trunk Manager initialized emas
- ❌ SIP Registrar initialized emas
- ⚠️ SIP_DOMAIN hali `call.soundz.uz` (185.137.152.229 ga o'zgartirilmagan)

## 🔧 Muammolarni Hal Qilish

### 1. .env Faylini Yangilash

`.env` faylida quyidagini o'zgartiring:
```
SIP_DOMAIN=185.137.152.229
```

### 2. DID Number Trunk Ma'lumotlarini Sozlash

DID Number (`998785553322`) uchun trunk ma'lumotlarini qo'shing:

#### API orqali:
```bash
# 1. Login va token olish
curl -X POST http://185.137.152.229:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Token oling va DID Number ni yangilang
curl -X PUT http://185.137.152.229:3005/api/v1/did-numbers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "trunk_username": "99785553322",
    "trunk_password": "your-trunk-password",
    "enabled": true
  }'
```

#### Web Dashboard orqali:
1. http://185.137.152.229:3005 ni oching
2. Login: `admin` / `admin123`
3. DID Numbers → Edit (`998785553322`)
4. Trunk Username: `99785553322`
5. Trunk Password: Bell.uz dan olingan parolni kiriting
6. Save

### 3. Server ni Qayta Ishga Tushirish

SIP Trunk Manager va SIP Registrar initialized bo'lishi uchun server ni qayta ishga tushiring:

```powershell
# Eski server ni to'xtatish
Get-Process -Name node | Stop-Process

# Qayta ishga tushirish
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start
```

### 4. Ulanishni Tekshirish

Server ishga tushgandan keyin:

```powershell
# Node.js skripti orqali
node check-sip-status.js

# Yoki API orqali
.\check-status-api.ps1
```

## 📡 SIP Ulanish Tekshirish

### Extension Ulanishi (MicroSIP):
1. MicroSIP ni oching
2. Account sozlamalari:
   - Server: `185.137.152.229`
   - Port: `5060`
   - User: `1001`
   - Password: Extension password
   - Domain: `185.137.152.229`
3. Status "Registered" bo'lishi kerak

### DID Number (Trunk) Ulanishi:
1. DID Number da trunk_username va trunk_password bo'lishi kerak
2. Trunk Server: `bell.uz` (yoki .env da TRUNK_SERVER)
3. Trunk Port: `5060` (UDP)
4. Trunk REGISTER so'rovlari avtomatik yuboriladi

## 🔍 Tekshirish Endpointlar

- `GET /api/v1/sip-status/server` - Server holati
- `GET /api/v1/sip-status/trunks` - Trunk ulanish holati
- `GET /api/v1/sip-status/extensions` - Extension ulanish holati
- `GET /api/v1/did-numbers` - DID Numbers ro'yxati

## ⚠️ Muhim Eslatmalar

1. **DID Number trunk_username va trunk_password** - Bu Bell.uz SIP trunk ulanishi uchun majburiy!
2. **SIP_DOMAIN** - IP manzilga o'zgartiring: `185.137.152.229`
3. **Server qayta ishga tushirish** - SIP Trunk Manager va Registrar ishga tushishi uchun kerak
4. **Firewall** - 5060/UDP port ochilganligini tekshiring

## 📞 Qo'shimcha Yordam

- Log fayllari: `logs/combined.log` va `logs/error.log`
- Server holati: http://185.137.152.229:3005/api/v1/sip-status/server
- Tekshirish skriptlari: `check-sip-status.js` va `check-status-api.ps1`
