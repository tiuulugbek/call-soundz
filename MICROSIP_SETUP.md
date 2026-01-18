# MicroSIP Sozlamalari - Tashqaridan Ulanish

Bu yo'riqnoma MicroSIP yoki boshqa SIP klient dasturlar orqali tashqaridan PBX server ga ulanish uchun.

## 📍 Server Ma'lumotlari

- **SIP Server IP**: `185.137.152.229`
- **SIP Port**: `5060` (UDP)
- **SIP Domain**: `185.137.152.229` (yoki `call.soundz.uz` agar domain bog'langan bo'lsa)
- **RTP Portlar**: `10000-20000` (UDP)
- **Web Dashboard**: http://185.137.152.229:3005

## 🔧 MicroSIP Sozlamalari

### 1. MicroSIP ni O'rnatish

1. MicroSIP ni yuklab oling: https://www.microsip.org/
2. O'rnatish va ishga tushirish

### 2. Yangi Account Qo'shish

MicroSIP ochilganda quyidagi sozlamalarni kiriting:

#### Account Tab:
- **User**: Extension username (masalan: `1001`)
- **Domain**: `185.137.152.229` (yoki `call.soundz.uz`)
- **Password**: Extension password
- **Display name**: Extension display name (ixtiyoriy)

#### Network Tab:
- **Outbound proxy**: Bo'sh qoldiring yoki `185.137.152.229:5060`
- **STUN server**: Bo'sh qoldiring (yoki `stun:stun.l.google.com:19302` NAT uchun)
- **Transport**: UDP

#### Audio Tab:
- **Sound device**: Avtomatik tanlash yoki o'zingiz tanlagan
- **Echo cancellation**: ✅ Yoqilgan
- **Gain control**: ✅ Yoqilgan

#### Codecs Tab:
- ✅ **PCMU (G.711 µ-law)** - Eng yaxshi sifat
- ✅ **PCMA (G.711 A-law)** - Eng yaxshi sifat
- ✅ **GSM** - Past trafik
- ✅ **G.729** - Eng past trafik (agar litsenziya bo'lsa)

### 3. To'liq Sozlamalar (Settings → Accounts → Add/Edit)

```
Account Settings:
├── Account
│   ├── User: 1001
│   ├── Domain: 185.137.152.229
│   ├── Password: [extension password]
│   └── Display name: John Doe
│
├── Network
│   ├── Outbound proxy: 
│   ├── STUN server: 
│   └── Transport: UDP
│
└── Advanced
    ├── Register: ✅ Enabled
    ├── Register expiration: 3600
    └── Use outbound proxy: ❌ Disabled
```

## 📱 Boshqa SIP Klientlar uchun

### Zoiper:
1. Settings → Accounts → Add SIP Account
2. Account Details:
   - Domain/Host: `185.137.152.229`
   - Username: Extension username
   - Password: Extension password
   - Display Name: Optional

### X-Lite:
1. Account → SIP Account Settings
2. User ID: `1001@185.137.152.229`
3. Password: Extension password
4. Domain: `185.137.152.229`
5. Port: `5060`

### Softphone (Web):
1. Brauzerda: http://185.137.152.229:3005
2. Login qiling
3. Web Phone yoki SIP Settings bo'limiga o'ting

## 🔐 Extension Yaratish (Agar yo'q bo'lsa)

### API orqali:

```bash
# Login
curl -X POST http://185.137.152.229:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Token oling (response dan)

# Extension yaratish
curl -X POST http://185.137.152.229:3005/api/v1/extensions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "1001",
    "password": "secure123",
    "displayName": "John Doe"
  }'
```

### Web Dashboard orqali:
1. http://185.137.152.229:3005 ni oching
2. Login: `admin` / `admin123`
3. Extensions → Add New Extension
4. Username, Password va Display Name kiriting
5. Save

## 🔥 Firewall Sozlamalari

Agar tashqaridan ulanayotgan bo'lsangiz, Windows Firewall da quyidagi portlarni oching:

```powershell
# Administrator huquqlari bilan
.\setup-firewall.ps1
```

Yoki qo'lda:
```powershell
New-NetFirewallRule -DisplayName "PBX SIP" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow
New-NetFirewallRule -DisplayName "PBX RTP" -Direction Inbound -LocalPort 10000-20000 -Protocol UDP -Action Allow
New-NetFirewallRule -DisplayName "PBX HTTP" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow
```

## ✅ Ulanishni Tekshirish

### 1. MicroSIP da Status:
- ✅ "Registered" ko'rsatgich yashil bo'lishi kerak
- ❌ "Not registered" bo'lsa, parol yoki server manzilini tekshiring

### 2. Server da Extension Status:
```bash
# API orqali
curl http://185.137.152.229:3005/api/v1/extensions/1001/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Qo'ng'iroq:
- MicroSIP dan extension raqamini terib qo'ng'iroq qiling
- Masalan: `1002` yoki `1003` ga qo'ng'iroq

## 🌐 Domain Sozlash (Opsional)

Agar `call.soundz.uz` domain ishlatmoqchi bo'lsangiz:

### DNS Sozlamalari:
1. DNS provayderingizga kiriting
2. Yangi A record yarating:
   - **Type**: A
   - **Name**: `call` (yoki `@`)
   - **Value**: `185.137.152.229`
   - **TTL**: 3600

3. .env faylida:
   ```
   SIP_DOMAIN=call.soundz.uz
   ```

4. Server ni qayta ishga tushiring

### MicroSIP da:
- **Domain**: `call.soundz.uz` (IP o'rniga)

## ⚠️ Muammolarni Hal Qilish

### "Not registered" xatosi:
- ✅ Password to'g'ri ekanligini tekshiring
- ✅ Server IP manzilini tekshiring: `185.137.152.229:5060`
- ✅ Firewall da 5060/UDP port ochilganligini tekshiring
- ✅ Server ishlayaptimi? `netstat -ano | findstr :5060`

### Qo'ng'iroq qilmayapti:
- ✅ RTP portlar (10000-20000) firewall da ochilganmi?
- ✅ NAT traversal sozlamalarini tekshiring
- ✅ STUN server ishlatish (masalan: `stun:stun.l.google.com:19302`)

### Ovoz yo'q:
- ✅ Audio device to'g'ri tanlanganmi?
- ✅ Microphone va Speaker ishlayaptimi?
- ✅ Codec sozlamalarini tekshiring (PCMU/PCMA ishlatish tavsiya)

## 📞 Qo'llab-quvvatlash

Muammo bo'lsa:
- Server loglari: `logs/combined.log`
- API test: http://185.137.152.229:3005/api/v1
- Web Dashboard: http://185.137.152.229:3005
