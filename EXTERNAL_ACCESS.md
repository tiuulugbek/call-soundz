# 🌐 Tashqaridan Ulanish - To'liq Yo'riqnoma

Bu yo'riqnoma MicroSIP yoki boshqa SIP klientlar orqali tashqaridan PBX server ga ulanish uchun.

## 📍 Server Ma'lumotlari

- **Statik IP**: `185.137.152.229`
- **SIP Server**: `185.137.152.229:5060` (UDP)
- **SIP Domain**: `185.137.152.229` (IP manzil)
- **Web Dashboard**: http://185.137.152.229:3005
- **RTP Portlar**: `10000-20000` (UDP) - Media uchun

## 🔥 Qadam 1: Firewall Sozlamalari

Windows Firewall da quyidagi portlarni ochish **majburiy**:

### Avtomatik (Tavsiya etiladi):
```powershell
# Administrator huquqlari bilan PowerShell
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
.\setup-firewall.ps1
```

### Qo'lda:
```powershell
# Administrator huquqlari bilan
New-NetFirewallRule -DisplayName "PBX SIP" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow
New-NetFirewallRule -DisplayName "PBX RTP" -Direction Inbound -LocalPort 10000-20000 -Protocol UDP -Action Allow
New-NetFirewallRule -DisplayName "PBX HTTP" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow
```

## 📱 Qadam 2: MicroSIP Sozlamalari

### 1. MicroSIP ni O'rnatish
- Yuklab olish: https://www.microsip.org/
- O'rnatish va ishga tushirish

### 2. Account Qo'shish

**Account Tab:**
- **User**: Extension username (masalan: `1001`)
- **Domain**: `185.137.152.229`
- **Password**: Extension password
- **Display name**: Ixtiyoriy (masalan: "John Doe")

**Network Tab:**
- **Outbound proxy**: Bo'sh qoldiring
- **STUN server**: Bo'sh qoldiring (yoki `stun:stun.l.google.com:19302`)
- **Transport**: UDP

**Audio Tab:**
- **Sound device**: Avtomatik
- **Echo cancellation**: ✅ Yoqilgan
- **Gain control**: ✅ Yoqilgan

**Codecs Tab:**
- ✅ **PCMU (G.711 µ-law)**
- ✅ **PCMA (G.711 A-law)**
- ✅ **GSM**

## 🔐 Qadam 3: Extension Yaratish

Agar extension yo'q bo'lsa, avval yarating:

### Web Dashboard orqali:
1. http://185.137.152.229:3005 ni oching
2. Login: `admin` / `admin123`
3. **Extensions** → **Add New Extension**
4. Username, Password va Display Name kiriting
5. **Save**

### API orqali:
```bash
# 1. Login va token olish
curl -X POST http://185.137.152.229:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Token oling (response dan "token" qiymatini)

# 3. Extension yaratish
curl -X POST http://185.137.152.229:3005/api/v1/extensions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "1001",
    "password": "secure123",
    "displayName": "John Doe"
  }'
```

## ✅ Qadam 4: Ulanishni Tekshirish

### 1. MicroSIP da:
- Status **"Registered"** (yashil) bo'lishi kerak
- "Not registered" bo'lsa:
  - ✅ Password to'g'ri ekanligini tekshiring
  - ✅ Server manzil: `185.137.152.229:5060`
  - ✅ Firewall da 5060/UDP ochilganligini tekshiring

### 2. Test Qo'ng'iroq:
- MicroSIP dan boshqa extension raqamini terib qo'ng'iroq qiling
- Masalan: `1002` ga qo'ng'iroq

### 3. Server da Extension Status:
```bash
curl http://185.137.152.229:3005/api/v1/extensions/1001/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🌐 Domain Sozlash (Opsional)

Agar `call.soundz.uz` domain ishlatmoqchi bo'lsangiz:

### DNS Sozlamalari:
1. DNS provayderingizga kiriting (GoDaddy, Cloudflare, va h.k.)
2. Yangi A record yarating:
   - **Type**: A
   - **Name**: `call` (yoki `@`)
   - **Value**: `185.137.152.229`
   - **TTL**: `3600`

3. .env faylida yangilang:
   ```
   SIP_DOMAIN=call.soundz.uz
   ```

4. Server ni qayta ishga tushiring:
   ```powershell
   # Server ni to'xtatish
   Get-Process -Name node | Stop-Process
   
   # Qayta ishga tushirish
   cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
   npm start
   ```

### MicroSIP da:
- **Domain**: `call.soundz.uz` (IP o'rniga)

## ⚠️ Muammolarni Hal Qilish

### "Not registered" xatosi:
1. ✅ **Password tekshirish**: Extension password to'g'ri ekanligini tekshiring
2. ✅ **Server manzil**: `185.137.152.229:5060` to'g'ri ekanligini tekshiring
3. ✅ **Firewall**: 5060/UDP port ochilganligini tekshiring:
   ```powershell
   Get-NetFirewallRule -DisplayName "PBX SIP" | Select-Object DisplayName, Enabled, Direction
   ```
4. ✅ **Server ishlayaptimi**: 
   ```powershell
   netstat -ano | findstr :5060
   ```
5. ✅ **Internet ulanish**: Tashqaridan 185.137.152.229:5060 ga ulanish mumkinligini tekshiring

### Qo'ng'iroq qilmayapti:
1. ✅ **RTP portlar**: 10000-20000/UDP firewall da ochilganligini tekshiring
2. ✅ **NAT Traversal**: STUN server sozlang:
   - MicroSIP → Network → STUN server: `stun:stun.l.google.com:19302`
3. ✅ **Codec sozlamalari**: PCMU yoki PCMA codec tanlanganligini tekshiring

### Ovoz yo'q:
1. ✅ **Audio device**: To'g'ri tanlanganligini tekshiring
2. ✅ **Microphone va Speaker**: Ishlayotganini tekshiring
3. ✅ **Codec**: PCMU/PCMA ishlatilayotganini tekshiring
4. ✅ **RTP portlar**: 10000-20000/UDP ochilganligini tekshiring

## 🔍 Tekshirish Komandalari

### Firewall qoidalarini ko'rish:
```powershell
Get-NetFirewallRule -DisplayName "PBX*" | Select-Object DisplayName, Enabled, Direction, Protocol, LocalPort | Format-Table
```

### Portlardan foydalanilayotgan jarayonlarni ko'rish:
```powershell
netstat -ano | findstr ":5060 :3005"
```

### Server holatini tekshirish:
```powershell
# HTTP API
curl http://185.137.152.229:3005/api/v1

# SIP port
Test-NetConnection -ComputerName 185.137.152.229 -Port 5060 -InformationLevel Detailed
```

## 📞 Qo'shimcha Ma'lumot

- **Batafsil MicroSIP sozlamalari**: `MICROSIP_SETUP.md`
- **Firewall sozlamalari**: `setup-firewall.ps1`
- **Web Dashboard**: http://185.137.152.229:3005
- **API Dokumentatsiya**: http://185.137.152.229:3005/api/v1

---

## 🎯 Tezkor Sozlamalar Xulosa

1. **Firewall ochish**: `.\setup-firewall.ps1` (Administrator)
2. **MicroSIP sozlash**:
   - User: `1001` (extension username)
   - Domain: `185.137.152.229`
   - Password: Extension password
3. **Test qo'ng'iroq**: MicroSIP dan `1002` ga qo'ng'iroq qiling

Tayyor! 🚀
