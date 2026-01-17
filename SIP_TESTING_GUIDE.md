# SIP Testing Guide - Telefon Ulanishini Test Qilish

## 1. SIP Status Tekshirish

### Backend Status
```bash
# PM2 loglarni tekshirish
pm2 logs pbx-system --lines 50

# Quyidagilarni qidiring:
# - ✅ SIP Registrar started on 0.0.0.0:5060
# - ✅ SIP Trunk Manager initialized
# - REGISTER sent for DID...
```

### API orqali Status Tekshirish
```bash
# SIP Server Status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://call.soundz.uz/api/v1/sip-status/server

# Trunk Registration Status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://call.soundz.uz/api/v1/sip-status/trunks

# Extension Registration Status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://call.soundz.uz/api/v1/sip-status/extensions
```

## 2. Extension SIP Phone Sozlash

### Softphone Sozlash (Linphone, X-Lite, MicroSIP)

**Asosiy Sozlamalar:**
- **SIP Server:** `call.soundz.uz` yoki server IP
- **Port:** `5060`
- **Transport:** UDP
- **Username:** Extension username (masalan: `1001`)
- **Password:** Extension password
- **Domain:** `call.soundz.uz`

**Misol (Linphone):**
```
SIP Address: sip:1001@call.soundz.uz
Password: [extension password]
Server: call.soundz.uz:5060
```

### Registration Tekshirish

1. **Admin Panel orqali:**
   - Extensions sahifasiga o'ting
   - Extension status ko'rinishi kerak

2. **API orqali:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://call.soundz.uz/api/v1/sip-status/extensions
   ```

3. **Loglarda:**
   ```bash
   pm2 logs pbx-system | grep "REGISTER"
   ```

## 3. DID Number Test Qilish

### DID Number Sozlash

1. **Admin Panel:**
   - DID Numbers sahifasiga o'ting
   - DID qo'shing:
     - Number: `998785553322`
     - Provider: `bell.uz`
     - Trunk Username: `998785553322`
     - Trunk Password: [bell.uz parol]
     - Route Type: `extension`
     - Route Target ID: [Extension ID]

2. **Trunk Registration:**
   ```bash
   # Loglarda quyidagilarni qidiring:
   pm2 logs pbx-system | grep "REGISTER sent"
   pm2 logs pbx-system | grep "DID"
   ```

### Tashqi Telefondan Qo'ng'iroq

1. **Tashqi telefon (998785553322 raqamidan):**
   - Extension raqamiga qo'ng'iroq qiling (masalan: `1001`)
   - Qo'ng'iroq extension'ga yetib borishi kerak

2. **Loglarda Tekshirish:**
   ```bash
   pm2 logs pbx-system | grep "Incoming call"
   pm2 logs pbx-system | grep "Routing call"
   ```

## 4. Muammolarni Hal Qilish

### Extension Registration Ishlamayapti

**Tekshirish:**
1. Extension username va password to'g'ri ekanligini tekshiring
2. SIP server port ochiq ekanligini tekshiring:
   ```bash
   netstat -tuln | grep 5060
   ```
3. Firewall sozlamalarini tekshiring:
   ```bash
   ufw status
   # Agar kerak bo'lsa:
   ufw allow 5060/udp
   ```

**Yechim:**
- Extension password'ni qayta o'rnating
- SIP phone'dan logout/login qiling
- PM2 ni restart qiling: `pm2 restart pbx-system`

### DID Number Qo'ng'iroq Ishlamayapti

**Tekshirish:**
1. DID number enabled ekanligini tekshiring
2. Trunk registration holatini tekshiring:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://call.soundz.uz/api/v1/sip-status/trunks
   ```
3. Route Target ID to'g'ri ekanligini tekshiring

**Yechim:**
- DID number'ni disable qilib, keyin enable qiling
- Trunk password'ni tekshiring
- PM2 ni restart qiling

### Qo'ng'iroq Extension'ga Yetib Bormayapti

**Tekshirish:**
1. Extension registered ekanligini tekshiring:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://call.soundz.uz/api/v1/sip-status/extensions
   ```
2. Route Type va Route Target ID to'g'ri ekanligini tekshiring

**Yechim:**
- Extension'ni SIP phone'dan logout/login qiling
- DID number route'ni tekshiring va qayta sozlang

## 5. Debugging

### SIP Message Loglari

```bash
# Barcha SIP message'larni ko'rish
pm2 logs pbx-system | grep "SIP"

# Faqat REGISTER message'lar
pm2 logs pbx-system | grep "REGISTER"

# Faqat INVITE message'lar
pm2 logs pbx-system | grep "INVITE"

# Xatolarni ko'rish
pm2 logs pbx-system --err | grep -i error
```

### Network Tekshirish

```bash
# SIP port ochiq ekanligini tekshirish
netstat -tuln | grep 5060

# UDP traffic'ni monitor qilish (tcpdump kerak)
sudo tcpdump -i any -n port 5060

# SIP message'larni ko'rish
sudo tcpdump -i any -n -A port 5060 | grep -E "INVITE|REGISTER|200 OK"
```

## 6. Test Senaryolari

### Senaryo 1: Extension-to-Extension
1. Ikki extension yarating (1001 va 1002)
2. Ikki SIP phone'ni ulang
3. 1001 dan 1002 ga qo'ng'iroq qiling
4. Qo'ng'iroq qabul qilinishi kerak

### Senaryo 2: Tashqi Qo'ng'iroq (DID)
1. DID number yarating va extension'ga ulang
2. Tashqi telefondan DID raqamiga qo'ng'iroq qiling
3. Extension'ga qo'ng'iroq yetib borishi kerak

### Senaryo 3: Extension Registration
1. Extension yarating
2. SIP phone'dan ulang
3. Registration muvaffaqiyatli bo'lishi kerak
4. Admin panel'da status ko'rinishi kerak

## 7. Keyingi Qadamlar

1. **RTP Media Handling** - Audio oqimini boshqarish
2. **Call Recording** - Qo'ng'iroqlarni yozib olish
3. **IVR Integration** - DID number'ni IVR'ga ulash
4. **Queue Integration** - DID number'ni Queue'ga ulash

## 8. Foydali Linklar

- SIP Protocol: RFC 3261
- Linphone: https://www.linphone.org/
- X-Lite: https://www.counterpath.com/x-lite/
- MicroSIP: https://www.microsip.org/
