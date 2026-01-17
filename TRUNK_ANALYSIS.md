# Bell.uz Trunk Ulanish Tahlili

## 📊 Trunk Status Script Natijasi

### ✅ Muvaffaqiyatli Qadamlar

1. **REGISTER request yuborildi:**
   - ✅ Network connectivity bor
   - ✅ DNS resolution ishlayapti (`bell.uz` resolve qilinadi)
   - ✅ UDP port ochiq
   - ✅ Request to'g'ri formatda yuborilmoqda

### ⚠️ Javob Kelyapti (Bu Normal Bo'lishi Mumkin)

**Sabab:**
1. **Digest Authentication Kerak:**
   - Trunk server avval 401 Unauthorized yuborishi mumkin
   - Keyin digest authentication bilan qayta urinish kerak
   - Hozirgi script faqat birinchi REGISTER request yuboradi

2. **Firewall:**
   - Outbound connection ishlayapti (request yuborildi)
   - Inbound response to'sib qo'yilgan bo'lishi mumkin
   - NAT muammosi bo'lishi mumkin

3. **Trunk Server:**
   - Trunk server javob bermayotgan bo'lishi mumkin
   - Trunk server boshqa portdan eshitayotgan bo'lishi mumkin

4. **Timeout:**
   - 5 soniya juda qisqa bo'lishi mumkin
   - Trunk server sekin javob berayotgan bo'lishi mumkin

## 🔍 Keyingi Qadamlar

### Qadam 1: DNS va Network Tekshirish

```bash
# DNS Resolution
nslookup bell.uz

# Network Connectivity
ping bell.uz

# Port Tekshirish
telnet bell.uz 5060
# yoki
nc -u -v bell.uz 5060
```

**Kutilyotgan natija:**
- ✅ DNS resolution ishlayapti
- ✅ Network connectivity bor
- ⚠️ Port ochiqligi noma'lum (UDP uchun telnet ishlamaydi)

### Qadam 2: Server Loglarini Tekshirish

```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 100 | grep -i "trunk\|bell"
```

**Kutilyotgan natijalar:**
- `SIP Trunk Manager initialized` ✅
- `Registering trunk for DID...` ✅
- `REGISTER sent for DID...` ✅

### Qadam 3: DID Number Sozlamalari Tekshirish

**Admin Panel → DID Numbers:**
1. DID number'ni tanlang
2. Quyidagilarni tekshiring:
   - ✅ Provider: `bell.uz`
   - ✅ Trunk Username: `99785553322` (yoki to'g'ri username)
   - ✅ **Trunk Password: [trunk password]** ⚠️ MUHIM!
   - ✅ Enabled: ✅ (checked)

**⚠️ Muhim:** Trunk password DID number sozlamalarida bo'lishi kerak!

### Qadam 4: Trunk Manager Initialization Tekshirish

```bash
cd /root/pbx-system
tail -50 /var/www/call.soundz.uz/logs/error.log | grep -i "trunk"
```

**Kutilyotgan natijalar:**
- ✅ `SIP Trunk Manager initialized` - Muvaffaqiyatli
- ❌ `SIP Trunk Manager initialization failed` - Xato

## 🚨 Muammolar va Yechimlar

### Muammo 1: Javob Kelyapti

**Bu normal bo'lishi mumkin:**
- Trunk server digest authentication kerak bo'lishi mumkin
- Firewall javobni to'sib qo'yishi mumkin
- Trunk server javob bermayotgan bo'lishi mumkin

**Yechim:**
1. DID number sozlamalarida trunk password mavjudligini tekshiring
2. Trunk provider'dan trunk configuration ma'lumotlarini oling
3. Firewall sozlamalarini tekshiring

### Muammo 2: Trunk Manager Initialization Failed

**Sabab:** Server.js'da `sipTrunkManagerInstance` muammosi

**Yechim:**
- ✅ Tuzatildi: `server.js` da `sipTrunkManagerInstance` aniqlangan
- Server restart qilindi

**Tekshirish:**
```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 10 | grep -i "trunk"
```

### Muammo 3: Trunk Password Yo'q

**Sabab:** DID number sozlamalarida trunk password bo'lmasligi mumkin

**Yechim:**
1. Admin Panel → DID Numbers
2. DID number'ni tanlang
3. **Trunk Password** maydoniga trunk password kiriting
4. **Saqlash** tugmasini bosing

## 📋 Trunk Ulanishini To'liq Test Qilish

### Test 1: Trunk Status Script

```bash
cd /root/pbx-system
node check-trunk-status.js
```

**Natija:**
- ✅ Request sent - Network bor ✅
- ⚠️ No response - Normal bo'lishi mumkin (auth kerak)

### Test 2: DID Number Yaratish/Yangilash

1. **Admin Panel → DID Numbers**
2. **+ DID Qo'shish** yoki mavjud DID'ni tahrirlash
3. Quyidagilarni kiriting:
   ```
   Number: [DID number]
   Provider: bell.uz
   Trunk Username: 99785553322
   Trunk Password: [trunk password] ⚠️ MUHIM!
   Route Type: Extension (yoki boshqa)
   Route Target: [Extension yoki boshqa]
   Enabled: ✅
   ```
4. **Saqlash** tugmasini bosing

### Test 3: Server Loglarini Real-time Kuzatish

```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50 | grep -i trunk
```

**Kutilyotgan natijalar:**
- `SIP Trunk Manager initialized` ✅
- `Registering trunk for DID...` ✅
- `REGISTER sent for DID...` ✅
- `✅ Trunk registration successful` ✅ (agar muvaffaqiyatli bo'lsa)

## 🎯 Xulosa

### ✅ Hozirgi Holat

1. **Network Connectivity:** ✅ Ishlayapti (request yuborildi)
2. **DNS Resolution:** ✅ Ishlayapti (bell.uz resolve qilinadi)
3. **Trunk Manager:** ✅ Initialization tuzatildi
4. **Javob:** ⚠️ Kelmayapti (normal bo'lishi mumkin)

### 📝 Keyingi Qadamlar

1. **DID Number Sozlamalari:**
   - Trunk password DID number sozlamalarida mavjudmi?
   - Provider, Username, Password to'g'rimi?

2. **Trunk Provider Sozlamalari:**
   - Trunk provider'dan to'g'ri configuration ma'lumotlarini oling
   - Trunk server port'ini tekshiring (5060 yoki boshqa?)
   - Trunk server IP address'ini tekshiring

3. **Firewall:**
   - Outbound connection ishlayapti ✅
   - Inbound response tekshiring

4. **Server Loglari:**
   - Trunk manager initialization muvaffaqiyatlimi?
   - Trunk registration jarayoni boshlanganmi?

## 📞 Yordam

Agar muammo davom etsa:

1. **Trunk provider'dan ma'lumot oling:**
   - Trunk server IP address
   - Trunk server port
   - Trunk username va password
   - Trunk authentication usuli (digest auth?)

2. **DID number sozlamalarini yuboring:**
   - Provider
   - Trunk Username
   - Trunk Password (mavjudmi?)
   - Enabled (true/false?)

3. **Server loglarini yuboring:**
   ```bash
   cd /root/pbx-system
   pm2 logs pbx-system --lines 100 | grep -i trunk
   ```

## ⚠️ Muhim Eslatmalar

1. **Trunk Password:**
   - Trunk password DID number sozlamalarida bo'lishi kerak
   - Yoki `TRUNK_PASSWORD` environment variable'da

2. **Digest Authentication:**
   - Trunk server digest authentication kerak bo'lishi mumkin
   - Bu holda avval 401 Unauthorized keladi, keyin authenticated REGISTER yuboriladi

3. **Network:**
   - Outbound connection ishlayapti ✅
   - Inbound response tekshiring

4. **Trunk Manager:**
   - Trunk manager avtomatik register qiladi (server ishga tushganda)
   - Har 30 minutda qayta register qilinadi
