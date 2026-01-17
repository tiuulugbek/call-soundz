# SSL Sertifikat O'rnatish - call.soundz.uz

## SSL Nima va Nima Uchun Kerak?

SSL (Secure Sockets Layer) sertifikati:
- ✅ Ma'lumotlarni shifrlash (xavfsizlik)
- ✅ Browser da "Secure" ko'rsatkich
- ✅ HTTPS protokoli
- ✅ SEO uchun yaxshi
- ✅ Foydalanuvchilar ishonchi

**Production uchun SSL shart!**

## Let's Encrypt (Bepul SSL)

Let's Encrypt - bepul va avtomatik SSL sertifikat beruvchi xizmat.

## O'rnatish Qadamlar

### 1. Certbot O'rnatish

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# Yoki snap orqali
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. Nginx Konfiguratsiyasini Sozlash

```bash
cd /root/pbx-system

# HTTP konfiguratsiyasini ko'chirish (SSL olishdan oldin)
sudo cp nginx.conf.example /etc/nginx/sites-available/call.soundz.uz
sudo ln -s /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/

# Nginx ni tekshirish
sudo nginx -t

# Nginx ni qayta yuklash
sudo systemctl reload nginx
```

### 3. DNS Tekshirish

Domain DNS sozlamalarini tekshiring:

```bash
# Domain IP ni tekshirish
dig call.soundz.uz +short
nslookup call.soundz.uz

# Server IP ni tekshirish
curl ifconfig.me
```

**Muhim**: Domain `call.soundz.uz` server IP ga ko'rsatilishi kerak!

### 4. SSL Sertifikat Olish

```bash
# Certbot orqali SSL olish (nginx avtomatik sozlaydi)
sudo certbot --nginx -d call.soundz.uz

# Yoki interaktiv bo'lmagan rejimda
sudo certbot --nginx -d call.soundz.uz --non-interactive --agree-tos --email admin@call.soundz.uz
```

Certbot:
- SSL sertifikatni oladi
- Nginx konfiguratsiyasini avtomatik yangilaydi
- HTTPS ni faollashtiradi

### 5. SSL Avtomatik Yangilanish

Certbot avtomatik yangilanishni sozlaydi:

```bash
# Yangilanishni tekshirish
sudo certbot renew --dry-run

# Cron job tekshirish
sudo systemctl status certbot.timer
```

### 6. Tekshirish

```bash
# HTTPS orqali test
curl https://call.soundz.uz/health

# Browser da ochish
# https://call.soundz.uz
```

## Qo'lda SSL Sozlash

Agar certbot ishlamasa, qo'lda sozlash:

### 1. SSL Konfiguratsiyasini Ko'chirish

```bash
sudo cp /root/pbx-system/nginx-ssl.conf.example /etc/nginx/sites-available/call.soundz.uz
```

### 2. SSL Sertifikat Olish (Standalone)

```bash
# Nginx ni to'xtatish
sudo systemctl stop nginx

# SSL olish
sudo certbot certonly --standalone -d call.soundz.uz

# Nginx ni qayta ishga tushirish
sudo systemctl start nginx
```

### 3. Konfiguratsiyani Yangilash

SSL sertifikat yo'llarini tekshiring:

```bash
sudo ls -la /etc/letsencrypt/live/call.soundz.uz/
```

Konfiguratsiyada to'g'ri yo'llar bo'lishi kerak.

## Muammolarni Hal Qilish

### DNS Muammosi

```bash
# Domain IP ni tekshirish
dig call.soundz.uz

# Agar IP noto'g'ri bo'lsa, DNS sozlamalarini o'zgartiring
```

### Port 80/443 Muammosi

```bash
# Portlarni tekshirish
sudo netstat -tlnp | grep -E ':(80|443)'

# Firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Certbot Muammosi

```bash
# Certbot loglari
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Qayta urinib ko'rish
sudo certbot --nginx -d call.soundz.uz --force-renewal
```

## SSL Tekshirish

```bash
# SSL sertifikatni tekshirish
openssl s_client -connect call.soundz.uz:443 -servername call.soundz.uz

# Online tekshirish
# https://www.ssllabs.com/ssltest/analyze.html?d=call.soundz.uz
```

## Muhim Eslatmalar

1. **DNS** - Domain server IP ga ko'rsatilishi kerak
2. **Port 80** - Let's Encrypt uchun ochiq bo'lishi kerak
3. **Nginx** - Ishlamoqchi bo'lishi kerak
4. **Domain** - call.soundz.uz DNS da sozlangan bo'lishi kerak

## Keyingi Qadamlar

SSL o'rnatilgandan keyin:

1. ✅ HTTPS orqali kirish: `https://call.soundz.uz`
2. ✅ API test: `curl https://call.soundz.uz/api/v1/auth/login`
3. ✅ Browser da ochish va sertifikatni tekshirish

## Foydali Linklar

- Let's Encrypt: https://letsencrypt.org/
- Certbot: https://certbot.eff.org/
- SSL Test: https://www.ssllabs.com/ssltest/
