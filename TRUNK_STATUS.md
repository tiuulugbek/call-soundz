# Trunk Ulanish Holati - Tekshirish

## ✅ Database Tekshiruv Natijalari

DID Number ma'lumotlari:
- **Number**: `998785553322`
- **Provider**: `bell.uz`
- **Trunk Username**: `998785553322` ✅
- **Trunk Password**: Mavjud ✅
- **Enabled**: `true` ✅

## 🔍 Trunk Ulanish Holatini Tekshirish

### 1. Database Tekshirish (✅ Muvaffaqiyatli)

DID Number ma'lumotlari to'g'ri sozlangan:
- trunk_username va trunk_password mavjud

### 2. SIP Trunk Manager Holati

**Tekshirish:**

```powershell
# Status check
node check-sip-status.js
```

Yoki API orqali:
```bash
# Login
curl -X POST http://185.137.152.229:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Token oling va trunk status tekshiring
curl -X GET http://185.137.152.229:3005/api/v1/sip-status/trunks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Server Loglarni Tekshirish

Log fayllarda trunk registration holatini ko'rish:

```powershell
# Soniya loglarni ko'rish
Get-Content logs\combined.log -Tail 50 | Select-String -Pattern "Trunk|REGISTER|Registration"

# Xato loglarni ko'rish
Get-Content logs\error.log -Tail 30 | Select-String -Pattern "Trunk|Register"
```

## ⚠️ Muammolarni Hal Qilish

### Muammo: SIP Trunk Manager initialized emas

**Sabab:**
- Server ishga tushirilganda SIP Trunk Manager avtomatik initialize bo'lishi kerak
- Agar initialized bo'lmasa, server qayta ishga tushirish kerak

**Hal qilish:**

```powershell
# 1. Server ni to'xtatish
Get-Process -Name node | Stop-Process

# 2. Qayta ishga tushirish
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start

# 3. 5-10 soniya kutib, tekshirish
Start-Sleep -Seconds 5
node check-sip-status.js
```

### Muammo: Trunk registered emas

**Sabablari:**
1. SIP Trunk Manager initialized emas
2. Bell.uz server ga ulanib bo'lmayapti
3. trunk_username/trunk_password noto'g'ri
4. Firewall SIP port (5060/UDP) ni bloklayapti
5. Network ulanish muammosi

**Hal qilish:**

1. **Trunk username/password tekshirish:**
   - Web Dashboard: http://185.137.152.229:3005
   - DID Numbers → Edit → Trunk Username/Password ni tekshiring

2. **Bell.uz server ga ulanish tekshirish:**
   ```powershell
   # Ping test
   ping bell.uz
   
   # Port test (agar telnet o'rnatilgan bo'lsa)
   Test-NetConnection -ComputerName bell.uz -Port 5060
   ```

3. **Firewall tekshirish:**
   ```powershell
   # SIP port ochilganligini tekshirish
   Get-NetFirewallRule -DisplayName "PBX SIP" | Select-Object DisplayName, Enabled, Direction
   ```

4. **Loglarni tekshirish:**
   ```powershell
   Get-Content logs\combined.log -Tail 100 | Select-String -Pattern "REGISTER|Trunk|Error"
   ```

## ✅ Kutilayotgan Holat

Trunk muvaffaqiyatli ulanganda:

```
✓ SIP Trunk Manager initialized
✓ Active Trunks: 1
  - DID ID: 1
    Registered: Yes
    Contact URI: sip:998785553322@c.soundz.uz:5060
    Expires At: 2026-01-18 16:30:00
```

## 🔍 Tekshirish Usullari

### 1. Node.js Skripti:
```powershell
node check-sip-status.js
```

### 2. API orqali:
```powershell
.\check-status-api.ps1
```

### 3. Qo'lda Database tekshirish:
```powershell
node -e "require('dotenv').config(); const pool = require('./backend/src/database/connection'); pool.query('SELECT * FROM did_numbers').then(r => { console.log(r.rows); pool.end(); });"
```

## 📞 Qo'shimcha Yordam

- Log fayllari: `logs/combined.log` va `logs/error.log`
- Tekshirish skriptlari: `check-sip-status.js`, `check-trunk-status.js`
- Batafsil ma'lumot: `fix-sip-issues.md`, `SIP_STATUS_CHECK.md`
