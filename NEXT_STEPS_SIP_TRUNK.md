# SIP Trunk Ulanish - Keyingi Qadamlar

## Hozirgi Holat

✅ **Tayyor:**
- Backend API (REST endpoints)
- Database schema (DID numbers, extensions, calls)
- Frontend admin panel (DID Numbers sahifasi)
- Basic SIP Registrar (ichki extensionlar uchun)

⚠️ **Kerak:**
- SIP Trunk Manager (Bell.uz bilan ulanish)
- DID Router (qo'ng'iroqlarni routing)
- Call Handler (qo'ng'iroq boshqaruvi)
- RTP Media handling

## Keyingi Qadamlar

### Qadam 1: SIP Stack O'rnatish

```bash
cd /root/pbx-system
npm install sip.js --save
```

**Nima uchun sip.js?**
- Pure JavaScript (Node.js uchun)
- RFC 3261 (SIP) to'liq qo'llab-quvvatlaydi
- WebSocket va UDP transport
- RTP media handling

### Qadam 2: SIP Trunk Manager Yaratish

**Fayl:** `backend/src/sip/trunk/manager.js`

**Vazifalar:**
- Bell.uz SIP serveriga ulanish
- Registration (SIP REGISTER)
- Inbound qo'ng'iroqlarni qabul qilish
- Outbound qo'ng'iroqlarni yuborish
- DID numberlarni monitoring qilish

### Qadam 3: DID Router Yaratish

**Fayl:** `backend/src/sip/routing/did-router.js`

**Vazifalar:**
- DID numberni topish (database dan)
- Route type aniqlash (extension/IVR/Queue)
- Route target ID topish
- Qo'ng'iroqni yo'naltirish

### Qadam 4: Call Handler Yaratish

**Fayl:** `backend/src/sip/handlers/call-handler.js`

**Vazifalar:**
- INVITE request boshqaruvi
- Call state management
- Call recording
- Call transfer/forward
- Call hangup

### Qadam 5: RTP Media Handling

**Fayl:** `backend/src/sip/media/rtp-handler.js`

**Vazifalar:**
- RTP packet qabul qilish/yuborish
- Codec conversion (PCMU/PCMA/Opus)
- Media recording
- Echo cancellation

## Implementatsiya Rejasi

### Bosqich 1: Asosiy Infrastruktura (1-2 kun)

1. SIP.js o'rnatish
2. SIP Trunk Manager skeleton
3. Basic connection test

### Bosqich 2: DID Routing (2-3 kun)

1. DID Router yaratish
2. Database integration
3. Routing logic

### Bosqich 3: Call Handling (3-4 kun)

1. Call Handler yaratish
2. Call state machine
3. Extension-to-Extension calls
4. DID-to-Extension calls

### Bosqich 4: Media Handling (2-3 kun)

1. RTP handler
2. Codec support
3. Recording integration

### Bosqich 5: Testing va Debug (2-3 kun)

1. Unit tests
2. Integration tests
3. Real-world testing

## Muhim Eslatmalar

### Bell.uz SIP Trunk Sozlamalari

**Ma'lumotlar:**
- Server: `sip.bell.uz` (yoki provider bergan)
- Port: `5060` (default)
- Transport: `UDP` (default)
- Username: `998785553322`
- Password: [sizning parolingiz]

### Firewall Sozlamalari

```bash
# SIP port (5060)
sudo ufw allow 5060/udp
sudo ufw allow 5060/tcp

# RTP ports (10000-20000)
sudo ufw allow 10000:20000/udp
```

### NAT Traversal

Agar server NAT orqasida bo'lsa:
- STUN server kerak
- TURN server (agar kerak bo'lsa)
- Public IP address

## Test Qilish

### 1. SIP Trunk Registration

```bash
# Loglarni kuzatish
pm2 logs pbx-system

# Registration tekshirish
# Loglarda "SIP Trunk registered" ko'rinishi kerak
```

### 2. Test Qo'ng'iroq

1. Tashqi telefon orqali DID numberga qo'ng'iroq qiling
2. Loglarni tekshiring
3. Extension ga ulanayotganini tekshiring

### 3. Extension-to-Extension

1. Ikkita SIP telefon ulang
2. Bir-biriga qo'ng'iroq qiling
3. Qo'ng'iroq o'tayotganini tekshiring

## Xavfsizlik

- ✅ SIP authentication (Digest)
- ✅ Password encryption
- ✅ Rate limiting
- ✅ Firewall rules
- ⚠️ TLS/SRTP (keyingi bosqich)

## Keyingi Rivojlantirish

1. TLS/SRTP support
2. Multiple trunk providers
3. Load balancing
4. High availability
5. Monitoring va analytics
