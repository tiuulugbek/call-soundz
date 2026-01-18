# Domain Yangilandi: c.soundz.uz

Domain `call.soundz.uz` dan `c.soundz.uz` ga yangilandi.

## ✅ Yangilangan Fayllar

1. **.env fayli:**
   ```
   SIP_DOMAIN=c.soundz.uz
   ```

2. **backend/src/config/config.js:**
   ```
   domain: process.env.SIP_DOMAIN || 'c.soundz.uz'
   ```

## 🔧 Keyingi Qadamlar

### 1. Server ni Qayta Ishga Tushirish

O'zgarishlarni qo'llash uchun server ni qayta ishga tushiring:

```powershell
# Eski server ni to'xtatish
Get-Process -Name node | Stop-Process

# Qayta ishga tushirish
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start
```

### 2. DNS Sozlamalari

DNS provayderingizda quyidagilarni sozlang:

- **Type**: A
- **Name**: `c` (yoki `@`)
- **Value**: `185.137.152.229`
- **TTL**: `3600`

### 3. MicroSIP Sozlamalari

MicroSIP da quyidagi sozlamalarni yangilang:

- **Domain**: `c.soundz.uz` (yoki `185.137.152.229`)
- **Server**: `c.soundz.uz` (yoki `185.137.152.229`)
- **Port**: `5060` (UDP)

## 📍 Yangi Server Ma'lumotlari

- **Domain**: `c.soundz.uz`
- **IP**: `185.137.152.229`
- **SIP Server**: `c.soundz.uz:5060` (yoki `185.137.152.229:5060`)
- **Web Dashboard**: `http://c.soundz.uz:3005` (yoki `http://185.137.152.229:3005`)

## ⚠️ Eslatmalar

1. **DNS Propagation** - DNS o'zgarishlari butun dunyoga tarqalishi uchun 24-48 soat ketishi mumkin
2. **DNS tekshirish** - DNS yangilanganini tekshirish:
   ```powershell
   nslookup c.soundz.uz
   ```
3. **IP ishlatish** - DNS yangilanishini kutishni xohlamasangiz, MicroSIP da IP manzil (`185.137.152.229`) ishlatishingiz mumkin

## ✅ Tekshirish

Server ishga tushgandan keyin:

```powershell
# Status tekshirish
node check-sip-status.js

# Yoki API orqali
.\check-status-api.ps1
```

Tekshirishda quyidagilar ko'rinishi kerak:
- ✅ SIP_DOMAIN=c.soundz.uz
- ✅ Server ishlayapti

## 📞 Qo'shimcha Ma'lumot

- Server manzili: `c.soundz.uz:5060` (DNS yangilangandan keyin)
- Yoki IP orqali: `185.137.152.229:5060` (darhol ishlaydi)
- Web Dashboard: `http://c.soundz.uz:3005` yoki `http://185.137.152.229:3005`
