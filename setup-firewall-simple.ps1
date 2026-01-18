# Firewall Setup Script - Simple Version
Write-Host "Firewall qoidalari yaratilmoqda..." -ForegroundColor Yellow
Write-Host ""

# HTTP Port
try {
    Remove-NetFirewallRule -DisplayName "PBX HTTP" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "PBX HTTP" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow -Description "Call Soundz PBX HTTP API" | Out-Null
    Write-Host "✓ HTTP port 3005 TCP ochildi" -ForegroundColor Green
} catch {
    Write-Host "✗ HTTP port ochilmadi" -ForegroundColor Red
}

# SIP Port
try {
    Remove-NetFirewallRule -DisplayName "PBX SIP" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "PBX SIP" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow -Description "Call Soundz PBX SIP Signaling" | Out-Null
    Write-Host "✓ SIP port 5060 UDP ochildi" -ForegroundColor Green
} catch {
    Write-Host "✗ SIP port ochilmadi" -ForegroundColor Red
}

# RTP Ports
try {
    Remove-NetFirewallRule -DisplayName "PBX RTP" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "PBX RTP" -Direction Inbound -LocalPort 10000-20000 -Protocol UDP -Action Allow -Description "Call Soundz PBX RTP Media" | Out-Null
    Write-Host "✓ RTP portlar 10000-20000 UDP ochildi" -ForegroundColor Green
} catch {
    Write-Host "✗ RTP portlar ochilmadi" -ForegroundColor Red
}

Write-Host ""
Write-Host "✓ Firewall sozlamalari yakunlandi!" -ForegroundColor Green
Write-Host ""
Write-Host "Server manzili: 185.137.152.229" -ForegroundColor Cyan
Write-Host "SIP: 185.137.152.229:5060" -ForegroundColor Cyan
Write-Host "HTTP: http://185.137.152.229:3005" -ForegroundColor Cyan
