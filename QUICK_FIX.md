# Tashqi SIP Ulanish Muammosini Tezkor Hal Qilish

## 1. Tekshirish - Diagnostika Skriptini Ishga Tushirish

```bash
cd /root/pbx-system
chmod +x check-sip-connection.sh
./check-sip-connection.sh
```

Bu skript quyidagilarni tekshiradi:
- ✅ PM2 server status
- ✅ Port 5060/UDP ochiqligi
- ✅ Firewall sozlamalari
- ✅ SIP server loglari
- ✅ Network konfiguratsiyasi

## 2. Eng Keng Tarqalgan Muammo: Password Cache'da Yo'q

### Muammo
Eski extensionlar uchun password cache'da bo'lmasligi mumkin.

### Yechim (30 soniya)
1. **Admin panelga kiring**: https://call.soundz.uz
2. **Extensions** → Extension ni tanlang (masalan: 1001)
3. **Password** button bosish (yoki extension'ni edit qilish)
4. **Yangi password kiriting** (eski yoki yangi - fark yo'q)
5. **Saqlang**

Password cache'ga saqlanadi va endi SIP ulanish ishlashi kerak!

## 3. Zoiper Sozlamalari (To'g'ri Sozlash)

### Account Settings
- ✅ **User**: `1001`
- ✅ **Password**: Extension password (qayta o'rnatilgandan keyin)
- ✅ **Domain**: `call.soundz.uz`
- ✅ **Server**: `call.soundz.uz` (yoki bo'sh qoldiring)
- ✅ **Port**: `5060`
- ✅ **Transport**: `UDP`
- ✅ **Register**: ✅ Enabled

### O'chirilishi Kerak Bo'lgan Sozlamalar
- ❌ **STUN**: O'chirilgan
- ❌ **Outbound Proxy**: Bo'sh (yoki `call.soundz.uz:5060`)

## 4. Server Loglarini Real-time Kuzatish

```bash
# Terminal 1: Loglarni kuzatish
pm2 logs pbx-system --lines 50

# Keyin Zoiper'dan ulanishni urinib ko'ring
# Loglarda quyidagilar ko'rinishi kerak:
# [SIP] Received message from...
# [SIP] Processing REGISTER...
# [SIP] Sending 401 challenge...
# [SIP] Response sent successfully...
```

## 5. Agar Hali Ham Ishlamasa

### Tekshirishlar:

**A) Server Loglarida SIP Xabarlar Kelyaptimi?**
```bash
pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
```
- ✅ Agar ko'rsa: Xabarlar kelyapti - muammo autentifikatsiyada
- ❌ Agar ko'rmasa: Xabarlar yetib bormayapti - network/firewall muammosi

**B) Password Cache'da Bor-Yo'qligini Tekshirish:**
- Extension password'ni qayta o'rnating (yuxoridagi qadam 2)
- Yoki yangi extension yarating

**C) Firewall Tekshirish:**
```bash
ufw status | grep 5060
# yoki
iptables -L -n | grep 5060
```
Port ochiq bo'lishi kerak: `5060/udp ALLOW`

**D) Port Tekshirish:**
```bash
ss -tuln | grep 5060
```
Ko'rinishi kerak: `udp   UNCONN 0      0            0.0.0.0:5060`

## 6. Tezkor Test Qilish

1. **Yangi extension yarating:**
   - Username: `test1001`
   - Password: `test123456`

2. **Zoiper'da yangi account qo'shing:**
   - User: `test1001`
   - Password: `test123456`
   - Domain: `call.soundz.uz`
   - Port: `5060`
   - Transport: `UDP`
   - STUN: O'chirilgan

3. **Register tugmasini bosing**

4. **Server loglarini kuzating:**
   ```bash
   pm2 logs pbx-system --lines 50 | grep "\[SIP\]"
   ```

Agar yangi extension bilan ishlasa - muammo eski extension'ning password cache'ida yo'qligida.

## Muhim O'zgarishlar (Yangi)

### Backend Fix:
- ✅ `sipAccount.server` endi `domain` ishlatadi (`call.soundz.uz`) o'rniga `host` (`0.0.0.0`)
- ✅ Extension o'chirilganda password cache'dan tozalanadi
- ✅ Password o'zgartirilganda cache yangilanadi

### SIP Logging:
- ✅ Barcha SIP xabarlar `[SIP]` prefix bilan loglanadi
- ✅ Info-level logging - hamma xabarlar ko'rinadi

## Qo'ng'iroq Ma'lumotlari

Agar muammo davom etsa, quyidagilarni yuboring:

1. **Diagnostika natijasi:**
   ```bash
   ./check-sip-connection.sh
   ```

2. **Server loglar (SIP xabarlar bilan):**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "\[SIP\]"
   ```

3. **Zoiper sozlamalari** (screenshot yoki matn)

Bu ma'lumotlar bilan aniq yechim taklif qilaman!
