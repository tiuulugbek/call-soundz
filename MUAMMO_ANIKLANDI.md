# Muammo Aniqlandi - Yechim

## ✅ Holat

**MicroSIP:**
- ✅ Paketlarni yuborayapti: `TX REGISTER to UDP 69.62.127.9:5060`
- ❌ Server javob bermayapti: `status=408 (Request Timeout)`

**Server:**
- ✅ `0.0.0.0:5060` ga bind qilingan
- ✅ IP: `69.62.127.9`
- ❌ Server loglarida faqat `127.0.0.1` dan paketlar (localhost test)
- ❌ Client'dan (`192.168.20.22`) kelayotgan paketlar ko'rinmayapti

**Xulosa:**
- Client'dan kelayotgan paketlar serverga yetib bormayapti!

## 🔍 Muammo Sababi

**Ehtimoliy sabablar:**
1. **NAT/Firewall muammosi** - Paketlar serverga yetib bormayapti
2. **Network routing muammosi** - Paketlar noto'g'ri yo'naltirilmoqda
3. **Server tomonida firewall** - UDP 5060 bloklangan bo'lishi mumkin (lekin `0.0.0.0` ga bind qilingan)

## 🚨 Keyingi Qadamlar - Real-time Test

### Qadam 1: tcpdump Bilan Paketlarni Kuzatish

**Server'da (root terminal):**
```bash
sudo tcpdump -i any -n -s 0 -X udp port 5060 and host 192.168.20.22
```

**Yoki barcha 5060 port paketlarini kuzatish:**
```bash
sudo tcpdump -i any -n -s 0 -X udp port 5060
```

**MicroSIP'dan Register qiling**

**Natija:**

**✅ Agar paketlar ko'rinsa:**
```
IP 192.168.20.22.57705 > 69.62.127.9.5060: UDP, length 539
REGISTER sip:69.62.127.9 SIP/2.0
...
```
- **Xulosa:** Paketlar serverga yetib bormoqda, lekin server ularni qabul qilmayapti
- **Yechim:** Server binding yoki message handler muammosini tekshiring

**❌ Agar paketlar ko'rinmasa:**
```
(hech qanday paketlar ko'rinmayapti)
```
- **Xulosa:** Paketlar serverga yetib bormayapti
- **Yechim:** Network routing yoki firewall muammosini tekshiring

### Qadam 2: Network Routing Tekshirish

**Server'da:**
```bash
# Network routing tekshirish
ip route get 192.168.20.22

# Network interface'lar tekshirish
ip addr show

# Firewall qoidalar tekshirish
iptables -L -n -v | grep 5060
ufw status verbose | grep 5060
```

**Client'da:**
```bash
# Server'ga tracert qilish
tracert 69.62.127.9

# Yoki
traceroute 69.62.127.9
```

### Qadam 3: Firewall Qoidalarini Tekshirish

**Server'da:**
```bash
# UFW status
ufw status verbose | grep 5060

# iptables status
iptables -L INPUT -n -v | grep 5060
iptables -L OUTPUT -n -v | grep 5060

# Yoki barcha UDP qoidalar
iptables -L -n -v | grep -E "5060|udp"
```

**Agar firewall qoidalari ko'rinmasa:**
- UDP 5060 portini qo'shing:
  ```bash
  ufw allow 5060/udp
  # Yoki iptables orqali
  iptables -A INPUT -p udp --dport 5060 -j ACCEPT
  iptables -A OUTPUT -p udp --sport 5060 -j ACCEPT
  ```

### Qadam 4: Server Message Handler Tekshirish

**Agar tcpdump'da paketlar ko'rinsa, lekin server loglarida ko'rinmasa:**

Server kodida `handleMessage` chaqirilishini tekshiring:

**Loglar:**
```bash
pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
```

**Kod tekshirish:**
- `handleMessage` chaqirilayaptimi?
- `rinfo.address` to'g'rimi?
- Loglar to'g'ri formatdam?

## 🎯 Yechimlar

### Yechim 1: Firewall Qoidalarini Qo'shish

**Agar firewall bloklayapti:**

```bash
# UFW orqali
ufw allow 5060/udp
ufw reload

# Yoki iptables orqali
iptables -A INPUT -p udp --dport 5060 -j ACCEPT
iptables -A OUTPUT -p udp --sport 5060 -j ACCEPT
iptables-save
```

### Yechim 2: Network Routing Muammosini Hal Qilish

**Agar routing muammosi bo'lsa:**

1. **Server network interface'ni tekshiring:**
   ```bash
   ip addr show
   ```

2. **Routing table'ni tekshiring:**
   ```bash
   ip route show
   ```

3. **Default gateway'ni tekshiring:**
   ```bash
   ip route get default
   ```

### Yechim 3: Server Binding Tekshirish

**Server `0.0.0.0:5060` ga bind qilinganligini tekshiring:**

```bash
ss -tuln | grep 5060
sudo lsof -i :5060
```

**Kutilyotgan natija:**
```
udp   UNCONN 0      0            0.0.0.0:5060       0.0.0.0:*
```

**Agar `127.0.0.1:5060` bo'lsa:**
- ❌ Server faqat localhost ga eshitmoqda
- **Yechim:** Server config'da `host: '0.0.0.0'` bo'lishi kerak (✅ hozirgi holat)

## 📋 Test Qilish - Qadam-baqadam

### Test 1: tcpdump Bilan Paketlarni Kuzatish

**Terminal 1 (Server'da):**
```bash
sudo tcpdump -i any -n -s 0 -X udp port 5060
```

**Terminal 2 yoki MicroSIP:**
1. MicroSIP'dan Register qiling

**Natija:**
- ✅ Paketlar ko'rinsa: Paketlar serverga yetib bormoqda
- ❌ Paketlar ko'rinmasa: Paketlar serverga yetib bormayapti

### Test 2: Server Loglarni Real-time Kuzatish

**Terminal 2 (Server'da):**
```bash
pm2 logs pbx-system --lines 50
```

**MicroSIP:**
- Register qiling

**Natija:**
- ✅ Loglar ko'rinsa: Server paketlarni qabul qilayapti
- ❌ Loglar ko'rinmasa: Server paketlarni qabul qilmayapti

### Test 3: Network Connectivity Test

**Client'da:**
```bash
ping 69.62.127.9
tracert 69.62.127.9
```

**Natija:**
- ✅ Ping ishlaydi: Network connectivity bor
- ❌ Ping ishlamaydi: Network muammosi

## 🎯 Keyingi Qadamlar

1. **tcpdump Bilan Paketlarni Kuzatish:**
   ```bash
   sudo tcpdump -i any -n -s 0 -X udp port 5060
   ```
   Keyin MicroSIP'dan Register qiling

2. **Agar paketlar ko'rinmasa:**
   - Network routing muammosini tekshiring
   - Firewall qoidalarini tekshiring
   - Server network interface'ni tekshiring

3. **Agar paketlar ko'rinsa, lekin log'da ko'rinmasa:**
   - Server binding'ni tekshiring
   - Server message handler'ni tekshiring
   - Server loglarini tekshiring

## 📞 Yordam

Agar muammo davom etsa:

1. **tcpdump natijasini yuboring:**
   ```bash
   sudo tcpdump -i any -n -s 0 -X udp port 5060 -c 10
   ```
   (MicroSIP'dan Register qilganingizdan keyin)

2. **Server loglarini yuboring:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```

3. **Network routing natijasini:**
   ```bash
   ip route get 192.168.20.22
   ip addr show
   ```

4. **Firewall qoidalarini:**
   ```bash
   ufw status verbose | grep 5060
   iptables -L -n -v | grep 5060
   ```
