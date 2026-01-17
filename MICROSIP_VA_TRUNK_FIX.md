# MicroSIP va Bell.uz Trunk Ulanish Muammolari - Yechimlar

## 📋 Qisqa Xulosa

### Muammo 1: MicroSIP Ulanmayapti
- **Sabab:** Extension password cache'da yo'q yoki STUN yoqilgan
- **Yechim:** Extension password'ni qayta o'rnating va STUN'ni o'chiring

### Muammo 2: Bell.uz Trunk Ulanishini Tekshirish
- **Script:** `node check-trunk-status.js`
- **Loglar:** `pm2 logs pbx-system | grep -i trunk`
- **Config:** DID number sozlamalarida trunk password tekshirish

## 🔍 MicroSIP Ulanish Muammosini Hal Qilish

### Qadam 1: Extension Password'ni Qayta O'rnatish

1. **Admin Panel → Extensions**
2. Extension'ni tanlang (masalan: 1001)
3. **✏️ Tahrirlash** tugmasini bosing
4. **Password** maydoniga yangi password kiriting (6+ belgi)
5. **Saqlash** tugmasini bosing

**⚠️ Muhim:** Password cache'ga saqlanadi va SIP autentifikatsiya uchun ishlatiladi.

### Qadam 2: MicroSIP Sozlamalari

**Account Settings:**
```
Domain: call.soundz.uz
Username: [Extension username, masalan: 1001]
Password: [Qayta o'rnatilgan password]
Port: 5060
Transport: UDP
```

**Advanced Settings (MUHIM!):**
```
✅ Register: Enabled
❌ Use STUN: Disabled ⚠️ MUHIM - O'chirilishi kerak!
✅ Use SIP keep-alive: Enabled
✅ Use RTP keep-alive: Enabled
```

### Qadam 3: Server Loglarini Real-time Kuzatish

```bash
# Terminal 1: Loglarni kuzatish
pm2 logs pbx-system --lines 50

# Terminal 2: MicroSIP'dan ulanishni urinib ko'ring
```

**Kutilyotgan natijalar (ulanish ishlasa):**
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Request: REGISTER sip:call.soundz.uz SIP/2.0
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for 1001 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Processing REGISTER from X.X.X.X:XXXXX
Extension 1001 registered from X.X.X.X:XXXXX
```

**Agar loglarda hech narsa ko'rinmasa:**
- ❌ SIP xabarlar serverga yetib bormayapti
- Tekshirish: DNS, Network, Firewall

## 🔗 Bell.uz Trunk Ulanishini Tekshirish

### Qadam 1: Trunk Status Script

```bash
cd /root/pbx-system
node check-trunk-status.js
```

**Kutilyotgan natija:**
- ✅ Response received - trunk server javob berayapti
- ⚠️ No response - trunk server javob bermayapti (normal, auth kerak bo'lishi mumkin)

### Qadam 2: Server Loglarini Tekshirish

```bash
pm2 logs pbx-system --lines 100 | grep -E "trunk|bell\.uz|Trunk|SIP Trunk"
```

**Kutilyotgan natijalar:**
- `SIP Trunk Manager listening on port 5061` ✅
- `SIP Trunk Manager initialized` ✅
- `Registering trunk for DID...` ✅
- `REGISTER sent for DID...` ✅

### Qadam 3: Trunk Configuration Tekshirish

**Backend Config:**
```bash
cat backend/src/config/config.js | grep -A 7 "trunk:"
```

**Kutilyotgan natija:**
```javascript
trunk: {
  provider: 'bell.uz',
  server: 'bell.uz',  // yoki TRUNK_SERVER env var
  username: '99785553322',  // yoki TRUNK_USERNAME env var
  password: '',  // TRUNK_PASSWORD env var yoki DID sozlamalarida
  port: 5060,
  transport: 'udp'
}
```

### Qadam 4: DID Number Sozlamalari Tekshirish

**Admin Panel → DID Numbers:**
1. DID number'ni tanlang
2. Quyidagilarni tekshiring:
   - ✅ Provider: `bell.uz`
   - ✅ Trunk Username: `99785553322` (yoki to'g'ri username)
   - ✅ Trunk Password: [trunk password] ⚠️ MUHIM!
   - ✅ Enabled: ✅ (checked)

**⚠️ Muhim:** Trunk password DID number sozlamalarida bo'lishi kerak!

### Qadam 5: DNS Resolution Tekshirish

```bash
nslookup bell.uz
dig bell.uz
```

**Kutilyotgan natija:**
- DNS resolution ishlayapti ✅
- IP address ko'rsatiladi ✅

### Qadam 6: Network Connectivity Tekshirish

```bash
ping bell.uz
```

**Kutilyotgan natija:**
- Network connectivity bor ✅

## 🚨 Eng Keng Tarqalgan Muammolar

### Muammo 1: MicroSIP Loglarda Hech Narsa Ko'rinmaydi

**Sabab:** SIP xabarlar serverga yetib bormayapti

**Tekshirish:**
1. **DNS:**
   ```bash
   nslookup call.soundz.uz
   ```

2. **Network:**
   ```bash
   ping call.soundz.uz
   ```

3. **Firewall:**
   ```bash
   ufw status | grep 5060
   ```

**Yechim:**
- MicroSIP sozlamalarida STUN o'chirilganligini tekshiring
- Domain to'g'riligini tekshiring (`call.soundz.uz`)
- Port to'g'riligini tekshiring (`5060`)

### Muammo 2: Extension Password Cache'da Yo'q

**Sabab:** Eski extensionlar uchun password cache'da bo'lmasligi mumkin

**Yechim:**
1. Extension password'ni qayta o'rnating (admin paneldan)
2. Yoki yangi extension yarating

### Muammo 3: Trunk Server Javob Bermayapti

**Sabab:** Trunk server yetib bo'lmayapti yoki javob bermayapti

**Tekshirish:**
1. **DNS:**
   ```bash
   nslookup bell.uz
   ```

2. **Network:**
   ```bash
   ping bell.uz
   ```

3. **Firewall:**
   ```bash
   ufw status
   ```

**Yechim:**
- Trunk password DID number sozlamalarida mavjudmi?
- Trunk server (bell.uz) DNS'da resolve qilinadimi?

## 📋 Test Qilish

### Test 1: MicroSIP Ulanish

1. **Yangi extension yarating:**
   - Username: `test1001`
   - Password: `test123456`

2. **MicroSIP'da yangi account qo'shing:**
   - Domain: `call.soundz.uz`
   - Username: `test1001`
   - Password: `test123456`
   - STUN: **O'chirilgan**

3. **Register tugmasini bosing**

4. **Server loglarini kuzating:**
   ```bash
   pm2 logs pbx-system --lines 50 | grep "\[SIP\]"
   ```

**Kutilyotgan natija:**
- `[SIP] Received message from...` ✅
- `[SIP] Processing REGISTER...` ✅
- `Extension test1001 registered...` ✅

### Test 2: Trunk Ulanish

1. **DID number yarating/yangilang:**
   - Provider: `bell.uz`
   - Trunk Username: `99785553322`
   - Trunk Password: [trunk password]
   - Enabled: ✅

2. **Trunk status script ishga tushiring:**
   ```bash
   node check-trunk-status.js
   ```

3. **Server loglarini kuzating:**
   ```bash
   pm2 logs pbx-system --lines 50 | grep -i trunk
   ```

**Kutilyotgan natija:**
- `SIP Trunk Manager initialized` ✅
- `Registering trunk for DID...` ✅

## 🎯 Keyingi Qadamlar

1. **Extension Password Qayta O'rnatish:**
   - Admin panel → Extensions → Extension tanlang → ✏️ Tahrirlash
   - Password maydoniga yangi password kiriting
   - Saqlash

2. **MicroSIP Test:**
   - Yangi extension yarating
   - MicroSIP'da account qo'shing (STUN o'chirilgan)
   - Register tugmasini bosing
   - Loglarni kuzating

3. **Trunk Test:**
   - DID number sozlamalarida trunk password tekshiring
   - Trunk status script ishga tushiring
   - Server loglarini kuzating

## 📞 Yordam

Agar muammo davom etsa:

1. **Server loglarini yuboring:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```

2. **Extension ma'lumotlarini yuboring:**
   - Username
   - Password (qayta o'rnatilganmi?)

3. **MicroSIP sozlamalarini** (screenshot)

4. **Trunk status natijasini yuboring:**
   ```bash
   node check-trunk-status.js
   ```
