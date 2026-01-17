# Muammolar va Yechimlar - Qo'llanma

## ❌ Muammo 1: Loglarda Ko'rinmayapti

**Holat:**
- `pm2 logs pbx-system` da faqat `[SIP DEBUG] Received UDP packet` ko'rinayapti
- `logger.info()` message'lari ko'rinmayapti
- `logger.debug()` message'lari ko'rinmayapti

**Sabab:**
- Winston logger'da Console transport faqat `NODE_ENV !== 'production'` bo'lganda qo'shiladi
- PM2 production mode'da ishlayapti, shuning uchun Console transport qo'shilmagan
- PM2 out.log faqat `console.log()` yozadi, `logger.info()` emas

**Yechim:**
- Console transport'ni har doim qo'shish kerak
- ✅ Logger konfiguratsiyasi o'zgartirildi: Console transport har doim qo'shiladi

**Tekshirish:**
```bash
pm2 logs pbx-system --lines 50
```

**Kutilyotgan natija:**
```
2026-01-17 18:XX:XX info: [SIP] Received message from...
2026-01-17 18:XX:XX info: [SIP] Call from 1002 to 1001
2026-01-17 18:XX:XX info: [SIP] Sending 100 Trying...
2026-01-17 18:XX:XX info: [SIP] Sending 180 Ringing...
2026-01-17 18:XX:XX info: [SIP] Sending 200 OK...
```

## ❌ Muammo 2: Password Har Safar O'zgartirish Kerak

**Holat:**
- Server restart qilinganda password cache tozalanadi
- Extension password cache'da yo'qoladi
- Authentication failed (403 Forbidden)

**Sabab:**
- `sipPasswordCache` in-memory Map
- Server restart qilinganda cache tozalanadi
- Password database'da bcrypt bilan hashlangan, plain password yo'q
- Server ishga tushganda plain password'larni yuklab bo'lmaydi

**Yechim:**
- **Hozirgi vaqt uchun:** Extension password'ni yaratish yoki o'zgartirishda cache'ga saqlash (✅ hozir buni qilyapti)
- **Uzoq muddatli:** Redis yoki database'da plain password'ni encrypted saqlash

**Hozirgi yechim:**
1. Extension yaratilganda password cache'ga saqlanadi ✅
2. Extension password o'zgartirilganda cache'ga saqlanadi ✅
3. Server restart qilinganda cache tozalanadi (muammo)

**Keyingi qadam:**
- Redis yoki database'da plain password'ni encrypted saqlash
- Yoki SIP password'ni alohida jadvalda saqlash (encrypted)

**Hozirgi vaqt uchun:**
- Extension password'ni qayta o'rnatish kerak (server restart qilgandan keyin)

## 🔍 180 Ringing Qayerda Chiqadi?

**180 Ringing:**
1. **Server:** `send180Ringing()` funksiyasi 180 Ringing javobini yuboradi
2. **Client (MicroSIP):** 180 Ringing javobini olganda "ring" signalini ko'rsatadi

**Kod joyi:**
```javascript
// registrar.js - handleInvite()
this.send180Ringing(rinfo, message);  // 180 Ringing yuboriladi

// registrar.js - send180Ringing()
logger.info(`[SIP] Sending 180 Ringing to ${rinfo.address}:${rinfo.port}`);
```

**Loglarda ko'rinishi:**
```
[SIP] Sending 180 Ringing to 152.53.229.176:XXXXX
```

**MicroSIP'da:**
- "ring" signali ko'rinadi
- Qo'ng'iroq qilingan extension ko'rsatiladi

## 📋 Test Qilish

### Test 1: Logger Message'larni Ko'rish

**Terminal:**
```bash
pm2 logs pbx-system --lines 50
```

**Kutilyotgan natija:**
```
2026-01-17 18:XX:XX info: [SIP] Received message from...
2026-01-17 18:XX:XX info: [SIP] Call from 1002 to 1001
2026-01-17 18:XX:XX info: [SIP] Sending 100 Trying...
2026-01-17 18:XX:XX info: [SIP] Sending 180 Ringing...
2026-01-17 18:XX:XX info: [SIP] Sending 200 OK...
```

### Test 2: Password Cache

**Qadamlar:**
1. Extension password'ni qayta o'rnating (Admin Panel)
2. MicroSIP'da password'ni yangilang
3. Register qiling

**Tekshirish:**
```bash
pm2 logs pbx-system | grep "Stored SIP password"
```

**Kutilyotgan natija:**
```
[SIP] Stored SIP password in cache for 1002
```

## 🎯 Keyingi Qadamlar

### 1. Logger Yaxshilash ✅ (Qilindi)

- Console transport har doim qo'shildi
- Endi `pm2 logs` da barcha message'lar ko'rinadi

### 2. Password Cache Yaxshilash (Keyingi Versiya)

**Yechim:**
- Redis yoki database'da plain password'ni encrypted saqlash
- Server ishga tushganda password'larni yuklash
- Yoki SIP password'ni alohida jadvalda saqlash

**Hozirgi vaqt uchun:**
- Extension password'ni qayta o'rnatish kerak (server restart qilgandan keyin)

## 📞 Yordam

Agar muammo davom etsa:

1. **Loglarni tekshiring:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```

2. **Password cache holatini tekshiring:**
   ```bash
   pm2 logs pbx-system | grep "Stored SIP password\|Password cached"
   ```

3. **Combined log'ni tekshiring:**
   ```bash
   tail -100 /var/www/call.soundz.uz/logs/combined.log | jq -r '.message' | grep "\[SIP\]"
   ```

## 🎉 Xulosa

**Muammo 1: Logger ✅ (Hal qilindi)**
- Console transport har doim qo'shildi
- Endi `pm2 logs` da barcha message'lar ko'rinadi

**Muammo 2: Password Cache ⚠️ (Hozirgi vaqt uchun yechim bor)**
- Extension password'ni qayta o'rnatish kerak (server restart qilgandan keyin)
- Keyingi versiyada Redis yoki database storage qo'shiladi

**180 Ringing:**
- `send180Ringing()` funksiyasi 180 Ringing javobini yuboradi
- Client (MicroSIP) 180 Ringing javobini olganda "ring" signalini ko'rsatadi
- Loglarda `[SIP] Sending 180 Ringing...` ko'rinadi
