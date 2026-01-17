# Client Sozlamalari Tekshirish - Qadam-baqadam

## ✅ Client Network Test Natijalari

**DNS Resolution:**
```
call.soundz.uz → 69.62.127.9 ✅
```

**Network Connectivity:**
```
Ping: 0% packet loss, 88-91ms ✅
```

**Xulosa:** Client'dan server'ga network connectivity bor!

## ❌ Muammo

**tcpdump'da:**
- ✅ Server'dan trunk'ga (bell.uz) paketlar ko'rinayapti
- ❌ Client'lardan (MicroSIP/Zoiper) paketlar ko'rinmayapti

**Bu shuni anglatadi:**
- Client'dan paketlar yuborilmayapti yoki noto'g'ri manzilga ketmoqda

## 🔍 Keyingi Qadamlar - Client SIP Sozlamalari

### Qadam 1: MicroSIP Sozlamalarini To'liq Tekshirish

**To'g'ri sozlamalar:**
```
✅ SIP-сервер (SIP-server): call.soundz.uz
   ⚠️ TEKSHIRING: 127.0.0.1, localhost emasligini!

✅ Имя пользователя (Username): 1002
✅ Домен (Domain): call.soundz.uz
✅ Логин (Login): 1002
✅ Пароль (Password): [Admin paneldan password]
✅ Порт (Port): 5060
✅ Транспорт (Transport): UDP
```

**⚠️ Muhim - O'chirilishi Kerak:**
```
❌ Использовать внешний IP-адрес (Use External IP Address): O'chirilgan
❌ ICE: O'chirilgan
❌ STUN: O'chirilgan (Advanced sozlamalarda)
❌ SIP-proxy: Bo'sh (agar kerak bo'lmasa)
```

**Tekshirish usullari:**

1. **Domain to'g'riligini tekshiring:**
   - `call.soundz.uz` (to'g'ri) ✅
   - `127.0.0.1` yoki `localhost` (noto'g'ri) ❌
   - IP `69.62.127.9` (test uchun ishlatsa bo'ladi) ⚠️

2. **Account'ni qayta yarating:**
   - MicroSIP'ni yoping
   - Eski account'ni o'chiring
   - Yangi account yarating:
     - Domain: `call.soundz.uz`
     - Username: `1002`
     - Password: [Admin paneldan qayta o'rnatilgan]
     - Port: `5060`
     - Transport: `UDP`
     - **STUN/ICE o'chirilgan** ⚠️

### Qadam 2: IP Address To'g'ridan-to'g'ri Test (Vaqtinchalik)

**Agar domain bilan ishlamasa, IP to'g'ridan-to'g'ri test qiling:**

**MicroSIP sozlamalari:**
```
SIP-сервер: 69.62.127.9
Домен: 69.62.127.9
Port: 5060
Transport: UDP
Username: 1002
Password: [Admin paneldan password]
```

**Natija:**
- ✅ Agar IP bilan ishlasa: DNS resolution muammosi (lekin biz DNS test qildik va ishlayapti)
- ❌ Agar IP bilan ham ishlamasa: Boshqa muammo (sozlamalar yoki firewall)

### Qadam 3: Client Firewall Test

**Windows Firewall tekshirish:**

1. **Windows Firewall'ni vaqtinchalik o'chiring:**
   - Control Panel → Windows Defender Firewall
   - "Turn Windows Defender Firewall on or off"
   - Private va Public network'lar uchun vaqtinchalik o'chiring

2. **MicroSIP'dan Register qiling**

3. **tcpdump'ni kuzating (server'da):**
   ```bash
   sudo tcpdump -i any -n -s 0 -X udp port 5060
   ```

4. **Natijani tekshiring:**
   - ✅ Paketlar ko'rinsa: Firewall muammosi
   - ❌ Paketlar ko'rinmasa: Boshqa muammo

### Qadam 4: MicroSIP Loglarini Tekshirish

**MicroSIP'da loglarni yoqing:**

1. **MicroSIP → Settings → Advanced**
2. **"Logging" yoki "Debug" ni yoqing**
3. **Register tugmasini bosing**
4. **Log faylini tekshiring:**
   - Windows: `%AppData%\MicroSIP\logs\` yoki `%AppData%\MicroSIP\`
   - Log faylida xatolar ko'rinishi mumkin

**Kutilyotgan xatolar:**
- `DNS resolution failed` - DNS muammosi
- `Cannot send packet` - Network/Firewall muammosi
- `STUN error` - STUN yoqilgan (o'chirilishi kerak)

### Qadam 5: Wireshark yoki Packet Capture (Client Tomonida)

**Agar boshqa usullar ishlamasa:**

**Wireshark o'rnatish va ishlatish:**
1. Wireshark'ni o'rnating (https://www.wireshark.org/)
2. Network interface'ni tanlang
3. Filter: `udp port 5060`
4. MicroSIP'dan Register qiling
5. Wireshark'da paketlar ko'rinadimi tekshiring

**Natija:**
- ✅ Paketlar ko'rinsa: Client'dan paketlar yuborilmoqda, lekin server'ga yetib bormayapti
- ❌ Paketlar ko'rinmasa: Client'dan paketlar yuborilmayapti (sozlamalar muammosi)

## 🚨 Eng Keng Tarqalgan Muammolar

### Muammo 1: MicroSIP'da Domain Noto'g'ri

**Belgilar:**
- Domain `127.0.0.1` yoki `localhost` ko'rsatilgan
- Yoki bo'sh

**Yechim:**
- Domain'ni `call.soundz.uz` ga o'zgartiring
- Yoki test uchun `69.62.127.9` ishlating

### Muammo 2: STUN/ICE Yoqilgan

**Belgilar:**
- MicroSIP'da STUN yoki ICE yoqilgan
- "STUN server error" xatosi

**Yechim:**
- STUN/ICE ni o'chiring
- Account'ni qayta sozlang

### Muammo 3: Client Firewall Bloklayapti

**Belgilar:**
- Windows Firewall SIP paketlarni bloklayapti
- Wireshark'da paketlar ko'rinadi, lekin server'ga yetib bormayapti

**Yechim:**
1. Windows Firewall'ni vaqtinchalik o'chiring
2. Ulanish ishlaydimi tekshiring
3. Agar ishlasa, SIP client'larni Firewall exception'iga qo'shing

### Muammo 4: MicroSIP Sozlamalari Saqlanmagan

**Belgilar:**
- Sozlamalar to'g'ri ko'rinadi, lekin saqlash tugmasi bosilmagan
- Account saqlanmagan

**Yechim:**
- "Сохранить" (Save) tugmasini bosing
- MicroSIP'ni qayta ishga tushiring
- Account saqlanganligini tekshiring

## 📋 Test Qilish - Qadam-baqadam

### Test 1: MicroSIP Sozlamalarini Qayta Tekshirish

1. MicroSIP'ni yoping
2. Account'ni oching (yoki yangi yarating)
3. Sozlamalarni tekshiring:
   - Domain: `call.soundz.uz` ✅
   - Port: `5060` ✅
   - Transport: `UDP` ✅
   - STUN/ICE: O'chirilgan ⚠️
4. "Сохранить" (Save) tugmasini bosing
5. MicroSIP'ni qayta ishga tushiring
6. "Регистр" (Register) tugmasini bosing

### Test 2: IP Address To'g'ridan-to'g'ri Test

1. MicroSIP'da yangi account yarating
2. Sozlamalar:
   - Domain: `69.62.127.9` (IP address)
   - Port: `5060`
   - Transport: `UDP`
   - Username: `1002`
   - Password: [Admin paneldan password]
3. "Сохранить" (Save) tugmasini bosing
4. "Регистр" (Register) tugmasini bosing
5. tcpdump'ni kuzating (server'da)

**Natija:**
- ✅ Paketlar ko'rinsa: IP bilan ishlayapti
- ❌ Paketlar ko'rinmasa: Boshqa muammo

### Test 3: Windows Firewall Test

1. Windows Firewall'ni vaqtinchalik o'chiring
2. MicroSIP'dan Register qiling
3. tcpdump'ni kuzating (server'da)

**Natija:**
- ✅ Paketlar ko'rinsa: Firewall muammosi
- ❌ Paketlar ko'rinmasa: Boshqa muammo

## 🎯 Keyingi Qadamlar

1. **MicroSIP Sozlamalarini To'liq Tekshirish:**
   - Domain: `call.soundz.uz` (to'g'ri)
   - Port: `5060` (to'g'ri)
   - Transport: `UDP` (to'g'ri)
   - STUN/ICE: O'chirilgan ⚠️

2. **Account'ni Qayta Yarating:**
   - Eski account'ni o'chiring
   - Yangi account yarating (yuqoridagi sozlamalar bilan)

3. **IP Address Test:**
   - Domain o'rniga `69.62.127.9` ishlating (vaqtinchalik)
   - Register qilib ko'ring

4. **Windows Firewall Test:**
   - Firewall'ni vaqtinchalik o'chiring
   - Register qilib ko'ring

5. **MicroSIP Loglarini Tekshirish:**
   - Logging yoqing
   - Log faylini tekshiring

## 📞 Yordam

Agar muammo davom etsa:

1. **MicroSIP sozlamalarini** (screenshot yoki matn):
   - Domain
   - Port
   - Transport
   - STUN/ICE holati

2. **MicroSIP log faylini** (agar loglarni yoqgan bo'lsangiz)

3. **Windows Firewall holati** (yoqilgan/o'chirilgan)

4. **IP test natijasi** (domain o'rniga IP ishlatganda)
