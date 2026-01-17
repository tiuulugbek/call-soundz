# INVITE Handler ToUri Extraction Tuzatildi

## ✅ Tuzatilgan Muammo

**Muammo:**
- INVITE xabarlar kelayapti, lekin `toUri` to'g'ri extract qilinmayapti
- Loglarda: `[SIP] Call from 1002 to <sip` (toUri undefined)
- 100 Trying, 180 Ringing, 200 OK javoblari yuborilmayapti

**Sabab:**
- To header'dan username/number extract qilish logikasi noto'g'ri

**Yechim:**
- To header'dan toUri ni to'g'ri extract qilish logikasi yaxshilandi
- Regex pattern yaxshilandi

## 🔍 To'g'rilangan Kod

**Oldingi kod:**
```javascript
const toUri = toHeader.split(':')[1]?.split('>')[0]?.split('@')[0] || 
              toHeader.split(':')[1]?.split('@')[0] || 
              toHeader.match(/To:\s*[<]?sip:([^@>\s]+)/)?.[1];
```

**Yangi kod:**
```javascript
let toUri;
const toMatch = toHeader.match(/To:\s*(?:<)?sip:([^@>\s]+)@?/);
if (toMatch) {
  toUri = toMatch[1];
} else {
  // Fallback: try to extract after sip:
  const parts = toHeader.split('sip:');
  if (parts[1]) {
    toUri = parts[1].split('@')[0].split('>')[0].split(';')[0].trim();
  }
}

if (!toUri) {
  logger.warn(`[SIP] Could not extract To username from header: ${toHeader}`);
  this.sendResponse(rinfo, '400 Bad Request', message);
  return;
}
```

## 📋 Test Qilish

### Test 1: Internal Call (Extension to Extension)

**Qadamlar:**
1. **Extension 1002 registered bo'lishi kerak** ✅
2. **MicroSIP'dan 1001'ga telefon qiling** (yoki boshqa extension)
3. **Server loglarini kuzating:**
   ```bash
   pm2 logs pbx-system --lines 50
   ```

**Kutilyotgan loglar:**
```
[SIP] INVITE received from 152.53.229.176:XXXXX
[SIP] Call from 1002 to 1001
[SIP] Sending 100 Trying to 152.53.229.176:XXXXX
[SIP] Extension 1001 found
[SIP] Sending 180 Ringing to 152.53.229.176:XXXXX
[SIP] Sending 200 OK to 152.53.229.176:XXXXX
```

### Test 2: Registered Extension Tekshirish

**Agar callee extension registered bo'lsa:**
- 100 Trying yuboriladi ✅
- 180 Ringing yuboriladi ✅
- 200 OK yuboriladi ✅

**Agar callee extension registered bo'lmasa:**
- 100 Trying yuboriladi ✅
- 404 Not Found yuboriladi ❌

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

## 📞 Yordam

**Agar telefon qilish ishlamasa:**

1. **Server loglarini tekshiring:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]\|INVITE\|Call from"
   ```

2. **ToUri extract qilinayotganini tekshiring:**
   - `[SIP] Call from 1002 to 1001` ko'rinadimi?

3. **Javoblar yuborilayotganini tekshiring:**
   - `[SIP] Sending 100 Trying...` ko'rinadimi?
   - `[SIP] Sending 180 Ringing...` ko'rinadimi?
   - `[SIP] Sending 200 OK...` ko'rinadimi?

## 🎉 Xulosa

**ToUri extraction tuzatildi!**

- ✅ To header'dan username/number to'g'ri extract qilinadi
- ✅ Error handling yaxshilandi
- ✅ Server qayta ishga tushirildi

**Endi MicroSIP'dan telefon qilishni test qiling!**
