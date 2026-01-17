#!/bin/bash

echo "=========================================="
echo "PBX System SIP Connection Diagnostics"
echo "=========================================="
echo ""

echo "1. PM2 Server Status:"
echo "----------------------------------------"
pm2 status pbx-system | grep pbx-system
echo ""

echo "2. Port 5060/UDP Status:"
echo "----------------------------------------"
if ss -tuln | grep -q ":5060"; then
    echo "✅ Port 5060/UDP is open and listening"
    ss -tuln | grep ":5060"
else
    echo "❌ Port 5060/UDP is NOT open or listening"
fi
echo ""

echo "3. Firewall Status (5060/UDP):"
echo "----------------------------------------"
if command -v ufw >/dev/null 2>&1; then
    if ufw status | grep -q "5060/udp"; then
        echo "✅ UFW rule found for 5060/udp:"
        ufw status | grep "5060/udp"
    else
        echo "⚠️  No UFW rule found for 5060/udp"
    fi
fi

if iptables -L -n 2>/dev/null | grep -q "5060"; then
    echo "✅ iptables rule found for 5060:"
    iptables -L -n | grep "5060"
else
    echo "ℹ️  No iptables rule found for 5060 (might be managed by UFW)"
fi
echo ""

echo "4. SIP Server Startup Log:"
echo "----------------------------------------"
pm2 logs pbx-system --lines 20 --nostream 2>&1 | grep -i "sip.*registrar\|sip.*start\|sip.*5060" | head -5
echo ""

echo "5. Recent SIP Messages (last 20):"
echo "----------------------------------------"
pm2 logs pbx-system --lines 100 --nostream 2>&1 | grep "\[SIP\]" | tail -20
if [ $? -ne 0 ]; then
    echo "⚠️  No SIP messages found in logs (messages might not be reaching server)"
fi
echo ""

echo "6. Recent Errors (last 10):"
echo "----------------------------------------"
pm2 logs pbx-system --err --lines 10 --nostream 2>&1 | tail -10
echo ""

echo "7. Network Configuration:"
echo "----------------------------------------"
echo "Public IP:"
curl -s --max-time 2 ifconfig.me 2>/dev/null || echo "Could not determine public IP"
echo ""
echo "Local IPs:"
hostname -I 2>/dev/null | tr ' ' '\n' | grep -v "^$"
echo ""

echo "8. DNS Resolution (call.soundz.uz):"
echo "----------------------------------------"
if nslookup call.soundz.uz >/dev/null 2>&1 || dig call.soundz.uz >/dev/null 2>&1; then
    echo "✅ DNS resolution working"
    nslookup call.soundz.uz 2>/dev/null | grep -A2 "Name:" | head -3
else
    echo "⚠️  DNS resolution might have issues"
fi
echo ""

echo "=========================================="
echo "Diagnostics Complete"
echo "=========================================="
echo ""
echo "📋 Key Points:"
echo "  • If port 5060 is open ✅, server is listening"
echo "  • If SIP messages appear in logs ✅, messages are reaching server"
echo "  • If no SIP messages ❌, check firewall/network"
echo "  • Check extension password is in cache (reset password if needed)"
echo ""
