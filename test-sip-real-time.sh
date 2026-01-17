#!/bin/bash

echo "=========================================="
echo "SIP Connection Real-time Test"
echo "=========================================="
echo ""
echo "Bu skript SIP xabarlarni real-time kuzatadi."
echo "MicroSIP'dan ulanishni urinib ko'ring va keyin Ctrl+C bosing."
echo ""

cd /root/pbx-system

# Real-time loglarni kuzatish
pm2 logs pbx-system --lines 20 --raw | while IFS= read -r line; do
    # Filter SIP messages
    if echo "$line" | grep -qE "\[SIP\]|REGISTER|401|200 OK|Received|Processing|Extension.*registered"; then
        echo "[$(date +%H:%M:%S)] $line"
    fi
done
