# PBX Kirish Ma'lumotlari

## 🌐 Web Dashboard Kirish

### Hozirgi Holat (IP orqali):

- **URL**: `http://185.137.152.229:3005`
- **Port**: `3005` (HTTP)
- **Status**: ✅ Ishlayapti (agar server ishga tushgan bo'lsa)

### Domain orqali Kirish (c.soundz.uz):

**Hozirgi Holat:**
- **URL**: `http://c.soundz.uz:3005`
- **Port**: `3005` (HTTP)
- **Status**: ⚠️ DNS sozlamalari kerak

**DNS Sozlamalari:**
- **Type**: A Record
- **Name**: `c` (yoki `@`)
- **Value**: `185.137.152.229`
- **TTL**: `3600` (yoki istalgan)

**DNS Tekshirish:**
```powershell
nslookup c.soundz.uz
```

Agar DNS to'g'ri sozlangan bo'lsa, `185.137.152.229` ko'rinishi kerak.

## 🔌 SIP Kirish (MicroSIP yoki boshqa SIP telefon)

### Hozirgi Sozlamalar:

- **Domain**: `c.soundz.uz`
- **IP**: `185.137.152.229`
- **Port**: `5060` (UDP)
- **Transport**: UDP

### MicroSIP Sozlamalari:

**1. Domain orqali (DNS sozlangan bo'lsa):**
```
Account: c.soundz.uz
Domain: c.soundz.uz
Username: [extension username]
Password: [extension password]
Port: 5060
```

**2. IP orqali (darhol ishlaydi):**
```
Account: 185.137.152.229
Domain: 185.137.152.229
Username: [extension username]
Password: [extension password]
Port: 5060
```

## 📊 Portlar Ro'yxati

| Xizmat | Port | Protocol | Maqsad |
|--------|------|----------|--------|
| Web Dashboard | 3005 | TCP/HTTP | Web interface |
| SIP Server | 5060 | UDP | SIP signalization |
| RTP Media | 10000-20000 | UDP | Audio/Video stream |

## ✅ Kirish Usullari

### 1. Web Dashboard (IP orqali):
```
http://185.137.152.229:3005
```
✅ **Darhol ishlaydi** - DNS sozlamalariga ehtiyoj yo'q

### 2. Web Dashboard (Domain orqali):
```
http://c.soundz.uz:3005
```
⚠️ **DNS sozlamalari kerak** - `c.soundz.uz` → `185.137.152.229`

### 3. SIP (IP orqali):
```
Server: 185.137.152.229
Port: 5060
```
✅ **Darhol ishlaydi**

### 4. SIP (Domain orqali):
```
Server: c.soundz.uz
Port: 5060
```
⚠️ **DNS sozlamalari kerak**

## 🔧 DNS Sozlamalarini Qo'shish

### Cloudflare, GoDaddy, yoki boshqa DNS provayderda:

1. DNS zonangizga kirish
2. Yangi A Record qo'shish:
   - **Type**: `A`
   - **Name**: `c` (yoki `@`)
   - **Content/Value**: `185.137.152.229`
   - **TTL**: `3600`
3. Saqlash va kutish (24-48 soat propagation uchun)

### DNS Tekshirish:

```powershell
# Windows
nslookup c.soundz.uz

# Yoki
ping c.soundz.uz
```

Agar `185.137.152.229` ko'rsatilsa, DNS to'g'ri sozlangan.

## 🚀 Tez Kirish (IP orqali)

Agar DNS sozlashni xohlamasangiz, IP orqali darhol kirishingiz mumkin:

- **Web Dashboard**: `http://185.137.152.229:3005`
- **SIP Server**: `185.137.152.229:5060`

## 📝 Eslatmalar

1. **Port 3005**: Web dashboard uchun
2. **Port 5060**: SIP uchun (UDP)
3. **Port 10000-20000**: RTP media uchun (UDP)
4. **Firewall**: Bu portlar ochilgan bo'lishi kerak (setup-firewall.ps1 ishlatilgan)

## ⚡ Tekshirish

### Server holatini tekshirish:

```powershell
# Port tekshirish
netstat -ano | findstr ":3005"

# Web dashboard tekshirish
curl http://185.137.152.229:3005/api/v1
# Yoki brauzerda: http://185.137.152.229:3005
```

### DNS tekshirish:

```powershell
nslookup c.soundz.uz
ping c.soundz.uz
```

---

## Xulosa

- ✅ **Hozir kirish**: `http://185.137.152.229:3005` (port 3005)
- ⚠️ **c.soundz.uz orqali kirish**: DNS sozlamalari kerak (`c.soundz.uz` → `185.137.152.229`)

DNS sozlamasangiz ham, IP orqali darhol kirishingiz mumkin!
