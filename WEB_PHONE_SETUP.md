# Web-based Telefon Funksiyasi - Qo'llanma

## ✅ Qo'shilgan Funksiyalar

### 1. Web Phone UI

**Admin Panel → Telefon** bo'limida:
- ✅ Extension selection dropdown
- ✅ Connection status ko'rsatish
- ✅ Dial pad (0-9, *, #)
- ✅ Phone number input
- ✅ Call/Hangup/Answer buttonlar
- ✅ Active call duration ko'rsatish

### 2. Telefon Funksiyalari

**Qo'shilgan funksiyalar:**
- Extension selection va SIP ulanish
- Dial pad yordamida raqam kiritish
- Qo'ng'iroq qilish (hozircha WebSocket server kerak)
- Qo'ng'iroqni qabul qilish
- Qo'ng'iroqni yakunlash
- Call duration ko'rsatish

## ⚠️ Muhim Eslatma: WebSocket SIP Server

**Hozirgi holat:**
- Web-based telefon funksiyasi qo'shildi ✅
- UI tayyor ✅
- **Lekin WebSocket SIP server kerak** ⚠️

**Sabab:**
- Browser'lar to'g'ridan-to'g'ri UDP ishlatmaydi
- SIP.js WebSocket orqali SIP serverga ulanadi
- Hozirgi server UDP ishlatmoqda

**Yechimlar:**
1. **WebSocket SIP server qo'shish** (recommended)
2. **WebRTC Gateway ishlatish**
3. **Server-side SIP proxy qo'shish**

## 🔧 SIP Ulanish Muammosini Hal Qilish

### Qadam 1: Extension Password Qayta O'rnatish

**⚠️ Muhim:** Extension password cache'da bo'lishi kerak!

1. **Admin Panel → Extensions**
2. Extension'ni tanlang (masalan: 1001)
3. **✏️ Tahrirlash** tugmasini bosing
4. **Password** maydoniga yangi password kiriting (kamida 6 belgi)
5. **Saqlash** tugmasini bosing

**Yoki yangi extension yarating:**
1. Extensions → + Extension Qo'shish
2. Username va Password kiriting
3. Qo'shish tugmasini bosing

### Qadam 2: MicroSIP Sozlamalari

**Account Settings:**
```
Domain: call.soundz.uz
Username: [Extension username]
Password: [Qayta o'rnatilgan password]
Port: 5060
Transport: UDP
```

**Advanced Settings:**
```
✅ Register: Enabled
❌ Use STUN: Disabled ⚠️ MUHIM!
✅ Use SIP keep-alive: Enabled
```

### Qadam 3: Server Loglarini Real-time Kuzatish

```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50 | grep "\[SIP\]"
```

**Kutilyotgan natijalar:**
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for 1001 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
Extension 1001 registered from X.X.X.X:XXXXX
```

## 📋 Keyingi Qadamlar

### 1. SIP Ulanish Muammosini Hal Qilish

1. **Extension Password Qayta O'rnatish:**
   - Admin Panel → Extensions → Extension tanlang → ✏️ Tahrirlash
   - Password maydoniga yangi password kiriting
   - Saqlash

2. **MicroSIP Test:**
   - Yangi extension yarating
   - MicroSIP'da account qo'shing (STUN o'chirilgan)
   - Register tugmasini bosing
   - Loglarni kuzating

3. **Server Loglarini Kuzatish:**
   ```bash
   pm2 logs pbx-system --lines 50
   ```

### 2. Web-based Telefon Funksiyasini To'liq Ishlatish

**WebSocket SIP server qo'shish kerak:**
- SIP.js browser'da WebSocket orqali ishlaydi
- WebRTC gateway yoki SIP proxy kerak
- Yoki SIP.js server-side WebSocket support qo'shish

**Hozirgi vaqtda:**
- ✅ UI tayyor
- ✅ JavaScript funksiyalar qo'shildi
- ⚠️ WebSocket server kerak

## 🎯 Xulosa

### ✅ Bajarilgan

1. Web Phone UI qo'shildi ✅
2. Dial pad funksiyalari qo'shildi ✅
3. Extension selection qo'shildi ✅
4. Call status ko'rsatish qo'shildi ✅

### ⚠️ Kerak

1. SIP ulanish muammosini hal qilish (Extension password cache)
2. WebSocket SIP server qo'shish (web-based telefon uchun)

### 📝 Keyingi Versiya

1. WebSocket SIP server implementatsiyasi
2. WebRTC audio/video support
3. Call recording web-based
4. Active calls monitoring

## 📞 Yordam

Agar SIP ulanish muammosi davom etsa:

1. **Extension Password Qayta O'rnatish:**
   - Admin Panel → Extensions → Tahrirlash → Password → Saqlash

2. **MicroSIP Test:**
   - Yangi extension yarating
   - MicroSIP'da account qo'shing (STUN o'chirilgan)
   - Register tugmasini bosing

3. **Server Loglarini Kuzatish:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```
