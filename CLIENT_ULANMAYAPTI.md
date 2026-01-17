# Client Ulanish Muammosi - Yechimlar

## ❌ Muammo

**Holat:**
- ✅ Server ishlayapti (`status: online`)
- ✅ Port 5060/UDP ochiq (`0.0.0.0:5060`)
- ✅ Firewall ochiq (`5060/udp ALLOW IN`)
- ✅ UDP Socket ishlayapti (localhost test paket qabul qilindi)
- ✅ tcpdump ishga tushdi, **lekin hech qanday paket ko'rinmayapti**

**Xulosa:**
- ❌ MicroSIP va Zoiper'dan paketlar serverga yetib bormayapti
- ❌ Bu client tomonida muammo ekanligini ko'rsatadi

## 🔍 Tekshirish Kerak - Client Tomoni

### Qadam 1: Client'larning Network Connectivity

**Client kompyuterida (MicroSIP yoki Zoiper ishlayotgan mashina):**

1. **DNS Resolution:**
   ```bash
   # Windows Command Prompt:
   nslookup call.soundz.uz
   
   # Yoki PowerShell:
   Resolve-DnsName call.soundz.uz
   ```

   **Kutilyotgan natija:**
   ```
   Name: call.soundz.uz
   Address: 69.62.127.9
   ```

   **Agar xatolik bo'lsa:**
   - ❌ DNS muammosi client tomonida
   - **Yechim:** DNS server sozlamalarini tekshiring yoki IP to'g'ridan-to'g'ri ishlating

2. **Network Connectivity:**
   ```bash
   # Windows Command Prompt:
   ping call.soundz.uz
   ```

   **Kutilyotgan natija:**
   ```
   Pinging call.soundz.uz [69.62.127.9] ...
   Reply from 69.62.127.9: bytes=32 time=XXms ...
   ```

   **Agar xatolik bo'lsa:**
   - ❌ Network connectivity muammosi
   - **Yechim:** Firewall yoki network routing muammosi

### Qadam 2: Client'larning Sozlamalari

#### MicroSIP Sozlamalari:

**To'g'ri sozlamalar:**
```
✅ SIP-сервер (SIP-server): call.soundz.uz
   ⚠️ NOTO'G'RI: 127.0.0.1, localhost, yoki IP address
   
✅ Имя пользователя (Username): 1002
✅ Домен (Domain): call.soundz.uz
✅ Логин (Login): 1002
✅ Пароль (Password): [To'g'ri password]
✅ Порт (Port): 5060
✅ Транспорт (Transport): UDP
```

**⚠️ Muhim - O'chirilishi Kerak:**
```
❌ Использовать внешний IP-адрес (Use External IP Address): O'chirilgan
❌ ICE: O'chirilgan
❌ STUN: O'chirilgan (Advanced sozlamalarda)
```

**Tekshirish:**
1. **Domain to'g'riligini tekshiring:**
   - `call.soundz.uz` (to'g'ri) ✅
   - `127.0.0.1` yoki `localhost` (noto'g'ri) ❌
   - IP address `69.62.127.9` (ishlaydi, lekin DNS ishlatish yaxshiroq) ⚠️

2. **Port to'g'riligini tekshiring:**
   - `5060` (to'g'ri) ✅
   - Boshqa portlar (noto'g'ri) ❌

3. **Transport to'g'riligini tekshiring:**
   - `UDP` (to'g'ri) ✅
   - `TCP` yoki `TLS` (noto'g'ri bu setup uchun) ❌

#### Zoiper Sozlamalari:

**Account Settings:**
```
✅ SIP Domain: call.soundz.uz
✅ Username: 1002
✅ Password: [To'g'ri password]
✅ Hostname: call.soundz.uz
✅ Port: 5060
✅ Transport: UDP
```

**Advanced Settings:**
```
❌ Use STUN: Disabled
❌ Use ICE: Disabled
❌ Use SIP keep-alive: Enabled (optional)
```

### Qadam 3: Client'larning Firewall/NAT Muammosi

**Muammo:**
- Client kompyuterida firewall SIP paketlarni bloklayapti
- NAT/router client'dan serverga paketlarni yubormayapti

**Yechim:**

1. **Windows Firewall:**
   - Windows Firewall'ni o'chirib test qiling (vaqtinchalik)
   - Yoki SIP client'larni Firewall exception'iga qo'shing

2. **Router/NAT:**
   - Client internet'ga ulanganligini tekshiring
   - Port forwarding kerak emas (UDP outbound), lekin NAT traversal muammosi bo'lishi mumkin

### Qadam 4: Client'larda Qayta Sozlash

**MicroSIP:**
1. MicroSIP'ni yoping
2. Account'ni o'chiring
3. Yangi account yarating:
   - Domain: `call.soundz.uz`
   - Username: `1002`
   - Password: [Admin paneldan qayta o'rnatilgan password]
   - Port: `5060`
   - Transport: `UDP`
   - **STUN/ICE o'chirilgan** ⚠️
4. "Сохранить" (Save) tugmasini bosing
5. "Регистр" (Register) tugmasini bosing

**Zoiper:**
1. Zoiper'ni yoping
2. Account'ni o'chiring
3. Yangi account yarating:
   - SIP Domain: `call.soundz.uz`
   - Username: `1002`
   - Password: [Admin paneldan qayta o'rnatilgan password]
   - Hostname: `call.soundz.uz`
   - Port: `5060`
   - Transport: `UDP`
   - **STUN/ICE o'chirilgan** ⚠️
4. Save va Register tugmalarini bosing

## 🚨 Eng Keng Tarqalgan Muammolar

### Muammo 1: Client'dan DNS Resolution Ishlamayapti

**Belgilar:**
- Client kompyuterida `nslookup call.soundz.uz` xatolik beradi
- MicroSIP "DNS timeout" xatosi ko'rsatadi

**Yechim:**
1. DNS server sozlamalarini tekshiring
2. Yoki IP to'g'ridan-to'g'ri ishlating (vaqtinchalik):
   - Domain: `69.62.127.9`
   - Port: `5060`

### Muammo 2: Client Firewall Bloklayapti

**Belgilar:**
- Client kompyuterida firewall SIP paketlarni bloklayapti
- Windows Firewall exception yo'q

**Yechim:**
1. Windows Firewall'ni vaqtinchalik o'chiring
2. Ulanish ishlaydimi tekshiring
3. Agar ishlasa, SIP client'larni Firewall exception'iga qo'shing

### Muammo 3: Network Routing Muammosi

**Belgilar:**
- Client internet'ga ulanadi
- Lekin server'ga paketlar yetib bormayapti

**Yechim:**
1. Client'dan server'ga ping qiling:
   ```bash
   ping call.soundz.uz
   ```
2. Traceroute qiling:
   ```bash
   # Windows:
   tracert call.soundz.uz
   
   # Linux:
   traceroute call.soundz.uz
   ```

### Muammo 4: STUN/ICE Yoqilgan

**Belgilar:**
- MicroSIP yoki Zoiper'da STUN/ICE yoqilgan
- "STUN server error" yoki "Request Timeout" xatosi

**Yechim:**
1. STUN/ICE ni o'chiring
2. Account'ni qayta sozlang
3. Register qiling

## 📋 Test Qilish - Qadam-baqadam

### Test 1: Client DNS Resolution

**Client kompyuterida:**
```bash
# Windows Command Prompt:
nslookup call.soundz.uz

# Yoki PowerShell:
Resolve-DnsName call.soundz.uz
```

**Natija:**
- ✅ IP address ko'rsatiladi: `69.62.127.9`
- ❌ Xatolik: DNS muammosi

### Test 2: Client Network Connectivity

**Client kompyuterida:**
```bash
# Windows Command Prompt:
ping call.soundz.uz
```

**Natija:**
- ✅ Packet loss 0%: Network connectivity bor
- ❌ Xatolik: Network muammosi

### Test 3: Client Firewall Test

**Client kompyuterida:**
1. Windows Firewall'ni vaqtinchalik o'chiring
2. MicroSIP yoki Zoiper'dan Register qiling
3. tcpdump'ni kuzating (server'da)

**Natija:**
- ✅ Paketlar ko'rinadi: Firewall muammosi
- ❌ Paketlar ko'rinmaydi: Boshqa muammo

### Test 4: IP Address To'g'ridan-to'g'ri Ishlatish

**MicroSIP sozlamalari:**
```
SIP-сервер: 69.62.127.9
Домен: 69.62.127.9
Port: 5060
Transport: UDP
```

**Natija:**
- ✅ Paketlar ko'rinadi: DNS muammosi
- ❌ Paketlar ko'rinmaydi: Boshqa muammo

## 🎯 Keyingi Qadamlar

1. **Client DNS Resolution Test:**
   - Client kompyuterida `nslookup call.soundz.uz` qiling
   - IP address ko'rsatiladimi?

2. **Client Network Connectivity Test:**
   - Client kompyuterida `ping call.soundz.uz` qiling
   - Packet loss 0% bo'lishi kerak

3. **Client Firewall Test:**
   - Windows Firewall'ni vaqtinchalik o'chiring
   - Register qilib ko'ring

4. **Client Sozlamalarini Qayta Tekshirish:**
   - Domain: `call.soundz.uz` (to'g'ri)
   - Port: `5060` (to'g'ri)
   - Transport: `UDP` (to'g'ri)
   - STUN/ICE: O'chirilgan ⚠️

5. **IP Address To'g'ridan-to'g'ri Test:**
   - Domain o'rniga `69.62.127.9` ishlating (vaqtinchalik)
   - Register qilib ko'ring

## 📞 Yordam

Agar muammo davom etsa:

1. **Client DNS test natijasini yuboring:**
   ```bash
   nslookup call.soundz.uz
   ```

2. **Client Network test natijasini yuboring:**
   ```bash
   ping call.soundz.uz
   ```

3. **Client Firewall holatini** (yoqilgan/o'chirilgan)

4. **Client SIP sozlamalarini** (screenshot yoki matn)

5. **Server tcpdump natijasini** (agar paketlar ko'rinsa)
