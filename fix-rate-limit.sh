#!/bin/bash

# Rate Limit Fix Script

echo "=========================================="
echo "Rate Limit Fix"
echo "=========================================="
echo ""

cd /root/pbx-system

# PM2 ni to'xtatish
echo "1. PM2 ni to'xtatish..."
pm2 stop pbx-system

# PM2 ni o'chirish
echo "2. PM2 ni o'chirish..."
pm2 delete pbx-system

# Cache tozalash
echo "3. PM2 cache tozalash..."
pm2 flush

# Node.js cache tozalash (agar kerak bo'lsa)
echo "4. Node.js cache tozalash..."
find . -name "*.log" -type f -delete 2>/dev/null || true

# Qayta ishga tushirish
echo "5. PM2 ni qayta ishga tushirish..."
pm2 start ecosystem.config.js

echo ""
echo "6. Status tekshirish..."
sleep 2
pm2 status

echo ""
echo "7. Loglarni tekshirish..."
echo "Agar xato bo'lmasa, muammo hal qilindi!"
echo ""
echo "Tekshirish:"
echo "  pm2 logs pbx-system --lines 10"
