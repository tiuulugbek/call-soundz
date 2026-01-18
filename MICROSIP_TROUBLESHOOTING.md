# MicroSIP Ulanish Muammolari - Hal Qilish

## 🔍 Muammolarni Tekshirish

### 1. Extension Parolini Tekshirish:

```powershell
node -e "require('dotenv').config(); const Extension = require('./backend/src/database/models/Extension'); Extension.findByUsername('1001').then(ext => { console.log('Has Password:', !!ext.password); process.exit(0); });"
```

**Kutilayotgan natija:**
- `Has Password: true` ✅

### 2. SIP Server Holatini Tekshirish:

```powershell
netstat -ano | findstr ":5060" | findstr "UDP"
```

**Kutilayotgan natija:**
- `UDP    0.0.0.0:5060           *:*` ✅

### 3. Server Loglarni Tekshirish:

```powershell
Get-Content logs\combined.log -Tail 50 | Select-String -Pattern "1001|REGISTER|authentication|401|403|SIP Registrar"
```

## ⚠️ Umumiy Muammolar va Yechimlar

### Muammo 1: "401 Unauthorized"

**Sabab:** Extension paroli noto'g'ri yoki yo'q

**Hal qilish:**
```powershell
# Extension parolini yangilash
node update-extension-password.js
```

### Muammo 2: "408 Request Timeout"

**Sabab:** SIP server ishlamayapti

**Hal qilish:**
```powershell
# Server ni qayta ishga tushirish
Get-Process -Name node | Stop-Process -Force
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start
```

### Muammo 3: "403 Forbidden"

**Sabab:** Extension disabled yoki authentication muvaffaqiyatsiz

**Hal qilish:**
```powershell
# Extension holatini tekshirish
node -e "require('dotenv').config(); const Extension = require('./backend/src/database/models/Extension'); Extension.findByUsername('1001').then(ext => { console.log('Enabled:', ext.enabled); console.log('Has Password:', !!ext.password); process.exit(0); });"
```

### Muammo 4: Registration muvaffaqiyatsiz

**Sabab:** Firewall yoki network muammosi

**Hal qilish:**
```powershell
# Firewall qoidalarini tekshirish
Get-NetFirewallRule -DisplayName "*5060*" | Select-Object DisplayName, Enabled

# Agar ochilmagan bo'lsa:
New-NetFirewallRule -DisplayName "PBX SIP" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow
```

## ✅ To'g'ri MicroSIP Sozlamalari

```
Account: 1001
Login: 1001
Password: 123456
Domain: 185.137.152.229
Server: 185.137.152.229
Port: 5060
Transport: UDP
```

## 🔧 Qo'shimcha Tekshirishlar

### 1. Database Ulanishi:

```powershell
node check-sip-status.js
```

### 2. SIP Registrar Ishga Tushganmi:

Loglarda quyidagilar ko'rinishi kerak:
```
SIP Registrar started on 0.0.0.0:5060
```

### 3. Extension Registration:

MicroSIP dan REGISTER so'rovi kelganda, loglarda quyidagilar ko'rinishi kerak:
```
[SIP] REGISTER request from [IP]:[PORT]
[SIP] Extension 1001 authentication successful
[SIP] Extension 1001 registered
```

## 📊 Kutilayotgan Natijalar

### MicroSIP da:
- **Status**: "Registered" yoki "Online"
- **Registration time**: Ko'rsatiladi
- **Incoming/Outgoing calls**: Ishlasa kerak

### Loglarda:
```
[SIP] Extension 1001 registered successfully
```

## 🚀 Tez Hal Qilish

Agar hali ham ulanmasa:

```powershell
# 1. Extension parolini yangilash
node update-extension-password.js

# 2. Server ni qayta ishga tushirish
Get-Process -Name node | Stop-Process -Force
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start

# 3. 10 soniya kutib, tekshirish
Start-Sleep -Seconds 10
node check-sip-status.js
```

---

## Xulosa

1. ✅ Extension 1001 paroli yangilandi: `123456`
2. ✅ SIP Server ishlayapti: Port 5060/UDP
3. ⚠️ Agar hali ham ulanmasa: Server ni qayta ishga tushiring va loglarni tekshiring
