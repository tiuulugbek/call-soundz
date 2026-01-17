# Extension 1002 - Real-time Test

## ✅ Tayyor Holat

1. ✅ Extension 1002 yaratilgan
2. ✅ Password cache'ga saqlangan (`[SIP] Stored SIP password in cache for 1002`)
3. ✅ Server ishlayapti
4. ✅ Port 5060/UDP ochiq
5. ✅ MicroSIP sozlamalari to'g'ri:
   - Domain: `call.soundz.uz` ✅
   - Username: `1002` ✅
   - Transport: `UDP` ✅

## 🔍 Real-time Test Qilish

### Qadam 1: Server Loglarini Real-time Kuzatish

**Terminal 1 (Server loglarini kuzatish):**
```bash
cd /root/pbx-system
pm2 logs pbx-system --lines 50
```

### Qadam 2: MicroSIP'dan Register Qilish

**MicroSIP:**
1. **"Сохранить" (Save)** tugmasini bosing (account saqlash)
2. **"Регистр" (Register)** tugmasini bosing yoki avtomatik register boshlanishi kerak

### Qadam 3: Server Loglarida Kutilyotgan Natijalar

**✅ Agar ulanish ishlasa (Kutilyotgan natijalar):**
```
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Request: REGISTER sip:call.soundz.uz SIP/2.0
[SIP] Processing REGISTER from X.X.X.X:XXXXX
[SIP] Sending 401 challenge for 1002 to X.X.X.X:XXXXX
[SIP] Response sent successfully to X.X.X.X:XXXXX
[SIP] Received message from X.X.X.X:XXXXX
[SIP] Processing REGISTER from X.X.X.X:XXXXX
Extension 1002 registered from X.X.X.X:XXXXX
```

**❌ Agar ulanish ishlamasa:**

**Muammo 1: Loglarda hech narsa ko'rinmaydi**
- **Sabab:** SIP xabarlar serverga yetib bormayapti
- **Tekshirish:**
  - DNS: `nslookup call.soundz.uz`
  - Network: `ping call.soundz.uz`
  - Firewall: `ufw status | grep 5060`
  - MicroSIP sozlamalarida **STUN o'chirilganligi**

**Muammo 2: 401 Unauthorized yoki 403 Forbidden**
- **Sabab:** Password noto'g'ri
- **Yechim:** Password cache'da mavjud (logda ko'rsatilgan), lekin MicroSIP'da password to'g'riligini tekshiring

**Muammo 3: 408 Request Timeout**
- **Sabab:** Server javob bermayapti
- **Yechim:** Server loglarini tekshiring

## 📋 MicroSIP Sozlamalari (To'g'ri)

Rasmda ko'rsatilgan sozlamalar:

```
✅ SIP-сервер (SIP-server): call.soundz.uz
✅ Имя пользователя (Username): 1002
✅ Домен (Domain): call.soundz.uz
✅ Транспорт (Transport): UDP
✅ Пароль (Password): ******** (ko'rinadi)
```

**⚠️ Muhim:** 
- "Использовать внешний IP-адрес" (Use External IP Address): ❌ O'chirilgan (to'g'ri)
- ICE: ❌ O'chirilgan (to'g'ri)

## 🚨 Qo'shimcha Tekshirish (Agar Ishlamasa)

### 1. DNS Resolution
```bash
nslookup call.soundz.uz
```

**Kutilyotgan natija:** IP address ko'rsatilishi kerak

### 2. Network Connectivity
```bash
ping call.soundz.uz
```

**Kutilyotgan natija:** Packet loss 0% yoki past

### 3. Firewall
```bash
ufw status | grep 5060
ss -tuln | grep 5060
```

**Kutilyotgan natija:**
- `5060/udp ALLOW` yoki port ochiq

### 4. Server Status
```bash
pm2 status pbx-system
```

**Kutilyotgan natija:** `status: online`

## 📝 Keyingi Qadamlar

1. **Real-time loglarni kuzating:**
   ```bash
   cd /root/pbx-system
   pm2 logs pbx-system --lines 50
   ```

2. **MicroSIP'dan Register qiling:**
   - "Сохранить" (Save) tugmasini bosing
   - "Регистр" (Register) tugmasini bosing

3. **Loglarni tekshiring:**
   - `[SIP] Received message...` ko'rinadimi?
   - `Extension 1002 registered...` ko'rinadimi?

4. **Agar ishlamasa, loglarni yuboring:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```
