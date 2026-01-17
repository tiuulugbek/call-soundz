#!/bin/bash

echo "=========================================="
echo "SIP Traffic Debug Script"
echo "=========================================="
echo ""
echo "Bu skript SIP paketlarini network darajasida kuzatadi."
echo "MicroSIP'dan Register qilishni urinib ko'ring va keyin Ctrl+C bosing."
echo ""

# Check if tcpdump is available
if ! command -v tcpdump &> /dev/null; then
    echo "⚠️  tcpdump topilmadi. O'rnatish uchun:"
    echo "   apt-get update && apt-get install -y tcpdump"
    echo ""
    echo "Yoki network paketlarini kuzatish uchun boshqa usul:"
    echo "   ss -tuln | grep 5060  # Port status"
    echo ""
    exit 1
fi

echo "SIP paketlarini kuzatish (port 5060/UDP)..."
echo ""

# Monitor SIP packets on port 5060/UDP
tcpdump -i any -n -s 0 -X udp port 5060 2>&1 | while IFS= read -r line; do
    timestamp=$(date +"%H:%M:%S")
    echo "[$timestamp] $line"
done
