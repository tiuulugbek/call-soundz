# SIP Xabarlar Serverga Kelmayapti - Yechimlar

## ✅ Tekshirilgan Holatlar

**Ishlayapti:**
- ✅ Server ishlayapti (`status: online`)
- ✅ Port 5060/UDP ochiq (`0.0.0.0:5060`)
- ✅ Firewall ochiq (`5060/udp ALLOW IN`)
- ✅ UDP Socket ishlayapti (localhost test paket qabul qilindi)
- ✅ DNS Resolution (`call.soundz.uz` → `69.62.127.9`)
- ✅ Network Connectivity (0% packet loss)
- ✅ Extension 1002 password cache'da

**Muammo:**
- ❌ MicroSIP'dan kelayotgan SIP xabarlar logda ko'rinmayapti

## 🔍 Qadam 1: Network Paketlarini Kuzatish (tcpdump)

**Terminal 1 (Network paketlarini kuzatish):**
```bash
cd /root/pbx-system
sudo ./debug-sip-traffic.sh
```

**Yoki to'g'ridan-to'g'ri:**
```bash
sudo tcpdump -i any -n -s 0 -X udp port 5060
```

**Terminal 2 yoki MicroSIP:**
1. MicroSIP'da "Сохранить" (Save) tugmasini bosing
2. "Регистр" (Register) tugmasini bosing

**Kutilyotgan natijalar:**

**✅ Agar network paketlari ko'rinsa:**
```
IP X.X.X.X.XXXX > 69.62.127.9.5060: UDP, length XXX
REGISTER sip:call.soundz.uz SIP/2.0
...
```
- **Xulosa:** Network paketlar kelayapti, lekin server ularni qabul qilmayapti
- **Yechim:** Server binding muammosini tekshiring

**❌ Agar network paketlari ko'rinmasa:**
```
(hech qanday paketlar ko'rinmayapti)
```
- **Xulosa:** MicroSIP'dan paketlar yuborilmayapti yoki noto'g'ri manzilga yuborilmoqda
- **Yechim:** MicroSIP sozlamalarini qayta tekshiring

## 🔍 Qadam 2: MicroSIP Sozlamalarini Qayta Tekshirish

### To'g'ri Sozlamalar:

```
✅ SIP-сервер (SIP-server): call.soundz.uz
✅ Имя пользователя (Username): 1002
✅ Домен (Domain): call.soundz.uz
✅ Логин (Login): 1002
✅ Пароль (Password): [To'g'ri password]
✅ Транспорт (Transport): UDP
```

### ⚠️ Muhim - O'chirilishi Kerak:

```
❌ Использовать внешний IP-адрес (Use External IP Address): O'chirilgan
❌ ICE: O'chirilgan
❌ STUN: O'chirilgan (Advanced sozlamalarda)
❌ Publish Status: O'chirilgan (agar kerak bo'lmasa)
```

### Tekshirish:

1. **Domain to'g'riligi:**
   - `call.soundz.uz` (to'g'ri) ✅
   - `127.0.0.1` yoki `localhost` (noto'g'ri) ❌

2. **Port to'g'riligi:**
   - `5060` (to'g'ri) ✅
   - Boshqa portlar (noto'g'ri) ❌

3. **Transport to'g'riligi:**
   - `UDP` (to'g'ri) ✅
   - `TCP` yoki `TLS` (noto'g'ri MicroSIP uchun) ❌

## 🔍 Qadam 3: Server Binding Tekshirish

Server `0.0.0.0:5060` ga bind qilinganligini tekshiramiz:

```bash
# Port status
ss -tuln | grep 5060

# Process ID
sudo lsof -i :5060
```

**Kutilyotgan natija:**
```
udp   UNCONN 0      0            0.0.0.0:5060       0.0.0.0:*
```

**Agar `127.0.0.1:5060` bo'lsa:**
- ❌ Server faqat localhost ga eshitmoqda
- **Yechim:** Server config'da `host: '0.0.0.0'` bo'lishi kerak

## 🔍 Qadam 4: Server Loglarida Qo'shimcha Debug

Server kodida `handleMessage` chaqirilishini tekshiramiz:

**Loglarda `[SIP DEBUG] Received UDP packet...` ko'rinishi kerak** (biz qo'shgan debug log).

**Agar bu ham ko'rinmasa:**
- ❌ `handleMessage` chaqirilmayapti
- **Muammo:** UDP socket xabarlarni qabul qilmayapti

## 🚨 Eng Keng Tarqalgan Muammolar va Yechimlar

### Muammo 1: MicroSIP'dan Paketlar Yuborilmayapti

**Belgilar:**
- tcpdump'da hech qanday paketlar ko'rinmayapti
- Logda hech narsa ko'rinmayapti

**Yechim:**
1. MicroSIP sozlamalarida domain to'g'riligini tekshiring
2. MicroSIP sozlamalarida port to'g'riligini tekshiring
3. MicroSIP sozlamalarida STUN/ICE o'chirilganligini tekshiring
4. MicroSIP'ni qayta ishga tushiring
5. MicroSIP'da account'ni qayta yarating

### Muammo 2: Network Paketlar Kelayapti, Lekin Server Qabul Qilmayapti

**Belgilar:**
- tcpdump'da paketlar ko'rinayapti
- Server loglarida hech narsa ko'rinmayapti

**Yechim:**
1. Server binding'ni tekshiring (`0.0.0.0:5060` bo'lishi kerak)
2. Server process'ni qayta ishga tushiring:
   ```bash
   pm2 restart pbx-system
   ```
3. Port conflict'ni tekshiring:
   ```bash
   sudo lsof -i :5060
   ```

### Muammo 3: NAT/Network Routing Muammosi

**Belgilar:**
- Lokal network'da ishlayapti
- Tashqaridan ulanish ishlamayapti

**Yechim:**
1. Server IP to'g'riligini tekshiring
2. Network routing qoidalarini tekshiring
3. NAT sozlamalarini tekshiring
4. Firewall log'larini tekshiring:
   ```bash
   sudo tail -f /var/log/ufw.log | grep 5060
   ```

### Muammo 4: MicroSIP Sozlamalari Noto'g'ri

**Yechim:**
1. MicroSIP'da yangi account yarating:
   - Domain: `call.soundz.uz`
   - Username: `1002`
   - Password: [Qayta o'rnatilgan password]
   - Port: `5060`
   - Transport: `UDP`
   - STUN/ICE: O'chirilgan ⚠️

2. MicroSIP'ni qayta ishga tushiring

## 📋 Test Qilish - Qadam-baqadam

### Test 1: Network Paketlarini Kuzatish

**Terminal 1:**
```bash
cd /root/pbx-system
sudo tcpdump -i any -n -s 0 -X udp port 5060
```

**MicroSIP:**
1. "Сохранить" (Save) tugmasini bosing
2. "Регистр" (Register) tugmasini bosing

**Natija:**
- ✅ Paketlar ko'rinsa: Network paketlar kelayapti
- ❌ Paketlar ko'rinmasa: MicroSIP'dan paketlar yuborilmayapti

### Test 2: Server Loglarni Real-time Kuzatish

**Terminal 2:**
```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50
```

**MicroSIP:**
- "Регистр" (Register) tugmasini bosing

**Natija:**
- ✅ Loglar ko'rinsa: Server xabarlarni qabul qilayapti
- ❌ Loglar ko'rinmasa: Server xabarlarni qabul qilmayapti

### Test 3: Localhost Test

**Terminal:**
```bash
cd /root/pbx-system
node test-udp-socket.js
```

**Natija:**
- ✅ Test paket logda ko'rinsa: UDP socket ishlayapti
- ❌ Test paket logda ko'rinmasa: UDP socket muammosi

## 🎯 Keyingi Qadamlar

1. **Network Paketlarini Kuzatish:**
   ```bash
   sudo tcpdump -i any -n -s 0 -X udp port 5060
   ```
   Keyin MicroSIP'dan Register qiling

2. **Agar paketlar ko'rinmasa:**
   - MicroSIP sozlamalarini qayta tekshiring
   - MicroSIP'da yangi account yarating
   - MicroSIP'ni qayta ishga tushiring

3. **Agar paketlar ko'rinsa, lekin log'da ko'rinmasa:**
   - Server binding'ni tekshiring
   - Server'ni qayta ishga tushiring: `pm2 restart pbx-system`

## 📞 Yordam

Agar muammo davom etsa:

1. **tcpdump natijasini yuboring:**
   ```bash
   sudo tcpdump -i any -n -s 0 udp port 5060 -c 10
   ```
   (MicroSIP'dan Register qilganingizdan keyin)

2. **Server loglarini yuboring:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```

3. **MicroSIP sozlamalarini** (screenshot yoki matn)

4. **Network test natijalari:**
   ```bash
   nslookup call.soundz.uz
   ping call.soundz.uz
   ss -tuln | grep 5060
   ```
