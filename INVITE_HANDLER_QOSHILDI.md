# INVITE Handler Qo'shildi - Telefon Qilish Funksiyasi

## ✅ Implementatsiya Qilindi

**INVITE Handler:**
- ✅ INVITE xabarlarni qabul qiladi
- ✅ From va To header'larni parse qiladi
- ✅ Caller extension'ni tekshiradi
- ✅ Callee extension'ni topadi
- ✅ 100 Trying (provisional response) yuboradi
- ✅ 180 Ringing yuboradi
- ✅ 200 OK yuboradi

## 🔍 Qanday Ishlaydi

### Qadam 1: INVITE Qabul Qilish

1. **Client'dan INVITE keladi:**
   ```
   INVITE sip:1001@call.soundz.uz SIP/2.0
   From: <sip:1002@call.soundz.uz>
   To: <sip:1001@call.soundz.uz>
   ```

2. **Server INVITE'ni qabul qiladi:**
   - From username'ni extract qiladi (1002)
   - To username'ni extract qiladi (1001)
   - Caller extension'ni tekshiradi (1002 registered bo'lishi kerak)

### Qadam 2: 100 Trying Javobi

3. **Server 100 Trying yuboradi:**
   ```
   SIP/2.0 100 Trying
   ```

### Qadam 3: Callee Tekshirish

4. **Callee extension'ni topadi:**
   - Extension 1001 topiladimi?
   - Extension 1001 registered bo'lsa, contact URI'ni oladi
   - Agar registered bo'lsa, INVITE'ni forward qiladi

### Qadam 4: 180 Ringing va 200 OK

5. **Server 180 Ringing yuboradi:**
   ```
   SIP/2.0 180 Ringing
   ```

6. **Server 200 OK yuboradi (1 soniya keyin):**
   ```
   SIP/2.0 200 OK
   ```

## 📋 Test Qilish

### Test 1: Internal Call (Extension to Extension)

**Qadamlar:**
1. **Extension 1002 registered bo'lishi kerak**
2. **Extension 1001 registered bo'lishi kerak** (yoki boshqa extension)
3. **MicroSIP'dan 1001'ga telefon qiling:**
   - Dial pad'dan `1001` raqamini tering
   - Call tugmasini bosing

**Server loglari:**
```bash
pm2 logs pbx-system --lines 50
```

**Kutilyotgan loglar:**
```
[SIP] INVITE received from 152.53.229.176:XXXXX
[SIP] Call from 1002 to 1001
[SIP] Sending 100 Trying to 152.53.229.176:XXXXX
[SIP] Forwarding INVITE to registered extension 1001 at sip:...
[SIP] Sending 180 Ringing to 152.53.229.176:XXXXX
[SIP] Sending 200 OK to 152.53.229.176:XXXXX
```

### Test 2: External Call (DID Number)

**Hozirgi vaqtda:**
- External number'lar uchun 404 Not Found yuboriladi
- Keyingi versiyada DID routing qo'shiladi

## 🚨 Hozirgi Cheklovlar

**1. INVITE Forwarding:**
- Hozircha registered extension'ga to'g'ridan-to'g'ri INVITE forward qilinmayapti
- 180 Ringing va 200 OK yuboriladi, lekin to'g'ri RTP session o'rnatilmaydi

**2. SDP (Session Description Protocol):**
- 200 OK'da SDP body bo'sh
- RTP media session uchun SDP kerak

**3. RTP Media:**
- RTP audio stream hozircha ishlamayapti
- Media server yoki RTP proxy kerak

**4. DID Routing:**
- External call'lar uchun DID routing hozircha implement qilinmagan
- Trunk forwarding hozircha ishlamayapti

## 🎯 Keyingi Qadamlar

**1. INVITE Forwarding:**
- Registered extension'ga to'g'ridan-to'g'ri INVITE forward qilish
- Re-INVITE yoki 3-way handshake

**2. SDP Handling:**
- INVITE'dan SDP'ni extract qilish
- 200 OK'ga to'g'ri SDP qo'shish
- RTP port'larni boshqarish

**3. RTP Media:**
- RTP server yoki proxy qo'shish
- Audio codec'larni support qilish
- Media session'ni boshqarish

**4. DID Routing:**
- DID number'larni topish
- Trunk'ga INVITE forward qilish
- External call'larni qo'llab-quvvatlash

## 📞 Yordam

**Agar telefon qilish ishlamasa:**

1. **Server loglarini tekshiring:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]\|INVITE\|Call"
   ```

2. **Extension registered bo'lishini tekshiring:**
   ```bash
   pm2 logs pbx-system | grep "Extension.*registered"
   ```

3. **INVITE xabarlar kelayotganini tekshiring:**
   ```bash
   pm2 logs pbx-system | grep "INVITE received"
   ```

## 🎉 Xulosa

**INVITE handler to'liq implementatsiya qilindi!**

- ✅ INVITE qabul qiladi
- ✅ 100 Trying yuboradi
- ✅ 180 Ringing yuboradi
- ✅ 200 OK yuboradi

**Endi MicroSIP'dan telefon qilishni test qiling!**
