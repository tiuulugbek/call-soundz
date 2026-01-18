# SIP Ulanish Muammolarini Hal Qilish

## 🔍 Tekshirish Natijalari

Status check natijalari:
- ✅ Database ulanishi: OK
- ✅ DID Number topildi: `998785553322`
- ⚠️ DID Number da `trunk_username` va `trunk_password` yo'q
- ✅ Extension topildi: `1001`
- ❌ SIP Trunk Manager initialized emas
- ❌ SIP Registrar initialized emas
- ⚠️ SIP_DOMAIN hali `call.soundz.uz`

## 🔧 Muammolarni Hal Qilish

### 1. .env Faylini Yangilash (MUHIM!)

`.env` faylida quyidagini o'zgartiring:

```
SIP_DOMAIN=185.137.152.229
```

**Qo'lda:**
1. `.env` faylini oching
2. `SIP_DOMAIN=call.soundz.uz` ni toping
3. `SIP_DOMAIN=185.137.152.229` ga o'zgartiring
4. Saqlang

### 2. DID Number Trunk Ma'lumotlarini Qo'shish

DID Number (`998785553322`) uchun trunk ma'lumotlarini qo'shing:

#### Web Dashboard orqali (Oson):
1. http://185.137.152.229:3005 ni oching
2. Login: `admin` / `admin123`
3. **DID Numbers** bo'limiga o'ting
4. DID Number `998785553322` ni oching
5. **Trunk Username**: `99785553322` (yoki Bell.uz dan berilgan)
6. **Trunk Password**: Bell.uz SIP trunk parolini kiriting
7. **Enabled**: ✅ Yoqilgan
8. **Save**

#### API orqali:
```powershell
# 1. Login
$loginBody = @{username="admin";password="admin123"} | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://185.137.152.229:3005/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $login.token

# 2. DID Number yangilash
$headers = @{Authorization="Bearer $token"}
$updateBody = @{
    trunk_username="99785553322"
    trunk_password="your-trunk-password"
    enabled=$true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://185.137.152.229:3005/api/v1/did-numbers/1" -Method PUT -Headers $headers -Body $updateBody -ContentType "application/json"
```

### 3. Server ni Qayta Ishga Tushirish

SIP Trunk Manager va SIP Registrar ishga tushishi uchun server ni qayta ishga tushiring:

```powershell
# Eski server ni to'xtatish
Get-Process -Name node | Stop-Process

# Qayta ishga tushirish
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start
```

### 4. Ulanishni Qayta Tekshirish

Server ishga tushgandan keyin (bir necha soniya kutib):

```powershell
# Tekshirish
node check-sip-status.js
```

Yoki API orqali:
```powershell
.\check-status-api.ps1
```

## ✅ Kutilayotgan Natija

Tekshirishdan keyin quyidagilar ko'rinishi kerak:

- ✅ SIP Trunk Manager initialized
- ✅ SIP Registrar initialized
- ✅ DID Number trunk_username va trunk_password sozlangan
- ✅ SIP_DOMAIN=185.137.152.229

## 📡 Extension Ulanishi (MicroSIP)

Extension ulanishi uchun:
1. MicroSIP ni oching
2. Account sozlamalari:
   - **Server**: `185.137.152.229`
   - **Port**: `5060`
   - **User**: `1001`
   - **Password**: Extension password
   - **Domain**: `185.137.152.229`
3. Status "Registered" (yashil) bo'lishi kerak

## ⚠️ Muhim Eslatmalar

1. **DID Number trunk_username va trunk_password** - Bu Bell.uz SIP trunk ulanishi uchun **MAJBURIY**!
2. **SIP_DOMAIN** - IP manzilga o'zgartirish **MAJBURIY**: `185.137.152.229`
3. **Server qayta ishga tushirish** - O'zgarishlarni qo'llash uchun kerak
4. **Firewall** - 5060/UDP port ochilganligini tekshiring (qildingiz ✓)

## 🔍 Tekshirish Endpointlar

- `GET http://185.137.152.229:3005/api/v1/sip-status/server` - Server holati
- `GET http://185.137.152.229:3005/api/v1/sip-status/trunks` - Trunk ulanish holati
- `GET http://185.137.152.229:3005/api/v1/sip-status/extensions` - Extension ulanish holati
- `GET http://185.137.152.229:3005/api/v1/did-numbers` - DID Numbers ro'yxati

## 📞 Qo'shimcha Yordam

- Log fayllari: `logs/combined.log` va `logs/error.log`
- Batafsil ma'lumot: `SIP_STATUS_CHECK.md`
- Tekshirish skriptlari: `check-sip-status.js` va `check-status-api.ps1`
