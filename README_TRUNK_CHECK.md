# Bell.uz Trunk va MicroSIP Ulanish Tekshirish

## ⚠️ Muhim: To'g'ri Path

**Trunk status script:**
```bash
cd /root/pbx-system
node check-trunk-status.js
```

**⚠️ Eslatma:** Fayl `/root/pbx-system/` papkasida, `/root/acoustic-bonus/backend/` emas!

## ✅ Trunk Status Script Natijasi

**Script ishlayapti:**
- ✅ REGISTER request sent successfully
- ⚠️ No response received (bu normal bo'lishi mumkin)

**Sabab:**
- Trunk server digest authentication kerak bo'lishi mumkin
- Firewall javobni to'sib qo'yishi mumkin
- Trunk server javob bermayotgan bo'lishi mumkin

## 📋 MicroSIP Ulanish Muammosini Hal Qilish

### Qadam 1: Extension Password Qayta O'rnatish

**⚠️ Muhim:** Extension password cache'da bo'lishi kerak!

1. **Admin Panel → Extensions**
2. Extension'ni tanlang (masalan: 1001)
3. **✏️ Tahrirlash** tugmasini bosing
4. **Password** maydoniga yangi password kiriting (kamida 6 belgi)
5. **Saqlash** tugmasini bosing

**Natija:** Password SIP cache'ga saqlanadi va SIP autentifikatsiya uchun ishlatiladi.

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

**Terminal 1:**
```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50
```

**Terminal 2 yoki boshqa oynada:**
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

## 🔍 Bell.uz Trunk Ulanishini Tekshirish

### Qadam 1: Trunk Status Script

```bash
cd /root/pbx-system
node check-trunk-status.js
```

**Natija Tahlili:**
- ✅ Request sent - Network bor ✅
- ⚠️ No response - Normal bo'lishi mumkin (auth kerak)

### Qadam 2: DID Number Sozlamalari

**Admin Panel → DID Numbers:**
1. DID number'ni tanlang
2. Quyidagilarni tekshiring:
   - ✅ Provider: `bell.uz`
   - ✅ Trunk Username: `99785553322` (yoki to'g'ri username)
   - ✅ Trunk Password: [trunk password] ⚠️ MUHIM!
   - ✅ Enabled: ✅ (checked)

### Qadam 3: DNS va Network Tekshirish

```bash
# DNS Resolution
nslookup bell.uz
dig bell.uz

# Network Connectivity
ping bell.uz
```

**Kutilyotgan natijalar:**
- ✅ DNS resolution ishlayapti
- ✅ Network connectivity bor

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

4. **MicroSIP Sozlamalari:**
   - Domain: `call.soundz.uz` (to'g'ri)
   - Port: `5060`
   - **STUN: O'chirilgan** ⚠️

**Yechim:**
- MicroSIP sozlamalarida STUN o'chirilganligini tekshiring
- Domain to'g'riligini tekshiring
- Port to'g'riligini tekshiring

### Muammo 2: Extension Password Cache'da Yo'q

**Sabab:** Eski extensionlar uchun password cache'da bo'lmasligi mumkin

**Yechim:**
1. Extension password'ni qayta o'rnating (admin paneldan)
2. Yoki yangi extension yarating

**Tekshirish:**
- Extension password qayta o'rnatilgandan keyin SIP cache'ga saqlanadi
- Loglarda: `[Extension] Password cache updated for...` ko'rinishi kerak

### Muammo 3: Trunk Server Javob Bermayapti

**Bu normal bo'lishi mumkin:**
- Trunk server digest authentication kerak bo'lishi mumkin
- Firewall javobni to'sib qo'yishi mumkin
- Trunk server ishlamayotgan bo'lishi mumkin

**Yechim:**
- Trunk password DID number sozlamalarida mavjudligini tekshiring
- DNS va network connectivity'ni tekshiring

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
   cd /root/pbx-system
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
   cd /root/pbx-system
   node check-trunk-status.js
   ```

3. **DNS va Network tekshiring:**
   ```bash
   nslookup bell.uz
   ping bell.uz
   ```

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

## 📞 Yordam

Agar muammo davom etsa:

1. **Server loglarini yuboring:**
   ```bash
   cd /root/pbx-system
   pm2 logs pbx-system --lines 100
   ```

2. **Extension ma'lumotlarini yuboring:**
   - Username
   - Password (qayta o'rnatilganmi?)

3. **MicroSIP sozlamalarini** (screenshot)

4. **Trunk status natijasini yuboring:**
   ```bash
   cd /root/pbx-system
   node check-trunk-status.js
   ```
