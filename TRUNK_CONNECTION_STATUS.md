# Trunk Ulanish Holati - Xulosa

## ✅ Hozirgi Holat

### DID Number Ma'lumotlari (TO'G'RI):
- **Number**: `998785553322`
- **Provider**: `bell.uz`
- **Trunk Username**: `998785553322` ✅
- **Trunk Password**: Mavjud ✅
- **Route Type**: `extension`
- **Enabled**: `true` ✅

### SIP Trunk Manager Holati:
- **Status**: ❌ Initialized emas

## 🔍 Trunk Ulanish Holatini Tekshirish

### 1. Tekshirish Skripti:
```powershell
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
node check-sip-status.js
```

### 2. API orqali Tekshirish:
```bash
# Login va token olish
curl -X POST http://185.137.152.229:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Trunk status
curl -X GET http://185.137.152.229:3005/api/v1/sip-status/trunks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Server Loglarni Tekshirish:
```powershell
# Trunk bilan bog'liq loglarni ko'rish
Get-Content logs\combined.log -Tail 100 | Select-String -Pattern "Trunk|REGISTER|SIP"

# Xato loglarni ko'rish
Get-Content logs\error.log -Tail 50 | Select-String -Pattern "Trunk|Register"
```

## ⚠️ Muammo: SIP Trunk Manager Initialized Emas

**Sabab:**
Server ishga tushganda SIP Trunk Manager avtomatik initialize bo'lishi kerak. Agar initialized bo'lmasa, server qayta ishga tushirish kerak.

**Hal qilish:**

```powershell
# 1. Server ni to'xtatish
Get-Process -Name node | Stop-Process

# 2. Qayta ishga tushirish
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start

# 3. 5-10 soniya kutib, tekshirish
Start-Sleep -Seconds 10
node check-sip-status.js
```

## ✅ Kutilayotgan Holat

Trunk muvaffaqiyatli ulanganda:

```
✓ SIP Trunk Manager initialized
✓ Active Trunks: 1
  - DID ID: 1
    Registered: Yes
    Contact URI: sip:998785553322@c.soundz.uz:5060
    Expires At: [vaqt]
```

## 📊 Tekshirish Natijalari

**Hozirgi holat:**
- ✅ DID Number ma'lumotlari to'g'ri
- ✅ Trunk Username va Password mavjud
- ❌ SIP Trunk Manager initialized emas

**Keyingi qadam:**
1. Server ni qayta ishga tushiring
2. 5-10 soniya kuting
3. Trunk status ni qayta tekshiring

## 🔍 Tekshirish Usullari

### 1. Node.js Skripti:
```powershell
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
node check-sip-status.js
```

### 2. API orqali:
```powershell
.\check-status-api.ps1
```

### 3. Qo'lda Database:
```powershell
node -e "require('dotenv').config(); const pool = require('./backend/src/database/connection'); pool.query('SELECT number, trunk_username, trunk_password FROM did_numbers').then(r => { console.log(r.rows); pool.end(); });"
```

## 📞 Qo'shimcha Yordam

- **Log fayllari**: `logs/combined.log` va `logs/error.log`
- **Tekshirish skriptlari**: `check-sip-status.js`
- **Batafsil**: `TRUNK_STATUS.md`, `fix-sip-issues.md`

---

## Xulosa

**DID Number ma'lumotlari to'g'ri sozlangan!** 

Trunk ulanishi uchun faqat **server ni qayta ishga tushirish** kerak. Server ishga tushganda SIP Trunk Manager avtomatik initialize bo'ladi va trunk ga register qiladi.
