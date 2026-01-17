# SIP Ulanish va Trunk Ulanish Diagnostikasi

## 🔍 Muammo: MicroSIP Ulanmayapti va Bell.uz Trunk Ulanishini Tekshirish

### 1. MicroSIP Ulanish Muammosini Tekshirish

#### Qadam 1: Server Status Tekshirish

```bash
pm2 status pbx-system
```

**Kutilyotgan natija:** `status: online` ✅

#### Qadam 2: SIP Port Tekshirish

```bash
ss -tuln | grep 5060
```

**Kutilyotgan natija:**
```
udp   UNCONN 0      0            0.0.0.0:5060       0.0.0.0:*
```

#### Qadam 3: Server Loglarini Real-time Kuzatish

```bash
# Terminal 1: Loglarni kuzatish
pm2 logs pbx-system --lines 50

# Terminal 2 yoki boshqa: MicroSIP'dan ulanishni urinib ko'ring
```

**Kutilyotgan natijalar (ulanish ishlasa):**
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Request: REGISTER sip:call.soundz.uz SIP/2.0
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for 1001 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
```

**Agar loglarda hech narsa ko'rinmasa:**
- SIP xabarlar serverga yetib bormayapti ❌
- Network/Firewall muammosi bo'lishi mumkin
- MicroSIP sozlamalari noto'g'ri bo'lishi mumkin

#### Qadam 4: Extension Password Tekshirish

**Muammo:** Extension password cache'da yo'q bo'lishi mumkin

**Yechim:**
1. **Admin Panel → Extensions**
2. Extension'ni tanlang (masalan: 1001)
3. **✏️ Tahrirlash** tugmasini bosing
4. **Password** maydoniga yangi password kiriting
5. **Saqlash** tugmasini bosing

Yoki **yangi extension yarating:**
1. **Extensions → + Extension Qo'shish**
2. Username va Password kiriting
3. **Qo'shish** tugmasini bosing

#### Qadam 5: MicroSIP Sozlamalari Tekshirish

**Account Settings:**
```
Domain: call.soundz.uz
Username: [Extension username, masalan: 1001]
Password: [Extension password - qayta o'rnatilgandan keyin]
Port: 5060
Transport: UDP
```

**Advanced Settings (MUHIM!):**
```
✅ Register: Enabled
❌ Use STUN: Disabled ⚠️ MUHIM!
✅ Use SIP keep-alive: Enabled
✅ Use RTP keep-alive: Enabled
```

### 2. Bell.uz Trunk Ulanishini Tekshirish

#### Qadam 1: Trunk Status Script

```bash
cd /root/pbx-system
node check-trunk-status.js
```

**Kutilyotgan natija:**
- ✅ Response received - trunk server javob berayapti
- ⚠️ No response - trunk server javob bermayapti

#### Qadam 2: Server Loglarini Tekshirish

```bash
pm2 logs pbx-system --lines 100 | grep -E "trunk|bell\.uz|Trunk|REGISTER"
```

**Kutilyotgan natijalar:**
- `SIP Trunk Manager initialized` - Trunk manager ishga tushdi ✅
- `Registering trunk for DID...` - DID uchun trunk register qilinmoqda ✅
- `REGISTER sent for DID...` - REGISTER request yuborildi ✅
- `✅ Trunk registration successful` - Muvaffaqiyatli ro'yxatdan o'tdi ✅

#### Qadam 3: Trunk Configuration Tekshirish

**Backend Config:**
```bash
cat backend/src/config/config.js | grep -A 5 "trunk:"
```

**Kutilyotgan natija:**
```javascript
trunk: {
  provider: 'bell.uz',
  server: process.env.TRUNK_SERVER || 'bell.uz',
  username: process.env.TRUNK_USERNAME || '99785553322',
  password: process.env.TRUNK_PASSWORD || '',
  port: parseInt(process.env.TRUNK_PORT) || 5060,
  transport: process.env.TRUNK_TRANSPORT || 'udp'
}
```

#### Qadam 4: DID Number Sozlamalari Tekshirish

**Admin Panel → DID Numbers** da:
- ✅ DID number mavjud
- ✅ Provider: `bell.uz`
- ✅ Trunk Username: `99785553322` (yoki to'g'ri username)
- ✅ Trunk Password: [password] - **MUHIM!**
- ✅ Enabled: ✅ (checked)

#### Qadam 5: DNS Resolution Tekshirish

```bash
nslookup bell.uz
dig bell.uz
```

**Kutilyotgan natija:**
- DNS resolution ishlayapti ✅
- IP address ko'rsatiladi ✅

#### Qadam 6: Network Connectivity Tekshirish

```bash
ping bell.uz
```

**Kutilyotgan natija:**
- Network connectivity bor ✅

## 🚨 Eng Keng Tarqalgan Muammolar

### Muammo 1: MicroSIP Loglarda Hech Narsa Ko'rinmaydi

**Sabab:** SIP xabarlar serverga yetib bormayapti

**Yechimlar:**
1. MicroSIP sozlamalarini tekshiring:
   - Domain: `call.soundz.uz` (to'g'ri)
   - Server: `call.soundz.uz` yoki bo'sh
   - Port: `5060`
   - STUN: **O'chirilgan** ⚠️

2. Network tekshirish:
   ```bash
   nslookup call.soundz.uz
   ping call.soundz.uz
   ```

3. Firewall tekshirish:
   ```bash
   ufw status | grep 5060
   iptables -L -n | grep 5060
   ```

### Muammo 2: Extension Password Cache'da Yo'q

**Sabab:** Eski extensionlar uchun password cache'da bo'lmasligi mumkin

**Yechim:**
1. Extension password'ni qayta o'rnating (admin paneldan)
2. Yoki yangi extension yarating

### Muammo 3: Trunk Server Javob Bermayapti

**Sabab:** Trunk server yetib bo'lmayapti yoki javob bermayapti

**Yechimlar:**
1. DNS resolution tekshiring:
   ```bash
   nslookup bell.uz
   ```

2. Network connectivity tekshiring:
   ```bash
   ping bell.uz
   ```

3. Firewall tekshiring:
   ```bash
   ufw status
   iptables -L -n
   ```

4. Trunk password tekshiring:
   - DID number sozlamalarida trunk password mavjudmi?
   - Yoki `TRUNK_PASSWORD` environment variable o'rnatilganmi?

### Muammo 4: 401 Unauthorized (Trunk)

**Sabab:** Trunk password noto'g'ri yoki yo'q

**Yechim:**
1. DID number sozlamalarida trunk password'ni tekshiring
2. Server'ni restart qiling: `pm2 restart pbx-system`

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
- `[SIP] Sending 401 challenge...` ✅
- `Extension test1001 registered...` ✅

### Test 2: Trunk Ulanish

1. **DID number yarating/yangilang:**
   - Number: [DID number]
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
- `REGISTER sent for DID...` ✅

## 🎯 Keyingi Qadamlar

1. **Extension Password'ni Qayta O'rnatish:**
   - Admin panel → Extensions → Extension tanlang → ✏️ Tahrirlash
   - Password maydoniga yangi password kiriting
   - Saqlash

2. **MicroSIP Sozlamalarini Tekshirish:**
   - STUN o'chirilganligini tekshiring
   - Domain to'g'riligini tekshiring
   - Port to'g'riligini tekshiring

3. **Trunk Configuration Tekshirish:**
   - DID number sozlamalarida trunk password mavjudmi?
   - Trunk server (bell.uz) DNS'da resolve qilinadimi?

4. **Server Loglarini Real-time Kuzatish:**
   ```bash
   pm2 logs pbx-system --lines 50
   ```

## 📞 Yordam

Agar muammo davom etsa, quyidagilarni yuboring:

1. **Server loglari:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```

2. **Trunk status:**
   ```bash
   node check-trunk-status.js
   ```

3. **Extension ma'lumotlari:**
   - Username
   - Password (qayta o'rnatilganmi?)

4. **MicroSIP sozlamalari** (screenshot)

5. **DID number sozlamalari** (screenshot)
