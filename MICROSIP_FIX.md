# MicroSIP Ulanish Muammosini Hal Qilish - Qadam-baqadam Qo'llanma

## 🔍 Muammo: MicroSIP Ulanmayapti

### Qadam 1: Extension Password'ni Qayta O'rnatish

**⚠️ MUHIM:** Extension password cache'da bo'lishi kerak!

1. **Admin Panel → Extensions**
2. Extension'ni tanlang (masalan: 1001)
3. **✏️ Tahrirlash** tugmasini bosing
4. **Password** maydoniga yangi password kiriting (kamida 6 belgi)
5. **Saqlash** tugmasini bosing

**Natija:** Password SIP cache'ga saqlanadi va SIP autentifikatsiya uchun ishlatiladi.

### Qadam 2: Yangi Extension Yaratish

**Yoki yangi extension yarating:**
1. **Extensions → + Extension Qo'shish**
2. Username va Password kiriting (masalan: `test1001` va `test123456`)
3. **Qo'shish** tugmasini bosing

**Natija:** Yangi extension yaratilganda password avtomatik cache'ga saqlanadi.

### Qadam 3: MicroSIP Sozlamalari

**Account Settings:**
```
Domain: call.soundz.uz
Username: [Extension username, masalan: 1001]
Password: [Qayta o'rnatilgan yoki yangi password]
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

**⚠️ Muhim:** STUN o'chirilgan bo'lishi kerak!

### Qadam 4: Server Loglarini Real-time Kuzatish

**Terminal 1:**
```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50
```

**Terminal 2 yoki MicroSIP:**
- MicroSIP'dan ulanishni urinib ko'ring

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
- Tekshirish: DNS, Network, Firewall, MicroSIP sozlamalari

### Qadam 5: DNS va Network Tekshirish

```bash
# DNS Resolution
nslookup call.soundz.uz
dig call.soundz.uz

# Network Connectivity
ping call.soundz.uz
```

**Kutilyotgan natijalar:**
- ✅ DNS resolution ishlayapti
- ✅ Network connectivity bor

### Qadam 6: Firewall Tekshirish

```bash
# Port 5060/UDP ochiqligini tekshirish
ss -tuln | grep 5060

# Firewall sozlamalari
ufw status | grep 5060
iptables -L -n | grep 5060
```

**Kutilyotgan natijalar:**
```
udp   UNCONN 0      0            0.0.0.0:5060       0.0.0.0:*
```

**Firewall:**
- Port 5060/UDP ochiq bo'lishi kerak ✅

## 🚨 Eng Keng Tarqalgan Muammolar

### Muammo 1: Loglarda Hech Narsa Ko'rinmaydi

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

4. **MicroSIP Sozlamalari:**
   - Domain: `call.soundz.uz` (to'g'ri)
   - Port: `5060`
   - **STUN: O'chirilgan** ⚠️

**Yechim:**
- MicroSIP sozlamalarida STUN o'chirilganligini tekshiring
- Domain to'g'riligini tekshiring
- Port to'g'riligini tekshiring
- Network connectivity'ni tekshiring

### Muammo 2: 401 Unauthorized (Keyin 403 Forbidden)

**Sabab:** Password cache'da yo'q yoki noto'g'ri

**Yechim:**
1. Extension password'ni qayta o'rnating (admin paneldan)
2. Yoki yangi extension yarating

**Tekshirish:**
- Password cache'da mavjudligini tekshiring
- Password to'g'riligini tekshiring
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

### Muammo 4: DNS Timeout

**Sabab:** DNS resolution muammosi yoki STUN muammosi

**Yechim:**
1. STUN o'chirilganligini tekshiring
2. DNS resolution'ni tekshiring:
   ```bash
   nslookup call.soundz.uz
   ```

## 📋 Test Qilish

### Test 1: Yangi Extension va MicroSIP

1. **Yangi extension yarating:**
   - Username: `test1001`
   - Password: `test123456`
   - Qo'shish tugmasini bosing

2. **MicroSIP'da yangi account qo'shing:**
   - Domain: `call.soundz.uz`
   - Username: `test1001`
   - Password: `test123456`
   - Port: `5060`
   - Transport: `UDP`
   - STUN: **O'chirilgan** ⚠️

3. **Register tugmasini bosing**

4. **Server loglarini kuzating:**
   ```bash
   pm2 logs pbx-system --lines 50 | grep "\[SIP\]"
   ```

**Kutilyotgan natija:**
- `[SIP] Received message from...` ✅
- `[SIP] Processing REGISTER...` ✅
- `Extension test1001 registered...` ✅

### Test 2: Mavjud Extension Password Qayta O'rnatish

1. **Extension password'ni qayta o'rnating:**
   - Admin Panel → Extensions
   - Extension tanlang (masalan: 1001)
   - ✏️ Tahrirlash
   - Password maydoniga yangi password kiriting
   - Saqlash

2. **MicroSIP'da password'ni yangilang**

3. **Register tugmasini bosing**

4. **Server loglarini kuzating**

## 🎯 Keyingi Qadamlar

1. **Extension Password Qayta O'rnatish:**
   - Admin panel → Extensions → Extension tanlang → ✏️ Tahrirlash
   - Password maydoniga yangi password kiriting (6+ belgi)
   - Saqlash

2. **MicroSIP Test:**
   - Yangi extension yarating (yoki password qayta o'rnating)
   - MicroSIP'da account qo'shing (STUN o'chirilgan)
   - Register tugmasini bosing
   - Loglarni kuzating

3. **Server Loglarini Real-time Kuzatish:**
   ```bash
   cd /root/pbx-system
   pm2 logs pbx-system --lines 50
   ```

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
