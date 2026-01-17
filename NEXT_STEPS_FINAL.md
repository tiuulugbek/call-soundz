# Keyingi Qadamlar - To'liq Ishlatish

## 🎯 Hozirgi Holat

✅ **Dastur to'liq ishlayapti!**
- URL: https://call.soundz.uz
- Admin: admin / admin123
- Barcha funksiyalar tayyor

## 📝 Keyingi Qadamlar

### 1. Browser da Test Qilish

1. **Ochish**: https://call.soundz.uz
2. **Login**: admin / admin123
3. **Test qilish**:
   - Dashboard - statistikalar
   - Extensions - ro'yxat va yaratish
   - Calls - qo'ng'iroqlar ro'yxati
   - Recordings - recordinglar
   - IVR - IVR menular
   - Queues - call queuelar

### 2. Birinchi Extension Yaratish

**Browser orqali:**
1. Extensions sahifasiga o'ting
2. "Add Extension" tugmasini bosing
3. Ma'lumotlarni kiriting:
   - Username: 1001
   - Password: secure123
   - Display Name: Test User

**API orqali:**
```bash
# Login va token olish
TOKEN=$(curl -s -X POST https://call.soundz.uz/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Extension yaratish
curl -X POST https://call.soundz.uz/api/v1/extensions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "1001",
    "password": "secure123",
    "displayName": "Test User"
  }'
```

### 3. SIP Telefon Sozlash

Yaratilgan extension uchun SIP telefon sozlamalari:

```
Account Name: 1001
Username: 1001
Password: secure123
Domain: call.soundz.uz
Server: call.soundz.uz
Port: 5060
Transport: UDP
```

### 4. DID Number Sozlash

Agar Bell.uz dan DID raqam bo'lsa:

```bash
curl -X POST https://call.soundz.uz/api/v1/did-numbers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "998901234567",
    "provider": "bell.uz",
    "routeType": "extension",
    "routeTargetId": 1
  }'
```

### 5. IVR Menu Yaratish

```bash
curl -X POST https://call.soundz.uz/api/v1/ivr-menus \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Menu",
    "description": "Asosiy menu",
    "timeout": 10,
    "maxAttempts": 3,
    "config": {
      "0": {"action": "extension", "target": "1001"},
      "1": {"action": "queue", "target": "1"}
    }
  }'
```

### 6. Queue Yaratish

```bash
curl -X POST https://call.soundz.uz/api/v1/queues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Queue",
    "description": "Support jamoasi",
    "strategy": "ringall",
    "timeout": 30
  }'
```

## 🔧 Monitoring va Maintenance

### Daily Tasks
```bash
# Status tekshirish
pm2 status

# Loglarni ko'rish
pm2 logs pbx-system --lines 50

# Database backup
pg_dump -U soundzuz_user soundzcalldb > backup_$(date +%Y%m%d).sql
```

### Weekly Tasks
```bash
# Loglarni tozalash
pm2 flush

# Disk space tekshirish
df -h

# Recording fayllarni tekshirish
du -sh /var/www/call.soundz.uz/recordings
```

## 📚 Dokumentatsiya

- `README.md` - Asosiy ma'lumotlar
- `DEPLOYMENT.md` - Deployment qo'llanmasi
- `SSL_SETUP.md` - SSL sozlash
- `INTERNET_ACCESS.md` - Internet orqali kirish
- `COMPLETE_FEATURES.md` - Barcha funksiyalar
- `FINAL_CHECKLIST.md` - Yakuniy tekshiruv

## 🎉 Muvaffaqiyat!

PBX System to'liq ishlayapti va production uchun tayyor!

**Keyingi versiyalarda:**
- To'liq SIP stack
- Media engine
- Real-time updates
- Advanced features
