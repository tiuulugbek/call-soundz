# Tashqi SIP Ulanish Muammolari - Yechimlar

## Tekshirish Ro'yxati

### 1. Server Loglarini Tekshirish

```bash
# Real-time loglarni kuzatish (terminal 1)
pm2 logs pbx-system --lines 100

# Keyin Zoiper'dan ulanishni urinib ko'ring va loglarda nima ko'rinishini kuzating

# Yoki barcha SIP xabarlarni qidirish
pm2 logs pbx-system --lines 200 | grep -E "\[SIP\]|REGISTER|401|403|200 OK"
```

**Kutilyotgan natijalar:**
- `[SIP] Received message from...` - Xabar kelyapti ✅
- `[SIP] Processing REGISTER...` - REGISTER qayta ishlanmoqda ✅
- `[SIP] Sending 401 challenge...` - 401 javob yuborilmoqda ✅

**Agar loglarda hech narsa ko'rinmasa:**
- SIP xabarlar serverga yetib bormayapti
- Firewall yoki network muammosi
- Server'ning boshqa IP'ga bind qilingan

### 2. Port va Firewall Tekshirish

```bash
# Port 5060/UDP ochiqligini tekshirish
ss -tuln | grep 5060
# yoki
netstat -tuln | grep 5060

# Firewall qoidalarini ko'rish
ufw status | grep 5060
# yoki
iptables -L -n | grep 5060

# Agar port ochiq bo'lsa, quyidagi natijani ko'rishingiz kerak:
# udp   UNCONN 0      0            0.0.0.0:5060       0.0.0.0:*
```

### 3. Server Status Tekshirish

```bash
# PM2 status
pm2 status pbx-system

# Server process'ni tekshirish
ps aux | grep "pbx-system\|node.*server.js" | grep -v grep

# Server loglarida "SIP Registrar started" xabarni qidirish
pm2 logs pbx-system --lines 50 | grep "SIP Registrar started"
```

### 4. Extension Password Cache Tekshirish

**Muammo:** Eski extensionlar uchun password cache'da bo'lmasligi mumkin.

**Yechim:**
1. Admin paneldan extension password'ni qayta o'rnating
2. Yoki yangi extension yarating va uni test qiling

**Password cache'ni tekshirish uchun kod:**
```javascript
// Server loglarida ko'rinadi:
// "SIP password not available for extension..." - password cache'da yo'q
// "Password found in cache for..." - password cache'da bor
```

### 5. Zoiper Sozlamalari (To'g'ri Sozlash)

#### Zoiper'da quyidagilarni tekshiring:

**Account Settings:**
- ✅ **Account Type**: SIP
- ✅ **User**: `1001` (extension username)
- ✅ **Password**: Extension password
- ✅ **Domain**: `call.soundz.uz`
- ✅ **Server**: `call.soundz.uz` (yoki bo'sh qoldiring)
- ✅ **Port**: `5060`
- ✅ **Transport**: `UDP`
- ✅ **Register**: ✅ Enabled (checked)
- ❌ **Outbound Proxy**: Bo'sh qoldiring (yoki `call.soundz.uz:5060`)
- ❌ **STUN**: O'chirilgan bo'lishi kerak

**Advanced Settings (agar bor bo'lsa):**
- ❌ **Use STUN**: O'chirilgan
- ✅ **Keep-alive**: Enabled (agar bor bo'lsa)
- ✅ **Register Expires**: 3600 (default)

### 6. Network/NAT Muammosi

Agar NAT yoki firewall orqali ulansangiz:

**Muammo belgilari:**
- Loglarda xabarlar ko'rinmaydi
- Port ochiq ko'rinadi, lekin ulanish ishlamaydi
- Timeout xatolari

**Yechimlar:**

1. **STUN o'chirish** (Zoiper'da)
   - STUN muammoga sabab bo'lishi mumkin
   - Oddiy ulanish uchun STUN kerak emas

2. **Public IP tekshirish**
   ```bash
   # Server'ning public IP'sini aniqlash
   curl ifconfig.me
   # yoki
   hostname -I
   ```

3. **DNS tekshirish**
   ```bash
   # DNS resolution tekshirish
   nslookup call.soundz.uz
   # yoki
   dig call.soundz.uz
   ```

### 7. Server Konfiguratsiyasi Tekshirish

**Muammo:** Server 0.0.0.0 ga bind qilingan (ichki ulanish uchun)

**Yechim:** Konfiguratsiya to'g'ri - 0.0.0.0 barcha interfacelarda eshitadi

**Tekshirish:**
```javascript
// config.js da:
host: '0.0.0.0' // ✅ To'g'ri - barcha interfacelarda eshitadi
port: 5060      // ✅ To'g'ri
```

## Tekshirish Bosqichlari

### Bosqich 1: Server Loglarini Real-time Kuzatish

```bash
# Terminal 1: Loglarni kuzatish
pm2 logs pbx-system --lines 50

# Terminal 2 yoki boshqa oynada: Zoiper'dan ulanishni urinib ko'ring
```

**Kutilyotgan natijalar:**

Agar ulanish ishlasa:
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Request: REGISTER sip:call.soundz.uz SIP/2.0
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for 1001 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
```

Agar xabarlar kelyapti, lekin javob yuborilmayapti:
- `[SIP] Received message...` ko'rinadi ✅
- `[SIP] Sending response...` ko'rinmaydi ❌
- Bu kod muammosini ko'rsatadi

Agar xabarlar umuman kelyapti:
- Hech qanday `[SIP]` loglari ko'rinmaydi ❌
- Bu network/firewall muammosini ko'rsatadi

### Bosqich 2: Port Tekshirish

```bash
# Port ochiqligini tekshirish
ss -tuln | grep 5060

# Natija quyidagicha bo'lishi kerak:
# udp   UNCONN 0      0            0.0.0.0:5060       0.0.0.0:*
```

Agar port ko'rinmasa - server ishlamayapti.

### Bosqich 3: Extension Password Tekshirish

**Muammo:** Password cache'da bo'lishi mumkin.

**Yechim:**

1. **Admin paneldan extension password'ni qayta o'rnating:**
   - Extensions → Extension ni tanlang → Password button
   - Yangi password kiriting
   - Password cache'ga saqlanadi

2. **Yoki yangi extension yarating:**
   - Extensions → + Extension Qo'shish
   - Username va Password kiriting
   - Yaratilgandan keyin password cache'ga saqlanadi

### Bosqich 4: Test Qilish

**To'g'ri sozlamalar bilan test:**
1. Yangi extension yarating
2. Zoiper'da yangi account qo'shing:
   - User: extension username
   - Password: extension password
   - Domain: call.soundz.uz
   - Port: 5060
   - Transport: UDP
   - STUN: O'chirilgan
3. Register tugmasini bosing
4. Server loglarini kuzating

## Eng Keng Tarqalgan Muammolar va Yechimlar

### Muammo 1: 408 Request Timeout

**Sabab:** SIP server javob bermayapti

**Yechim:**
- ✅ Info-level logging qo'shildi (barcha xabarlar ko'rinadi)
- ✅ OPTIONS metod qo'shildi
- ✅ Response logging yaxshilandi

**Tekshirish:**
```bash
pm2 logs pbx-system --lines 50 | grep -E "\[SIP\]"
```

### Muammo 2: 503 Service Unavailable

**Sabab:** Autentifikatsiya muammosi

**Yechim:**
- ✅ Digest autentifikatsiya implementatsiya qilindi
- ✅ Password cache tizimi qo'shildi

**Tekshirish:**
- Extension password'ni qayta o'rnating
- Yoki yangi extension yarating

### Muammo 3: 401 Unauthorized (va keyin 403 Forbidden)

**Sabab:** Password cache'da yo'q yoki noto'g'ri password

**Yechim:**
- Extension password'ni qayta o'rnating
- Yoki yangi extension yarating

### Muammo 4: DNS Timeout (STUN Error 57)

**Sabab:** STUN server muammosi

**Yechim:**
- Zoiper'da STUN'ni o'chiring
- Oddiy SIP ulanish uchun STUN kerak emas

### Muammo 5: Xabarlar Umuman Kelmayapti

**Sabab:** Network/Firewall muammosi

**Yechim:**
- Firewall qoidalarini tekshiring
- Port 5060/UDP ochiqligini tekshiring
- Network routing'ni tekshiring
- Public IP va DNS'ni tekshiring

## Test Skripti

Quyidagi skriptni ishlatib, barcha sozlamalarni tekshirishingiz mumkin:

```bash
#!/bin/bash

echo "=== PBX System SIP Diagnostics ==="
echo ""

echo "1. PM2 Status:"
pm2 status pbx-system | grep pbx-system
echo ""

echo "2. Port 5060 Status:"
ss -tuln | grep 5060
echo ""

echo "3. Firewall Status:"
ufw status | grep 5060
echo ""

echo "4. SIP Server Logs (last 10 lines with [SIP]):"
pm2 logs pbx-system --lines 50 --nostream 2>&1 | grep "\[SIP\]" | tail -10
echo ""

echo "5. Server Errors (last 5 lines):"
pm2 logs pbx-system --err --lines 5 --nostream 2>&1 | tail -5
echo ""

echo "=== Diagnostics Complete ==="
```

## Keyingi Qadamlar

Agar barcha tekshiruvlardan o'tib, muammo davom etsa:

1. **Server loglarini real-time kuzatish:**
   ```bash
   pm2 logs pbx-system --lines 100
   ```

2. **Zoiper'dan ulanishni urinib ko'ring va loglarda nima ko'rinishini yozing**

3. **Log natijalarini yuboring** - men aniq yechim taklif qilaman

## Muhim Eslatmalar

1. **Extension password** cache'da bo'lishi kerak (yangi extension yaratilganda yoki password qayta o'rnatilganda)
2. **STUN o'chirilgan** bo'lishi kerak Zoiper'da
3. **Port 5060/UDP ochiq** bo'lishi kerak firewall'da
4. **Server ishlamoqda** bo'lishi kerak (PM2 status: online)
5. **Loglarda `[SIP]` prefix** bilan xabarlar ko'rinishi kerak
