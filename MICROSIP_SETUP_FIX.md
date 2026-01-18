# MicroSIP Ulanish - Muammo Hal Qilish

## ✅ Muammo Hal Qilindi

Extension 1001 paroli yangilandi. Endi MicroSIP orqali ulanish mumkin.

## 📋 MicroSIP Sozlamalari

### To'g'ri Sozlamalar:

```
Account: 1001
Login: 1001
Password: 123456
Domain: 185.137.152.229
Server: 185.137.152.229
Port: 5060
Transport: UDP
```

### Yoki Domain orqali:

```
Account: 1001
Login: 1001
Password: 123456
Domain: c.soundz.uz
Server: c.soundz.uz
Port: 5060
Transport: UDP
```

## 🔍 Muammo Sababi

**Muammo:** Extension 1001 database da parol yo'q edi (NULL)
**Hal qilindi:** Extension paroli `123456` ga yangilandi

## ✅ Tekshirish

### 1. Extension Parolini Tekshirish:

```powershell
node -e "require('dotenv').config(); const Extension = require('./backend/src/database/models/Extension'); Extension.findByUsername('1001').then(ext => { console.log('Has Password:', !!ext.password); process.exit(0); });"
```

### 2. MicroSIP da Ulanish:

1. MicroSIP ni oching
2. Quyidagi sozlamalarni kiriting:
   - **Account/Login**: `1001`
   - **Password**: `123456`
   - **Domain**: `185.137.152.229` (yoki `c.soundz.uz`)
   - **Server**: `185.137.152.229` (yoki `c.soundz.uz`)
   - **Port**: `5060`
   - **Transport**: `UDP`
3. **Register** tugmasini bosing

### 3. Registration Holatini Tekshirish:

```powershell
# Loglarni ko'rish
Get-Content logs\combined.log -Tail 30 | Select-String -Pattern "1001|REGISTER|authentication"
```

## ⚠️ Muammolarni Hal Qilish

### Muammo: Hali ham ulanmayapti

**Tekshirishlar:**

1. **Extension paroli to'g'rimi?**
   ```powershell
   node -e "require('dotenv').config(); const Extension = require('./backend/src/database/models/Extension'); Extension.findByUsername('1001').then(ext => { console.log('Has Password:', !!ext.password); process.exit(0); });"
   ```

2. **SIP Server ishlayaptimi?**
   ```powershell
   netstat -ano | findstr ":5060" | findstr "UDP"
   ```

3. **Firewall ochilganmi?**
   ```powershell
   Get-NetFirewallRule -DisplayName "*5060*" | Select-Object DisplayName, Enabled
   ```

4. **Loglarni ko'rish:**
   ```powershell
   Get-Content logs\combined.log -Tail 50 | Select-String -Pattern "1001|REGISTER|authentication|401|403"
   ```

### Muammo: "401 Unauthorized" xatosi

**Sabab:** Extension paroli noto'g'ri yoki yo'q

**Hal qilish:**
```powershell
node update-extension-password.js
```

### Muammo: "408 Request Timeout" xatosi

**Sabab:** SIP server javob bermayapti

**Hal qilish:**
1. Server ishlayaptimi tekshiring: `netstat -ano | findstr ":5060"`
2. Firewall ochilganligini tekshiring
3. Server ni qayta ishga tushiring: `npm start`

### Muammo: "403 Forbidden" xatosi

**Sabab:** Extension disabled yoki parol noto'g'ri

**Hal qilish:**
```powershell
node -e "require('dotenv').config(); const Extension = require('./backend/src/database/models/Extension'); Extension.findByUsername('1001').then(ext => { console.log('Enabled:', ext.enabled); console.log('Has Password:', !!ext.password); process.exit(0); });"
```

## 📊 Kutilayotgan Natijalar

### MicroSIP da:

- **Status**: ✅ "Registered" yoki "Online"
- **Registration time**: Ko'rsatiladi
- **Incoming/Outgoing**: Ishlasa kerak

### Loglarda:

```
[SIP] REGISTER request from [IP]:[PORT]
[SIP] Extension 1001 authentication successful
[SIP] Extension 1001 registered
```

## 🔄 Parolni Yangilash

Agar parolni o'zgartirmoqchi bo'lsangiz:

```powershell
# update-extension-password.js faylini o'zgartiring yoki:
node -e "require('dotenv').config(); const Extension = require('./backend/src/database/models/Extension'); Extension.findByUsername('1001').then(ext => Extension.updatePassword(ext.id, 'yangi-parol').then(() => { console.log('Parol yangilandi!'); process.exit(0); }));"
```

## ✅ Xulosa

- ✅ Extension 1001 paroli yangilandi: `123456`
- ✅ SIP Server ishlayapti: Port 5060/UDP
- ✅ MicroSIP orqali ulanish mumkin

**Keyingi Qadam:** MicroSIP ni ochib, sozlamalarni kiriting va Register tugmasini bosing!
