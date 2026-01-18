# Web Dashboard Kirish - Muammo Hal Qilish

## ✅ Trunk Status

Trunk muvaffaqiyatli ulandi! Qo'ng'iroqlar ishlayapti.

## 🔧 Web Dashboard Muammosi

Web dashboard ga kirmayapti. Server ishga tushirilishi kerak.

## 📋 Kirish Ma'lumotlari

### Web Dashboard:

- **IP orqali**: `http://185.137.152.229:3005`
- **Domain orqali**: `http://c.soundz.uz:3005`
- **Port**: `3005` (TCP/HTTP)

### Serverni Ishga Tushirish:

```powershell
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start
```

## 🔍 Tekshirish

### 1. Server Holatini Tekshirish:

```powershell
# Port tekshirish
netstat -ano | findstr ":3005"

# Yoki
Test-NetConnection -ComputerName localhost -Port 3005
```

### 2. Process Tekshirish:

```powershell
Get-Process -Name node
```

### 3. Loglarni Tekshirish:

```powershell
Get-Content logs\combined.log -Tail 30
```

## ⚠️ Muammolarni Hal Qilish

### Muammo: Port 3005 ochilmagan

**Hal qilish:**

```powershell
# 1. Eski processlarni to'xtatish
Get-Process -Name node | Stop-Process -Force

# 2. Server ni qayta ishga tushirish
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
npm start
```

### Muammo: Server ishga tushmayapti

**Tekshirishlar:**

1. **Database ulanishi:**
   ```powershell
   node check-sip-status.js
   ```

2. **Port band:**
   ```powershell
   netstat -ano | findstr ":3005"
   ```

3. **Xatoliklarni ko'rish:**
   ```powershell
   Get-Content logs\error.log -Tail 30
   ```

### Muammo: Firewall bloklayapti

**Tekshirish:**

```powershell
Get-NetFirewallRule -DisplayName "*3005*" | Select-Object DisplayName, Enabled
```

**Agar ochilmagan bo'lsa:**

```powershell
New-NetFirewallRule -DisplayName "PBX HTTP 3005" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow
```

## ✅ Kutilayotgan Holat

Server ishga tushgandan keyin:

```
✓ PBX System server started on 0.0.0.0:3005
✓ Environment: development
✓ SIP Domain: c.soundz.uz
```

## 🚀 Tez Qayta Ishga Tushirish

```powershell
# Server ni to'xtatish va qayta ishga tushirish
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
npm start
```

## 📝 Eslatmalar

- Server `npm start` yoki `node backend/server.js` bilan ishga tushiriladi
- Server ishga tushishi 5-10 soniya olishi mumkin
- Trunk registration server ishga tushgandan keyin avtomatik ishga tushadi

---

## Xulosa

1. ✅ **Trunk ulandi** - Qo'ng'iroqlar ishlayapti
2. ⚠️ **Web Dashboard** - Server ni qayta ishga tushiring

**Keyingi Qadam:** `npm start` bilan server ni ishga tushiring va `http://185.137.152.229:3005` ga kirib ko'ring.
