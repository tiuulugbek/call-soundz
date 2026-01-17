# SIP Ulanish Muammosini Hal Qilish - Qadam-baqadam Qo'llanma

## ✅ Hal Qilingan Muammolar

### 1. Validation Error (Extension Tahrirlash)
- ✅ **Muammo:** Extension tahrirlashda "Validation error" xatosi
- ✅ **Yechim:** `updateExtension` schema'ga `password` maydoni qo'shildi (ixtiyoriy)
- ✅ **Natija:** Endi extension password bilan yoki passwordsiz yangilanishi mumkin

## 🔍 SIP Ulanish Muammosini Tekshirish

### Qadam 1: Server Status Tekshirish

```bash
pm2 status pbx-system
```

**Kutilyotgan natija:** `status: online` ✅

### Qadam 2: Port Tekshirish

```bash
ss -tuln | grep 5060
```

**Kutilyotgan natija:**
```
udp   UNCONN 0      0            0.0.0.0:5060       0.0.0.0:*
```

### Qadam 3: Firewall Tekshirish

```bash
ufw status | grep 5060
iptables -L -n | grep 5060
```

**Kutilyotgan natija:** Port 5060/UDP ochiq bo'lishi kerak ✅

### Qadam 4: Server Loglarini Real-time Kuzatish

```bash
pm2 logs pbx-system --lines 50
```

**Keyin MicroSIP'dan ulanishni urinib ko'ring va loglarda quyidagilar ko'rinishi kerak:**

```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Request: REGISTER sip:call.soundz.uz SIP/2.0
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for 1001 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
```

## 🚨 Muammo Turlari va Yechimlari

### Muammo 1: Loglarda Hech Narsa Ko'rinmaydi

**Sabab:** SIP xabarlar serverga yetib bormayapti

**Yechimlar:**

1. **DNS Tekshirish:**
   ```bash
   nslookup call.soundz.uz
   dig call.soundz.uz
   ```

2. **Network Tekshirish:**
   ```bash
   ping call.soundz.uz
   ```

3. **Public IP Tekshirish:**
   ```bash
   curl ifconfig.me
   hostname -I
   ```

4. **MicroSIP Sozlamalari:**
   - Domain: `call.soundz.uz` (to'g'ri)
   - Server: `call.soundz.uz` yoki bo'sh
   - Port: `5060`
   - Transport: `UDP`
   - **STUN: O'chirilgan** ⚠️

### Muammo 2: 401 Unauthorized (Keyin 403 Forbidden)

**Sabab:** Password cache'da yo'q yoki noto'g'ri

**Yechim:**

1. **Extension Password'ni Qayta O'rnatish:**
   - Admin panel → Extensions
   - Extension'ni tanlang (masalan: 1001)
   - ✏️ Tahrirlash tugmasini bosing
   - Password maydoniga yangi password kiriting
   - Saqlash tugmasini bosing

2. **Yoki Yangi Extension Yaratish:**
   - Admin panel → Extensions → + Extension Qo'shish
   - Username va Password kiriting
   - Extension yaratilgandan keyin password cache'ga saqlanadi

### Muammo 3: 408 Request Timeout

**Sabab:** Server javob bermayapti

**Yechimlar:**

1. **Server Loglarini Tekshirish:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```

2. **Via Header Tuzatildi:**
   - ✅ `received` parametri qo'shildi
   - ✅ `rport` parametri qo'shildi
   - ✅ Barcha response'larda to'g'ri qaytariladi

3. **Server Restart:**
   ```bash
   pm2 restart pbx-system
   ```

### Muammo 4: 503 Service Unavailable

**Sabab:** Autentifikatsiya muammosi

**Yechim:**

1. Extension password'ni qayta o'rnating
2. Server loglarini tekshiring:
   ```bash
   pm2 logs pbx-system | grep "password\|auth\|401\|403"
   ```

## 📋 MicroSIP To'g'ri Sozlash

### Account Settings

```
Domain: call.soundz.uz
Username: [Extension username, masalan: 1001]
Password: [Extension password]
Display Name: [Ixtiyoriy]
```

### Advanced Settings

```
✅ Register: Enabled
✅ Publish: Enabled
❌ Use SRV: Disabled
❌ Use STUN: Disabled ⚠️ MUHIM!
❌ Use ICE: Disabled
✅ Use RTP keep-alive: Enabled
✅ Use SIP keep-alive: Enabled
```

### Network Settings

```
Local port: 5060 (yoki boshqa port)
STUN server: Bo'sh
RTP port range: 10000-20000
```

## 🔧 Test Qilish

### 1. Extension Yaratish va Password Tekshirish

1. Admin panelga kiring
2. Extensions → + Extension Qo'shish
3. Username: `test1001`
4. Password: `test123456`
5. Qo'shish tugmasini bosing
6. SIP ma'lumotlari ko'rsatilishi kerak

### 2. MicroSIP Ulanish

1. MicroSIP → Settings → Accounts → Add
2. Quyidagi ma'lumotlarni kiriting:
   ```
   Domain: call.soundz.uz
   Username: test1001
   Password: test123456
   ```
3. Advanced sozlamalarida:
   - STUN: O'chirilgan
   - SIP keep-alive: Enabled
4. Register tugmasini bosing

### 3. Server Loglarini Kuzatish

```bash
pm2 logs pbx-system --lines 50 | grep "\[SIP\]"
```

**Kutilyotgan natijalar:**

✅ **Muvaffaqiyatli:**
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for test1001 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Processing REGISTER from X.X.X.X:XXXXX
Extension test1001 registered from X.X.X.X:XXXXX
```

❌ **Xato:**
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for test1001 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Authentication failed for test1001
[SIP] Sending response 403 Forbidden to X.X.X.X:XXXXX
```

## 🎯 Keyingi Qadamlar

1. **Extension Password'ni Qayta O'rnatish:**
   - Mavjud extensionlar uchun password'ni qayta o'rnating
   - Yoki yangi extension yarating

2. **MicroSIP Sozlamalarini Tekshirish:**
   - STUN o'chirilganligini tekshiring
   - Domain to'g'riligini tekshiring
   - Port to'g'riligini tekshiring

3. **Server Loglarini Real-time Kuzatish:**
   ```bash
   pm2 logs pbx-system --lines 50
   ```

4. **Test Qilish:**
   - Yangi extension yarating
   - MicroSIP'dan ulanishni urinib ko'ring
   - Loglarda nima ko'rinishini kuzating

## 📞 Yordam

Agar muammo davom etsa:

1. **Server loglarini yuboring:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```

2. **Extension ma'lumotlarini yuboring:**
   - Username
   - Password (qayta o'rnatilganmi?)

3. **MicroSIP sozlamalarini screenshot qiling**

4. **Xato xabarlarini yuboring**

## ✅ Tuzatilgan Muammolar

1. ✅ Validation error (Extension tahrirlash)
2. ✅ Via header (received va rport parametrlari)
3. ✅ SIP account ma'lumotlari (server domain)
4. ✅ Password cache tizimi
5. ✅ Extension password qayta o'rnatish

**Tizim endi ishlashga tayyor!**
