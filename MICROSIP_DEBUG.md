# MicroSIP Ulanish Muammosi - Debug Yo'riqnomasi

## 🔍 Muammo Tahlili

Loglarda **extension 1001 uchun REGISTER so'rovi yo'q**. Bu quyidagilarni anglatadi:

1. MicroSIP dan REGISTER so'rovi yuborilmayapti
2. Yoki so'rov serverga yetib bormayapti (firewall, network)
3. Yoki MicroSIP sozlamalari noto'g'ri

## ✅ Tekshirish Qadamlari

### 1. MicroSIP Sozlamalari To'g'riligini Tekshirish

**To'g'ri Sozlamalar:**

```
Account: 1001
Login: 1001
Password: 123456
Domain: 185.137.152.229
Server: 185.137.152.229
Port: 5060
Transport: UDP
```

**Muhim Eslatmalar:**
- ✅ **Domain** va **Server** bir xil bo'lishi kerak: `185.137.152.229`
- ✅ **Port**: `5060`
- ✅ **Transport**: `UDP` (TCP emas!)
- ✅ **Outbound proxy** bo'sh bo'lishi kerak yoki bir xil IP bo'lishi kerak

### 2. MicroSIP dan REGISTER So'rovini Tekshirish

**MicroSIP da:**

1. **Preferences** → **Advanced** → **Log** → **Enable logging** yoqilganligini tekshiring
2. **Status** tabida nima ko'rsatilayapti?
   - "Unregistered" - REGISTER so'rovi yuborilmayapti
   - "Failed" - So'rov yuborilmoqda, lekin muvaffaqiyatsiz
   - "Registered" - ✅ Ulanish muvaffaqiyatli

### 3. Firewall Tekshirish

```powershell
# SIP port ochilganligini tekshirish
Get-NetFirewallRule -DisplayName "*5060*" | Select-Object DisplayName, Enabled, Direction

# Agar ochilmagan bo'lsa:
New-NetFirewallRule -DisplayName "PBX SIP 5060" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow
```

### 4. Network Tekshirish

```powershell
# Server 5060 portda ishlayaptimi?
netstat -ano | findstr ":5060" | findstr "UDP"

# Kutilayotgan natija:
# UDP    0.0.0.0:5060           *:*
```

### 5. Real-time Log Monitoring

Yangi terminal ochib, loglarni real-time kuzatish:

```powershell
Get-Content logs\combined.log -Wait -Tail 20 | Select-String -Pattern "REGISTER|1001|Received message"
```

Keyin MicroSIP da **Register** tugmasini bosing va loglarda nima ko'rinishini kuzating.

### 6. MicroSIP Sozlamalarini Qayta Tekshirish

**Ehtimoliy Muammolar:**

1. **Outbound Proxy** noto'g'ri:
   - Bo'sh bo'lishi kerak yoki `185.137.152.229:5060`

2. **Transport Protocol**:
   - `UDP` bo'lishi kerak (TCP emas!)

3. **STUN Server**:
   - Kerak emas, bo'sh qoldirishingiz mumkin

4. **Register expires**:
   - `3600` (default) bo'lishi mumkin

### 7. MicroSIP Log Faylini Tekshirish

MicroSIP log faylini ko'rish:
- MicroSIP → Help → Open log folder
- Eng so'nggi log faylini ochib, xatolarni qidiring

## 🔧 Qo'shimcha Tekshirishlar

### A. Wireshark yoki Packet Capture

Agar mavjud bo'lsa, Wireshark orqali UDP paketlarini ko'rish:
- Filter: `udp.port == 5060`
- MicroSIP dan REGISTER so'rovi chiqib ketayotganini tekshiring

### B. Test Script

Boshqa kompyuterdan SIP REGISTER so'rovi yuborish:

```powershell
# Python script (agar Python o'rnatilgan bo'lsa)
python -c "
import socket
msg = 'REGISTER sip:185.137.152.229 SIP/2.0\r\nVia: SIP/2.0/UDP test:5060\r\nFrom: <sip:1001@185.137.152.229>;tag=test\r\nTo: <sip:1001@185.137.152.229>\r\nCall-ID: test@test.com\r\nCSeq: 1 REGISTER\r\nContact: <sip:1001@test:5060>\r\nExpires: 3600\r\nContent-Length: 0\r\n\r\n'
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(msg.encode(), ('185.137.152.229', 5060))
print('REGISTER sent')
"
```

### C. Server Endpoint Tekshirish

Server to'g'ri portda ishlayaptimi:

```powershell
# Port listener tekshirish
netstat -ano | findstr ":5060"
```

## ✅ Kutilayotgan Natijalar

### MicroSIP dan REGISTER so'rovi kelsa:

```
[SIP] Received message from [MicroSIP_IP]:[Port]
[SIP] Processing REGISTER from [MicroSIP_IP]:[Port]
[SIP] Extension 1001 authentication successful
[SIP] Extension 1001 registered
```

### Loglarda ko'rinishi kerak:

```json
{"level":"info","message":"[SIP] Processing REGISTER from [IP]:[PORT]","service":"pbx-system"}
{"level":"info","message":"[SIP] Extension 1001 registered","service":"pbx-system"}
```

## 📋 Checklist

- [ ] MicroSIP sozlamalari to'g'ri (Domain=Server=IP, Port=5060, UDP)
- [ ] Firewall ochilgan (5060/UDP)
- [ ] Server ishlayapti (port 5060/UDP listener)
- [ ] Extension paroli mavjud (123456)
- [ ] MicroSIP dan Register tugmasini bosdingiz
- [ ] Loglarni real-time kuzatdingiz

## 🚀 Keyingi Qadamlar

1. **MicroSIP sozlamalarini qayta tekshiring** - eng muhimi!
2. **Loglarni real-time kuzatib, Register tugmasini bosing**
3. **Xatolarni qidiring** - loglarda "401", "403", "timeout" kabilarni qidiring

---

## Xulosa

Muammo: **MicroSIP dan REGISTER so'rovi kelmayapti**

**Sabablari:**
1. MicroSIP sozlamalari noto'g'ri (Domain/Server/Port)
2. Firewall bloklayapti
3. MicroSIP dan so'rov yuborilmayapti

**Hal qilish:**
1. MicroSIP sozlamalarini qayta tekshiring
2. Firewall qoidalarini tekshiring
3. Loglarni real-time kuzating
