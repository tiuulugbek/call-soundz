# MicroSIP Ulanish Diagnostikasi - Qadam-baqadam

## ✅ Server Holati

**Test natijasi:**
- ✅ UDP Socket ishlayapti (localhost test paket qabul qilindi)
- ✅ Server ishlayapti (`status: online`)
- ✅ Port 5060/UDP ochiq (`0.0.0.0:5060`)

**Muammo:**
- ❌ SIP xabarlar tashqaridan kelmayapti (MicroSIP'dan xabarlar serverga yetib bormayapti)

## 🔍 Tekshirish Kerak - Qadam-baqadam

### Qadam 1: DNS Resolution

**Terminal:**
```bash
nslookup call.soundz.uz
```

**Kutilyotgan natija:**
```
Name: call.soundz.uz
Address: XXX.XXX.XXX.XXX
```

**Agar xatolik bo'lsa:**
- ❌ DNS muammosi
- **Yechim:** DNS sozlamalarini tekshiring yoki IP to'g'ridan-to'g'ri MicroSIP'da ishlating

### Qadam 2: Network Connectivity

**Terminal:**
```bash
ping call.soundz.uz
```

**Kutilyotgan natija:**
```
PING call.soundz.uz (XXX.XXX.XXX.XXX) ...
XXX bytes from XXX.XXX.XXX.XXX: icmp_seq=1 ...
```

**Agar xatolik bo'lsa:**
- ❌ Network connectivity muammosi
- **Yechim:** Server IP to'g'riligini tekshiring

### Qadam 3: Firewall Tekshirish

**Terminal:**
```bash
# UFW status
ufw status | grep 5060

# iptables
iptables -L -n | grep 5060

# Port status
ss -tuln | grep 5060
```

**Kutilyotgan natija:**
```
5060/udp ALLOW Anywhere
```

**Agar port ochiq bo'lmasa:**
- ❌ Firewall port 5060/UDP ni bloklayapti
- **Yechim:**
  ```bash
  ufw allow 5060/udp
  ufw reload
  ```

### Qadam 4: MicroSIP Sozlamalari

**To'g'ri sozlamalar:**
```
✅ SIP-сервер (SIP-server): call.soundz.uz
✅ Имя пользователя (Username): 1002
✅ Домен (Domain): call.soundz.uz
✅ Транспорт (Transport): UDP
✅ Пароль (Password): [To'g'ri password]
```

**⚠️ Muhim sozlamalar:**
```
❌ Использовать внешний IP-адрес (Use External IP Address): O'chirilgan
❌ ICE: O'chirilgan
❌ STUN: O'chirilgan
```

**Agar STUN yoki ICE yoqilgan bo'lsa:**
- ❌ Timeout xatosi bo'lishi mumkin
- **Yechim:** STUN va ICE ni o'chiring

### Qadam 5: Real-time Loglarni Kuzatish

**Terminal 1 (Real-time loglar):**
```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50
```

**Terminal 2 yoki MicroSIP:**
1. MicroSIP'da "Сохранить" (Save) tugmasini bosing
2. "Регистр" (Register) tugmasini bosing

**Kutilyotgan loglar (ulanish ishlasa):**
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Request: REGISTER sip:call.soundz.uz SIP/2.0
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for 1002 to X.X.X.X:XXXXX
Extension 1002 registered from X.X.X.X:XXXXX
```

**Agar hech narsa ko'rinmasa:**
- ❌ SIP xabarlar serverga yetib bormayapti
- **Yechim:** Qadam 1-4 ni qayta tekshiring

## 🚨 Eng Keng Tarqalgan Muammolar

### Muammo 1: DNS Resolution Muammosi

**Belgilar:**
- `nslookup call.soundz.uz` xatolik beradi
- MicroSIP "DNS timeout" xatosi ko'rsatadi

**Yechim:**
1. DNS server sozlamalarini tekshiring
2. Yoki MicroSIP'da IP to'g'ridan-to'g'ri ishlating (IP address)

### Muammo 2: Firewall Bloklash

**Belgilar:**
- `ufw status | grep 5060` hech narsa ko'rsatmaydi
- Port tashqaridan ochiq emas

**Yechim:**
```bash
ufw allow 5060/udp
ufw allow from any to any port 5060 proto udp
ufw reload
```

**Tekshirish:**
```bash
ufw status | grep 5060
ss -tuln | grep 5060
```

### Muammo 3: STUN/ICE Muammosi

**Belgilar:**
- MicroSIP "STUN server error" xatosi
- "Request Timeout (408)" xatosi

**Yechim:**
- MicroSIP sozlamalarida **STUN o'chirilgan** bo'lishi kerak
- **ICE o'chirilgan** bo'lishi kerak

### Muammo 4: Network NAT/Traversal

**Belgilar:**
- Xabarlar serverga yetib bormayapti
- NAT orqali ulanish qiyin

**Yechim:**
- MicroSIP'da "Use External IP Address" o'chirilgan bo'lishi kerak
- Server kodida `received` va `rport` parametrlari qo'shilgan (✅ amalga oshirilgan)

## 📋 Test Qilish - Qadam-baqadam

### Test 1: Localhost Test (✅ Ishlandi)

```bash
cd /root/pbx-system
node test-udp-socket.js
```

**Natija:** ✅ UDP socket ishlayapti

### Test 2: DNS va Network Test

```bash
nslookup call.soundz.uz
ping call.soundz.uz
```

**Kutilyotgan natija:** IP address ko'rsatilishi kerak ✅

### Test 3: Firewall Test

```bash
ufw status | grep 5060
```

**Kutilyotgan natija:** `5060/udp ALLOW` ✅

### Test 4: MicroSIP Real-time Test

1. **Real-time loglarni kuzating:**
   ```bash
   pm2 logs pbx-system --lines 50
   ```

2. **MicroSIP'dan Register qiling**

3. **Loglarni tekshiring:**
   - `[SIP] Received message...` ko'rinadimi? ✅
   - `Extension 1002 registered...` ko'rinadimi? ✅

## 🎯 Keyingi Qadamlar

1. **DNS va Network Test:**
   ```bash
   nslookup call.soundz.uz
   ping call.soundz.uz
   ```

2. **Firewall Tekshirish:**
   ```bash
   ufw status | grep 5060
   ```

3. **MicroSIP Sozlamalari:**
   - STUN: O'chirilgan ⚠️
   - ICE: O'chirilgan ⚠️
   - Domain: `call.soundz.uz` ✅
   - Port: `5060` ✅

4. **Real-time Loglarni Kuzatish:**
   ```bash
   pm2 logs pbx-system --lines 50
   ```
   Keyin MicroSIP'dan Register tugmasini bosing

## 📞 Yordam

Agar muammo davom etsa:

1. **DNS test natijasini yuboring:**
   ```bash
   nslookup call.soundz.uz
   ```

2. **Network test natijasini yuboring:**
   ```bash
   ping call.soundz.uz
   ```

3. **Firewall status:**
   ```bash
   ufw status | grep 5060
   ```

4. **MicroSIP sozlamalari** (screenshot)

5. **Real-time loglar** (MicroSIP'dan Register qilganingizdan keyin)
