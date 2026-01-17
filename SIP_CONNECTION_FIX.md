# SIP Ulanish Muammosini Hal Qilish - Qadam-baqadam Qo'llanma

## 🔍 Muammo: MicroSIP va Boshqa SIP Client'lar Ulanmayapti

### Qadam 1: Server Loglarini Real-time Kuzatish

**Terminal 1:**
```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50
```

**Keyin Terminal 2 yoki MicroSIP'dan ulanishni urinib ko'ring.**

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

### Qadam 2: Extension Password Qayta O'rnatish

**⚠️ Muhim:** Extension password cache'da bo'lishi kerak!

1. **Admin Panel → Extensions**
2. Extension'ni tanlang (masalan: 1001)
3. **✏️ Tahrirlash** tugmasini bosing
4. **Password** maydoniga yangi password kiriting (kamida 6 belgi)
5. **Saqlash** tugmasini bosing

**Natija:** Password SIP cache'ga saqlanadi va SIP autentifikatsiya uchun ishlatiladi.

**Yoki yangi extension yarating:**
1. Extensions → + Extension Qo'shish
2. Username va Password kiriting
3. Qo'shish tugmasini bosing

### Qadam 3: MicroSIP Sozlamalari

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

### Qadam 4: Firewall va Network Tekshirish

```bash
# Port 5060/UDP ochiqligini tekshirish
ss -tuln | grep 5060

# Firewall tekshirish
ufw status | grep 5060
iptables -L -n | grep 5060

# DNS resolution tekshirish
nslookup call.soundz.uz
ping call.soundz.uz
```

**Kutilyotgan natijalar:**
- Port 5060/UDP ochiq ✅
- DNS resolution ishlayapti ✅

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

### Muammo 2: 401 Unauthorized (Keyin 403 Forbidden)

**Sabab:** Password cache'da yo'q yoki noto'g'ri

**Yechim:**
1. Extension password'ni qayta o'rnating (admin paneldan)
2. Yoki yangi extension yarating

### Muammo 3: 408 Request Timeout

**Sabab:** Server javob bermayapti

**Yechim:**
1. Server loglarini tekshiring
2. Firewall sozlamalarini tekshiring
3. Port 5060/UDP ochiqligini tekshiring

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

3. **Server Loglarini Real-time Kuzatish:**
   ```bash
   pm2 logs pbx-system --lines 50
   ```
