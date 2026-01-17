# Tezkor Tekshirish Qo'llanmasi

## ✅ Bell.uz Trunk Ulanishini Tekshirish

### To'g'ri Path

```bash
cd /root/pbx-system
node check-trunk-status.js
```

**⚠️ Muhim:** Fayl `/root/pbx-system/` papkasida, `/root/acoustic-bonus/backend/` emas!

### Natija Tahlili

**✅ REGISTER request sent successfully:**
- Request yuborildi ✅
- Network connectivity bor ✅

**⚠️ No response received:**
- Bu **normal** bo'lishi mumkin
- Trunk server auth kerak bo'lishi mumkin
- Firewall javobni to'sib qo'yishi mumkin
- Trunk server javob bermayotgan bo'lishi mumkin

## 📋 MicroSIP Ulanishini Tekshirish

### Qadam 1: Extension Password Qayta O'rnatish

1. Admin Panel → Extensions
2. Extension'ni tanlang
3. ✏️ Tahrirlash
4. Password maydoniga yangi password kiriting
5. Saqlash

### Qadam 2: MicroSIP Sozlamalari

```
Domain: call.soundz.uz
Username: [Extension username]
Password: [Qayta o'rnatilgan password]
Port: 5060
Transport: UDP
```

**Advanced:**
- ✅ Register: Enabled
- ❌ Use STUN: Disabled ⚠️ MUHIM!
- ✅ Use SIP keep-alive: Enabled

### Qadam 3: Server Loglarini Kuzatish

```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50
```

**Keyin MicroSIP'dan ulanishni urinib ko'ring.**

**Kutilyotgan natijalar:**
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for 1001 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
Extension 1001 registered from X.X.X.X:XXXXX
```

## 🔍 Trunk Ulanishini Tekshirish

### Qadam 1: Trunk Status Script

```bash
cd /root/pbx-system
node check-trunk-status.js
```

**Natija:**
- ✅ Request sent - Network bor ✅
- ⚠️ No response - Normal bo'lishi mumkin (auth kerak)

### Qadam 2: Server Loglarini Tekshirish

```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 100 | grep -i trunk
```

**Kutilyotgan natijalar:**
- `SIP Trunk Manager initialized` ✅
- `Registering trunk for DID...` ✅
- `REGISTER sent for DID...` ✅

### Qadam 3: DID Number Sozlamalari

**Admin Panel → DID Numbers:**
- ✅ Provider: `bell.uz`
- ✅ Trunk Username: `99785553322`
- ✅ Trunk Password: [trunk password] ⚠️ MUHIM!
- ✅ Enabled: ✅

## 🚨 Muammolar va Yechimlar

### Muammo 1: Loglarda Hech Narsa Ko'rinmaydi

**Yechim:**
1. Server'ni restart qiling:
   ```bash
   cd /root/pbx-system
   pm2 restart pbx-system
   ```

2. Real-time loglarni kuzating:
   ```bash
   pm2 logs pbx-system --lines 50
   ```

3. Keyin MicroSIP'dan ulanishni urinib ko'ring

### Muammo 2: Trunk Server Javob Bermayapti

**Bu normal bo'lishi mumkin:**
- Trunk server digest authentication kerak bo'lishi mumkin
- Firewall javobni to'sib qo'yishi mumkin
- Trunk server ishlamayotgan bo'lishi mumkin

**Tekshirish:**
```bash
ping bell.uz
nslookup bell.uz
```

### Muammo 3: Extension Password Cache'da Yo'q

**Yechim:**
1. Extension password'ni qayta o'rnating (admin paneldan)
2. Yoki yangi extension yarating

## 📝 Keyingi Qadamlar

1. **Extension Password Qayta O'rnatish:**
   - Admin panel → Extensions → Tahrirlash → Password → Saqlash

2. **MicroSIP Test:**
   - Yangi extension yarating
   - MicroSIP'da account qo'shing (STUN o'chirilgan)
   - Register tugmasini bosing
   - Loglarni kuzating: `pm2 logs pbx-system`

3. **Trunk Test:**
   - DID number sozlamalarida trunk password tekshiring
   - Trunk status script ishga tushiring: `node check-trunk-status.js`

## 📞 Yordam

Agar muammo davom etsa:

1. **Server loglarini yuboring:**
   ```bash
   cd /root/pbx-system
   pm2 logs pbx-system --lines 100
   ```

2. **Extension ma'lumotlarini yuboring:**
   - Username
   - Password (qayta o'rnatilganmi?)

3. **MicroSIP sozlamalarini** (screenshot)
