# Firewall Setup Script - Clean Version
Write-Host "Firewall qoidalari yaratilmoqda..." -ForegroundColor Yellow
Write-Host ""

# HTTP Port 3005 TCP
try {
    Remove-NetFirewallRule -DisplayName "PBX HTTP" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "PBX HTTP" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow -Description "Call Soundz PBX HTTP API" | Out-Null
    Write-Host "[OK] HTTP port 3005 TCP ochildi" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] HTTP port ochilmadi" -ForegroundColor Red
}

# SIP Port 5060 UDP
try {
    Remove-NetFirewallRule -DisplayName "PBX SIP" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "PBX SIP" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow -Description "Call Soundz PBX SIP Signaling" | Out-Null
    Write-Host "[OK] SIP port 5060 UDP ochildi" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] SIP port ochilmadi" -ForegroundColor Red
}

# RTP Ports 10000-20000 UDP
try {
    Remove-NetFirewallRule -DisplayName "PBX RTP" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "PBX RTP" -Direction Inbound -LocalPort 10000-20000 -Protocol UDP -Action Allow -Description "Call Soundz PBX RTP Media" | Out-Null
    Write-Host "[OK] RTP portlar 10000-20000 UDP ochildi" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] RTP portlar ochilmadi" -ForegroundColor Red
}

Write-Host ""
Write-Host "[OK] Firewall sozlamalari yakunlandi!" -ForegroundColor Green
Write-Host ""
Write-Host "Server manzili: 185.137.152.229" -ForegroundColor Cyan
Write-Host "SIP: 185.137.152.229:5060" -ForegroundColor Cyan
Write-Host "HTTP: http://185.137.152.229:3005" -ForegroundColor Cyan
