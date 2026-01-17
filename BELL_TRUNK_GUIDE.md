# Bell.uz Trunk Ulanish Qo'llanmasi

## Trunk Ulanishini Tekshirish

### 1. Trunk Status Tekshirish (Script)

```bash
cd /root/pbx-system
node check-trunk-status.js
```

Bu script bell.uz trunk serveriga REGISTER request yuboradi va javobni ko'rsatadi.

### 2. Server Loglarini Tekshirish

```bash
pm2 logs pbx-system --lines 100 | grep -E "trunk|bell\.uz|Trunk|REGISTER"
```

**Kutilyotgan natijalar:**
- `SIP Trunk Manager initialized` - Trunk manager ishga tushdi ✅
- `Registering trunk for DID...` - DID uchun trunk register qilinmoqda ✅
- `REGISTER sent for DID...` - REGISTER request yuborildi ✅
- `✅ Trunk registration successful` - Muvaffaqiyatli ro'yxatdan o'tdi ✅

### 3. Trunk Configuration Tekshirish

**Backend config:**
- `backend/src/config/config.js` faylida:

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

**Environment Variables (agar kerak bo'lsa):**
```bash
export TRUNK_SERVER=bell.uz
export TRUNK_USERNAME=99785553322
export TRUNK_PASSWORD=your_password
export TRUNK_PORT=5060
```

### 4. DID Number Sozlamalari

**Admin Panel → DID Numbers** da:
- ✅ DID number mavjud
- ✅ Provider: `bell.uz` (yoki to'g'ri provider)
- ✅ Trunk Username: trunk username
- ✅ Trunk Password: trunk password
- ✅ Enabled: ✅ (checked)

## Trunk Registration Jarayoni

### Avtomatik Registration

Server ishga tushganda:
1. ✅ SIP Trunk Manager ishga tushadi
2. ✅ Barcha enabled DID numberlar uchun trunk register qilinadi
3. ✅ Har 30 minutda qayta register qilinadi

### Manual Registration

Agar avtomatik ishlamasa, DID number yaratilganda yoki o'zgartirilganda qayta register qilinadi.

## Muammolar va Yechimlar

### Muammo 1: Trunk Ro'yxatdan O'tmaydi

**Tekshirish:**
1. **DNS Resolution:**
   ```bash
   nslookup bell.uz
   dig bell.uz
   ```

2. **Network Connectivity:**
   ```bash
   ping bell.uz
   ```

3. **Firewall:**
   ```bash
   ufw status | grep 5060
   iptables -L -n | grep 5060
   ```

**Yechimlar:**
- DNS resolution ishlayotganligini tekshiring
- Firewall'da 5060/UDP ochiqligini tekshiring
- Trunk username va password to'g'riligini tekshiring

### Muammo 2: 401 Unauthorized

**Sabab:** Trunk password noto'g'ri yoki yo'q

**Yechim:**
1. DID number sozlamalarida trunk password'ni tekshiring
2. Yoki `TRUNK_PASSWORD` environment variable'ni o'rnating
3. Server'ni restart qiling: `pm2 restart pbx-system`

### Muammo 3: 404 Not Found

**Sabab:** Trunk username yoki server noto'g'ri

**Yechim:**
1. Trunk username'ni tekshiring
2. Trunk server'ni tekshiring (`bell.uz`)
3. DID number sozlamalarini tekshiring

### Muammo 4: Timeout

**Sabab:** Trunk server javob bermayapti

**Yechim:**
1. Network connectivity'ni tekshiring
2. Firewall sozlamalarini tekshiring
3. Trunk server'ning ishlayotganligini tekshiring

## Trunk Ulanishini Test Qilish

### Test 1: Trunk Status Script

```bash
cd /root/pbx-system
node check-trunk-status.js
```

**Kutilyotgan natija:**
```
✅ Response received from: X.X.X.X:5060
Status: 200 OK (yoki 401 Unauthorized - bu normal, auth kerak bo'lishi mumkin)
```

### Test 2: Server Loglarini Kuzatish

```bash
pm2 logs pbx-system --lines 50 | grep -i trunk
```

**Kutilyotgan natijalar:**
- `SIP Trunk Manager listening on port 5061`
- `Registering trunk for DID...`
- `REGISTER sent for DID...`
- `✅ Trunk registration successful`

### Test 3: DID Number Yaratish/O'zgartirish

1. Admin panel → DID Numbers
2. + DID Qo'shish yoki mavjud DID'ni tahrirlash
3. Trunk ma'lumotlarini kiriting:
   - Provider: `bell.uz`
   - Trunk Username: `99785553322` (yoki to'g'ri username)
   - Trunk Password: [trunk password]
4. Enabled: ✅
5. Saqlash
6. Server loglarini kuzating

## Muhim Eslatmalar

1. **Trunk Registration:**
   - Trunk avtomatik register qilinadi (server ishga tushganda)
   - Har 30 minutda qayta register qilinadi
   - DID number yaratilganda/o'zgartirilganda qayta register qilinadi

2. **Port Muammosi:**
   - Trunk port: 5061 (default)
   - Extension port: 5060 (default)
   - Agar port 5061 band bo'lsa, `TRUNK_PORT` environment variable'ni o'zgartiring

3. **Authentication:**
   - Trunk registration uchun digest authentication kerak bo'lishi mumkin
   - Trunk password DID number sozlamalarida yoki environment variable'da bo'lishi kerak

4. **Network:**
   - Trunk server'ga network access kerak
   - Firewall'da outbound 5060/UDP ochiq bo'lishi kerak

## Qo'shimcha Ma'lumotlar

### Trunk Manager Loglari

```bash
# Barcha trunk loglarni ko'rish
pm2 logs pbx-system --lines 200 | grep -i "trunk\|bell"

# Real-time kuzatish
pm2 logs pbx-system | grep -i trunk
```

### Trunk Configuration Yuborish

Agar trunk provider sozlamalari kerak bo'lsa:
- Provider: `bell.uz`
- Server: `bell.uz`
- Port: `5060`
- Transport: `UDP`
- Username: [trunk username]
- Password: [trunk password]

## Aloqa

Agar muammo davom etsa:
1. Trunk status script natijasini yuboring
2. Server loglarini yuboring
3. DID number sozlamalarini screenshot qiling
4. Network connectivity test natijasini yuboring
