#!/bin/bash

# Internet Orqali Kirish - Tezkor Sozlash

set -e

echo "=========================================="
echo "Internet Orqali Kirish - Tezkor Sozlash"
echo "call.soundz.uz"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "This script needs sudo privileges"
   exit 1
fi

# 1. Server IP
echo "1. Server IP ni tekshirish..."
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo "   Server IP: $SERVER_IP"
echo ""
echo "   ⚠️  DNS sozlamalarida quyidagilarni qo'shing:"
echo "   A record: call.soundz.uz → $SERVER_IP"
echo ""
read -p "DNS sozlanganmi? (y/n): " DNS_SETUP
if [ "$DNS_SETUP" != "y" ]; then
    echo "DNS ni sozlang va keyin qayta urinib ko'ring"
    exit 1
fi

# 2. Nginx konfiguratsiyasi
echo ""
echo "2. Nginx konfiguratsiyasini sozlash..."
if [ ! -f /etc/nginx/sites-available/call.soundz.uz ]; then
    cp /root/pbx-system/nginx.conf.example /etc/nginx/sites-available/call.soundz.uz
    ln -sf /etc/nginx/sites-available/call.soundz.uz /etc/nginx/sites-enabled/
    echo "   ✓ Nginx konfiguratsiyasi yaratildi"
else
    echo "   ✓ Nginx konfiguratsiyasi mavjud"
fi

# Nginx test
if nginx -t > /dev/null 2>&1; then
    systemctl reload nginx
    echo "   ✓ Nginx qayta yuklandi"
else
    echo "   ✗ Nginx konfiguratsiyasida xato"
    nginx -t
    exit 1
fi

# 3. Firewall
echo ""
echo "3. Firewall sozlamalari..."
ufw allow 80/tcp > /dev/null 2>&1 && echo "   ✓ Port 80 ochildi" || echo "   ⚠ Port 80 allaqachon ochiq"
ufw allow 443/tcp > /dev/null 2>&1 && echo "   ✓ Port 443 ochildi" || echo "   ⚠ Port 443 allaqachon ochiq"
ufw allow 5060/udp > /dev/null 2>&1 && echo "   ✓ Port 5060 (SIP) ochildi" || echo "   ⚠ Port 5060 allaqachon ochiq"

# 4. SSL
echo ""
echo "4. SSL sertifikat olish..."
read -p "SSL olishni xohlaysizmi? (y/n): " SSL_SETUP

if [ "$SSL_SETUP" = "y" ]; then
    # Certbot o'rnatish
    if ! command -v certbot &> /dev/null; then
        echo "   Certbot o'rnatilmoqda..."
        apt-get update -qq
        apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
        echo "   ✓ Certbot o'rnatildi"
    fi
    
    # SSL olish
    echo "   SSL sertifikat olinmoqda..."
    certbot --nginx -d call.soundz.uz --non-interactive --agree-tos --email admin@call.soundz.uz --redirect || {
        echo "   ✗ SSL olishda xato"
        echo "   Qo'lda urinib ko'ring: sudo certbot --nginx -d call.soundz.uz"
    }
    
    if [ -f /etc/letsencrypt/live/call.soundz.uz/fullchain.pem ]; then
        echo "   ✓ SSL sertifikat o'rnatildi"
        echo "   ✓ HTTPS faollashtirildi"
    fi
else
    echo "   ⚠ SSL o'tkazib yuborildi (tavsiya etiladi)"
fi

# 5. Tekshirish
echo ""
echo "5. Tekshirish..."
sleep 2

# HTTP test
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://call.soundz.uz/health 2>/dev/null || echo "000")
if [ "$HTTP_TEST" = "200" ]; then
    echo "   ✓ HTTP ishlayapti (http://call.soundz.uz)"
else
    echo "   ✗ HTTP ishlamayapti (HTTP Code: $HTTP_TEST)"
fi

# HTTPS test (agar SSL bo'lsa)
if [ -f /etc/letsencrypt/live/call.soundz.uz/fullchain.pem ]; then
    HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://call.soundz.uz/health 2>/dev/null || echo "000")
    if [ "$HTTPS_TEST" = "200" ]; then
        echo "   ✓ HTTPS ishlayapti (https://call.soundz.uz)"
    else
        echo "   ✗ HTTPS ishlamayapti (HTTP Code: $HTTPS_TEST)"
    fi
fi

echo ""
echo "=========================================="
echo "Sozlash Tugallandi!"
echo "=========================================="
echo ""
echo "Kirish:"
if [ -f /etc/letsencrypt/live/call.soundz.uz/fullchain.pem ]; then
    echo "  https://call.soundz.uz"
else
    echo "  http://call.soundz.uz"
    echo ""
    echo "⚠️  SSL o'rnatishni tavsiya etamiz!"
    echo "  sudo certbot --nginx -d call.soundz.uz"
fi
echo ""
echo "Admin:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
