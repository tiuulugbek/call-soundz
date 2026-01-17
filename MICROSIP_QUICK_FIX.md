# MicroSIP Ulanish Muammosini Hal Qilish - Tezkor Yechim

## 🚨 Asosiy Muammo: MicroSIP Ulanmayapti

### ✅ Server Holati

**Hozirgi holat:**
- ✅ Server ishlayapti (`status: online`)
- ✅ Port 5060/UDP ochiq (`udp   UNCONN 0      0            0.0.0.0:5060`)
- ✅ SIP Registrar ishlayapti (`SIP Registrar started on 0.0.0.0:5060`)
- ❌ SIP xabarlar logda ko'rinmayapti (xabarlar yetib bormayapti)

## 🔍 Eng Keng Tarqalgan Sabab: Extension Password Cache'da Yo'q

### ⚠️ MUHIM: Extension Password Cache'da Bo'lishi Kerak!

**Muammo:** Eski extensionlar uchun password cache'da bo'lmasligi mumkin.

**Yechim - Qadam 1: Extension Password Qayta O'rnatish**

1. **Admin Panel → Extensions**
2. Extension'ni tanlang (masalan: 1001)
3. **✏️ Tahrirlash** tugmasini bosing
4. **Password** maydoniga yangi password kiriting (kamida 6 belgi, masalan: `newpass123`)
5. **Saqlash** tugmasini bosing

**Natija:** Password SIP cache'ga saqlanadi va SIP autentifikatsiya uchun ishlatiladi.

**Yoki - Qadam 2: Yangi Extension Yaratish**

1. **Extensions → + Extension Qo'shish**
2. Username va Password kiriting (masalan: `test1001` va `test123456`)
3. **Qo'shish** tugmasini bosing

**Natija:** Yangi extension yaratilganda password avtomatik cache'ga saqlanadi.

## 📋 MicroSIP Sozlamalari (To'g'ri Sozlash)

### Account Settings

```
Domain: call.soundz.uz
Username: [Extension username, masalan: 1001]
Password: [Qayta o'rnatilgan yoki yangi password]
Port: 5060
Transport: UDP
```

### Advanced Settings (MUHIM!)

```
✅ Register: Enabled
❌ Use STUN: Disabled ⚠️ MUHIM - O'chirilishi kerak!
✅ Use SIP keep-alive: Enabled
✅ Use RTP keep-alive: Enabled
```

**⚠️ Muhim:** STUN o'chirilgan bo'lishi kerak! Aks holda timeout xatosi bo'lishi mumkin.

## 🔍 Real-time Test Qilish

### Terminal 1: Server Loglarini Kuzatish

```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50
```

### Terminal 2 yoki MicroSIP:

1. **Extension password'ni qayta o'rnating** (yuxoridagi qadam 1 yoki 2)
2. **MicroSIP'da account qo'shing:**
   - Domain: `call.soundz.uz`
   - Username: [Extension username]
   - Password: [Qayta o'rnatilgan password]
   - Port: `5060`
   - STUN: **O'chirilgan** ⚠️
3. **Register tugmasini bosing**

### Kutilyotgan Natijalar (Terminal 1'da)

**Agar ulanish ishlasa:**
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
- Tekshirish: DNS, Network, Firewall, MicroSIP sozlamalari

## 🚨 Eng Keng Tarqalgan Muammolar

### Muammo 1: Loglarda Hech Narsa Ko'rinmaydi

**Sabab:** SIP xabarlar serverga yetib bormayapti

**Tekshirish:**

1. **DNS:**
   ```bash
   nslookup call.soundz.uz
   ```
   **Kutilyotgan natija:** IP address ko'rsatilishi kerak ✅

2. **Network:**
   ```bash
   ping call.soundz.uz
   ```
   **Kutilyotgan natija:** Packet loss 0% yoki past ✅

3. **Firewall:**
   ```bash
   ufw status | grep 5060
   ```
   **Kutilyotgan natija:** `5060/udp ALLOW` ✅

4. **MicroSIP Sozlamalari:**
   - Domain: `call.soundz.uz` (to'g'ri) ✅
   - Port: `5060` (to'g'ri) ✅
   - **STUN: O'chirilgan** ⚠️ MUHIM!

**Yechim:**
- MicroSIP sozlamalarida STUN o'chirilganligini tekshiring
- Domain to'g'riligini tekshiring
- Port to'g'riligini tekshiring

### Muammo 2: 401 Unauthorized (Keyin 403 Forbidden)

**Sabab:** Password cache'da yo'q yoki noto'g'ri

**Yechim:**
1. Extension password'ni qayta o'rnating (admin paneldan)
2. Yoki yangi extension yarating

**Tekshirish:**
- Password cache'da mavjudligini tekshiring (password qayta o'rnatilgandan keyin log'da ko'rinishi kerak)
- Server loglarini tekshiring:
  ```bash
  pm2 logs pbx-system | grep "password\|cache\|401\|403"
  ```

### Muammo 3: 408 Request Timeout

**Sabab:** Server javob bermayapti

**Yechim:**
1. Server loglarini tekshiring:
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```

2. Firewall sozlamalarini tekshiring
3. Port 5060/UDP ochiqligini tekshiring

### Muammo 4: DNS Timeout (STUN Error)

**Sabab:** STUN yoqilgan yoki DNS muammosi

**Yechim:**
1. **STUN o'chirilganligini tekshiring** (MicroSIP'da)
2. DNS resolution'ni tekshiring:
   ```bash
   nslookup call.soundz.uz
   ```

## 📋 Test Qilish - Qadam-baqadam

### Test 1: Yangi Extension Yaratish va MicroSIP

1. **Admin Panel → Extensions → + Extension Qo'shish**
   - Username: `test1001`
   - Password: `test123456`
   - Qo'shish tugmasini bosing

2. **MicroSIP → Settings → Accounts → Add**
   - Domain: `call.soundz.uz`
   - Username: `test1001`
   - Password: `test123456`
   - Port: `5060`
   - Transport: `UDP`
   - **STUN: O'chirilgan** ⚠️ MUHIM!
   - Register: ✅ Enabled
   - SIP keep-alive: ✅ Enabled

3. **Register tugmasini bosing**

4. **Server loglarini kuzating (Terminal):**
   ```bash
   cd /root/pbx-system
   pm2 logs pbx-system --lines 50 | grep "\[SIP\]"
   ```

**Kutilyotgan natija:**
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for test1001 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
Extension test1001 registered from X.X.X.X:XXXXX
```

### Test 2: Mavjud Extension Password Qayta O'rnatish

1. **Admin Panel → Extensions**
2. Extension tanlang (masalan: 1001)
3. **✏️ Tahrirlash** tugmasini bosing
4. **Password** maydoniga yangi password kiriting (masalan: `newpass123`)
5. **Saqlash** tugmasini bosing

6. **MicroSIP'da password'ni yangilang**

7. **Register tugmasini bosing**

8. **Server loglarini kuzating**

## 🎯 Xulosa

### ✅ Ishlayapti

1. Server ishlayapti (`status: online`) ✅
2. Port 5060/UDP ochiq ✅
3. SIP Registrar ishlayapti ✅

### ⚠️ Tekshirish Kerak

1. **Extension password cache'da mavjudmi?**
   - Password qayta o'rnatilganmi?
   - Yoki yangi extension yaratilganmi?

2. **MicroSIP sozlamalari to'g'rimi?**
   - Domain: `call.soundz.uz` ✅
   - Port: `5060` ✅
   - **STUN: O'chirilgan** ⚠️

3. **SIP xabarlar serverga yetib bormoqdamimi?**
   - Loglarda `[SIP] Received message...` ko'rinadimi?
   - Yoki hech narsa ko'rinmayaptimi?

### 📝 Keyingi Qadamlar

1. **Extension Password Qayta O'rnatish:**
   - Admin Panel → Extensions → Extension tanlang → ✏️ Tahrirlash
   - Password maydoniga yangi password kiriting (6+ belgi)
   - Saqlash

2. **MicroSIP Test:**
   - Yangi extension yarating (yoki password qayta o'rnating)
   - MicroSIP'da account qo'shing (STUN o'chirilgan)
   - Register tugmasini bosing
   - Loglarni kuzating

3. **Real-time Loglarni Kuzatish:**
   ```bash
   cd /root/pbx-system
   pm2 logs pbx-system --lines 50
   ```
   Keyin MicroSIP'dan ulanishni urinib ko'ring

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

4. **Network test natijalarini:**
   ```bash
   nslookup call.soundz.uz
   ping call.soundz.uz
   ss -tuln | grep 5060
   ```
