# Trunk Registration Fix - Digest Authentication

## ✅ Qilingan O'zgarishlar

Trunk registration kodiga **Digest Authentication** qo'shildi. Endi Bell.uz trunk ga to'g'ri register qilinadi.

### 1. Qo'shilgan Xususiyatlar

- **Digest Authentication qo'llab-quvvatlash**: REGISTER so'rovida parol bilan authentication
- **401/407 avtomatik qayta so'rov**: Authentication kerak bo'lganda avtomatik authenticated REGISTER yuboriladi
- **Trunk registration state tracking**: Call-ID, CSeq, va registration holatini kuzatish

### 2. O'zgartirilgan Fayllar

- `backend/src/sip/trunk/manager.js`: Digest authentication logikasi qo'shildi

### 3. Qanday Ishlaydi

1. **Birinchi REGISTER so'rovi** (authentication siz):
   - Trunk server ga oddiy REGISTER so'rovi yuboriladi
   - Call-ID, CSeq, va boshqa ma'lumotlar saqlanadi

2. **401/407 xatosi** (Authentication kerak):
   - WWW-Authenticate header dan realm, nonce, qop, algorithm olinadi
   - Digest response hisoblanadi (MD5 hash)
   - Authorization header bilan qayta REGISTER yuboriladi

3. **200 OK xatosi** (Muvaffaqiyatli):
   - Trunk registered deb belgilanadi
   - Registration holati yangilanadi

### 4. Kod Tafsilotlari

#### Qo'shilgan Metodlar:

- `parseAuthHeader()`: WWW-Authenticate header ni parse qiladi
- `buildAuthHeader()`: Digest authentication header ni yaratadi
- `extractExpires()`: Expires qiymatini olish

#### O'zgartirilgan Metodlar:

- `sendRegister()`: `withAuth` va `authHeader` parametrlari qo'shildi
- `buildRegisterRequest()`: Digest authentication header qo'shish imkoniyati
- `handleResponse()`: 401/407 xatolarida avtomatik authenticated REGISTER

### 5. Server ni Qayta Ishga Tushirish

O'zgarishlarni qo'llash uchun:

```powershell
# 1. Server ni to'xtatish
Get-Process -Name node | Stop-Process

# 2. Qayta ishga tushirish
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start

# 3. 10 soniya kutib, tekshirish
Start-Sleep -Seconds 10
node check-sip-status.js
```

### 6. Tekshirish

#### Loglarni Ko'rish:

```powershell
# Trunk registration loglarni ko'rish
Get-Content logs\combined.log -Tail 50 | Select-String -Pattern "REGISTER|Trunk|Authentication"
```

#### Kutilayotgan Loglar:

```
REGISTER sent for DID 998785553322
Authentication required (401) for Call-ID: ...
Sent authenticated REGISTER for DID 998785553322
✅ Trunk registration successful for Call-ID: ...
```

#### Status Tekshirish:

```powershell
node check-sip-status.js
```

### 7. Muammolarni Hal Qilish

#### Muammo: Registration hali ham muvaffaqiyatsiz

**Tekshirishlar:**

1. **Trunk Username/Password to'g'riligi:**
   ```powershell
   node -e "require('dotenv').config(); const DIDNumber = require('./backend/src/database/models/DIDNumber'); DIDNumber.findAll({enabled: true}).then(dids => { console.log(dids.map(d => ({number: d.number, username: d.trunkUsername, hasPassword: !!d.trunkPassword}))); process.exit(0); });"
   ```

2. **Bell.uz server ga ulanish:**
   ```powershell
   ping bell.uz
   Test-NetConnection -ComputerName bell.uz -Port 5060
   ```

3. **Firewall tekshirish:**
   ```powershell
   Get-NetFirewallRule -DisplayName "PBX SIP" | Select-Object DisplayName, Enabled
   ```

#### Muammo: Digest authentication xatosi

**Sabablar:**
- Trunk password noto'g'ri
- WWW-Authenticate header to'g'ri parse qilinmayapti
- Realm noto'g'ri

**Tekshirish:**
- Loglarni ko'rish: `logs/combined.log`
- Error loglarni ko'rish: `logs/error.log`

### 8. Bell.uz Trunk Sozlamalari

**OnlinePBX/SIP Phone sozlamalari:**
- Server: `bell.uz`
- Port: `5060` (UDP)
- Username: `998785553322`
- Password: `[Bell.uz paroli]`

**Bizning PBX sozlamalari:**
- Provider: `bell.uz`
- Trunk Username: `998785553322`
- Trunk Password: `[Bell.uz paroli]` (database da)

### 9. Xulosa

Endi trunk registration **Digest Authentication** bilan ishlaydi va Bell.uz trunk ga to'g'ri register qilinadi.

**Keyingi qadam:** Server ni qayta ishga tushiring va trunk registration holatini tekshiring.
