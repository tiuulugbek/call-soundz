# Internet Orqali Kirish - call.soundz.uz

## Qadamlar

### 1. DNS Sozlamalari

Domain `call.soundz.uz` server IP ga ko'rsatilishi kerak.

```bash
# Server IP ni olish
curl ifconfig.me
# yoki
hostname -I

# DNS ni tekshirish
dig call.soundz.uz +short
nslookup call.soundz.uz
```

**DNS sozlash**:
- A record: `call.soundz.uz` → `YOUR_SERVER_IP`
- Yoki CNAME: `call.soundz.uz` → `existing-domain.com`

### 2. Nginx Konfiguratsiyasi

```bash
cd /root/pbx-system

# HTTP konfiguratsiyasini ko'chirish
sudo cp nginx.conf.example /etc/nginx/sites-available/call.soundz.uz

# Faollashtirish
sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/

# Tekshirish (acoustic.uz ga ta'sir qilmaydi)
sudo nginx -t

# Qayta yuklash
sudo systemctl reload nginx
```

### 3. Firewall

```bash
# HTTP port
sudo ufw allow 80/tcp

# HTTPS port (SSL uchun)
sudo ufw allow 443/tcp

# SIP port (UDP)
sudo ufw allow 5060/udp

# RTP ports (UDP)
sudo ufw allow 10000:20000/udp

# Status
sudo ufw status
```

### 4. SSL O'rnatish (Tavsiya Etiladi)

```bash
# Certbot o'rnatish
sudo apt-get install certbot python3-certbot-nginx -y

# SSL olish
sudo certbot --nginx -d call.soundz.uz

# Avtomatik yangilanish
sudo systemctl enable certbot.timer
```

Batafsil: `SSL_SETUP.md` faylini ko'ring.

### 5. Tekshirish

```bash
# HTTP orqali
curl http://call.soundz.uz/health

# HTTPS orqali (SSL o'rnatilgandan keyin)
curl https://call.soundz.uz/health

# Browser da
# http://call.soundz.uz (yoki https://call.soundz.uz)
```

## Internet Orqali API Test

### Login

```bash
curl -X POST https://call.soundz.uz/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Extensions

```bash
# Token olish
TOKEN=$(curl -s -X POST https://call.soundz.uz/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Extensions ro'yxati
curl https://call.soundz.uz/api/v1/extensions \
  -H "Authorization: Bearer $TOKEN"
```

## SSL Kerakmi?

### ✅ SSL Shart:

1. **Xavfsizlik** - Ma'lumotlar shifrlanadi
2. **Browser Xavfsizligi** - "Not Secure" xabari ko'rsatilmaydi
3. **SEO** - Google HTTPS ni afzal ko'radi
4. **Ishonch** - Foydalanuvchilar ishonadi
5. **API Xavfsizligi** - Tokenlar xavfsiz uzatiladi

### ⚠️ SSL Bo'lmasa:

- Browser "Not Secure" ko'rsatadi
- Ma'lumotlar shifrlanmaydi
- SEO uchun yomon
- Foydalanuvchilar ishonmaydi

**Xulosa: Production uchun SSL shart!**

## Tezkor Boshlash (SSL bilan)

```bash
# 1. DNS sozlash (domain provider da)
# A record: call.soundz.uz → YOUR_SERVER_IP

# 2. Nginx konfiguratsiyasi
sudo cp /root/pbx-system/nginx.conf.example /etc/nginx/sites-available/call.soundz.uz
sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 3. Firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. SSL olish
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d call.soundz.uz

# 5. Tekshirish
curl https://call.soundz.uz/health
```

## Muammolarni Hal Qilish

### Domain Ishlamayapti

```bash
# DNS tekshirish
dig call.soundz.uz
nslookup call.soundz.uz

# Agar IP noto'g'ri bo'lsa, DNS sozlamalarini o'zgartiring
```

### Nginx Ishlamayapti

```bash
# Status
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/error.log

# Konfiguratsiyani tekshirish
sudo nginx -t
```

### SSL Muammosi

```bash
# Certbot loglari
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Qayta urinib ko'rish
sudo certbot --nginx -d call.soundz.uz --force-renewal
```

## Browser da Ochish

1. **HTTP**: `http://call.soundz.uz` (SSL bo'lmasa)
2. **HTTPS**: `https://call.soundz.uz` (SSL bilan)

Browser da ochilganda:
- Login sahifasi ko'rinishi kerak
- API endpoints ishlashi kerak
- WebSocket ishlashi kerak

## Keyingi Qadamlar

1. ✅ DNS sozlash
2. ✅ Nginx konfiguratsiyasi
3. ✅ Firewall ochish
4. ✅ SSL olish (tavsiya etiladi)
5. ✅ Browser da test qilish
