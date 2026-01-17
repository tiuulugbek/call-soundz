# MicroSIP Ulanish Qo'llanmasi

## MicroSIP Sozlamalari

### 1. Account Qo'shish

1. **MicroSIP'ni oching**
2. **Settings → Accounts** yoki **Ctrl+A**
3. **Add** tugmasini bosing

### 2. Account Ma'lumotlari

Quyidagi ma'lumotlarni kiriting:

```
Account Name: call.soundz.uz (yoki istalgan nom)
Domain: call.soundz.uz
Username: [Extension username, masalan: 1001]
Password: [Extension password]
Display Name: [Ixtiyoriy, masalan: John Doe]
```

### 3. Advanced Sozlamalar

**Settings → Accounts → [Account] → Advanced** ga o'ting:

```
✅ Register: Enabled (checked)
✅ Publish: Enabled (checked)
✅ Use SRV: Disabled (unchecked)
✅ Use STUN: Disabled (unchecked) ⚠️ MUHIM!
✅ Use ICE: Disabled (unchecked)
✅ Use RTP keep-alive: Enabled (checked)
✅ Use SIP keep-alive: Enabled (checked)
```

### 4. Network Sozlamalari

**Settings → Network** ga o'ting:

```
Local port: 5060 (yoki boshqa port, agar 5060 band bo'lsa)
STUN server: Bo'sh qoldiring
RTP port range: 10000-20000 (default)
```

### 5. Proxy Server (Agar kerak bo'lsa)

**Settings → Accounts → [Account] → Proxy**:

```
Proxy server: Bo'sh qoldiring (yoki call.soundz.uz:5060)
```

## Muhim Eslatmalar

### ⚠️ STUN O'chirilishi Kerak

MicroSIP'da **STUN o'chirilgan** bo'lishi kerak, aks holda timeout xatosi bo'lishi mumkin.

### ✅ Keep-Alive Yoqilishi Kerak

**SIP keep-alive** va **RTP keep-alive** yoqilgan bo'lishi kerak.

### 🔧 Port Muammosi

Agar 5060 port band bo'lsa, boshqa port ishlatishingiz mumkin (masalan: 5061, 5062).

## Test Qilish

1. **Account'ni saqlang**
2. **Register** tugmasini bosing
3. **Status** ko'rinishini kuzating:
   - ✅ **Registered** - muvaffaqiyatli ulanish
   - ❌ **Failed** - xato, loglarni tekshiring
   - ⏳ **Registering...** - ulanish jarayonida

## Xatolar va Yechimlar

### Timeout Xatosi

**Muammo:** "Request Timeout (408)" yoki "DNS timeout (503)"

**Yechim:**
1. STUN o'chirilganligini tekshiring
2. Firewall'da 5060/UDP port ochiqligini tekshiring
3. Server loglarini tekshiring: `pm2 logs pbx-system | grep "[SIP]"`

### 401 Unauthorized

**Muammo:** "401 Unauthorized"

**Yechim:**
1. Username va Password to'g'riligini tekshiring
2. Extension password'ni qayta o'rnating (admin paneldan)
3. Account'ni qayta yarating

### 404 Not Found

**Muammo:** "404 Not Found"

**Yechim:**
1. Extension mavjudligini tekshiring
2. Extension enabled bo'lishi kerak
3. Username to'g'riligini tekshiring

### DNS Xatosi

**Muammo:** "DNS timeout" yoki "Failed to resolve"

**Yechim:**
1. Domain to'g'riligini tekshiring: `call.soundz.uz`
2. DNS resolution'ni tekshiring: `nslookup call.soundz.uz`
3. Proxy server bo'sh bo'lishi kerak (yoki to'g'ri)

## Server Loglarini Kuzatish

Real-time loglarni kuzatish:

```bash
pm2 logs pbx-system --lines 50 | grep "\[SIP\]"
```

Kutilyotgan natijalar:
- `[SIP] Received message from...` - Xabar kelyapti ✅
- `[SIP] Processing REGISTER...` - REGISTER qayta ishlanmoqda ✅
- `[SIP] Sending 401 challenge...` - 401 javob yuborilmoqda ✅
- `[SIP] Response sent successfully...` - Javob yuborildi ✅

## Qo'shimcha Ma'lumotlar

### Extension Yaratish

1. Admin panelga kiring: https://call.soundz.uz
2. **Extensions** → **+ Extension Qo'shish**
3. Username va Password kiriting
4. Extension yaratilgandan keyin SIP ma'lumotlari ko'rsatiladi

### Password Qayta O'rnatish

1. Admin panel → **Extensions**
2. Extension'ni tanlang
3. **✏️ Tahrirlash** tugmasini bosing
4. Password'ni yangilang
5. **Saqlash** tugmasini bosing

### Extension Status

1. Admin panel → **Extensions**
2. Extension'ni tanlang
3. **👁️ Ko'rish** tugmasini bosing
4. Online/Offline holatini ko'ring

## Aloqa

Agar muammo davom etsa:
1. Server loglarini yuboring
2. MicroSIP sozlamalarini screenshot qiling
3. Xato xabarlarini yuboring
