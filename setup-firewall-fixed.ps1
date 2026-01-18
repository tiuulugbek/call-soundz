# Firewall Setup Script for Windows
# Bu skript SIP, RTP va HTTP portlarni firewall da ochadi

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Firewall Sozlamalari" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Administrator huquqlarini tekshirish
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠ Administrator huquqlari kerak!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quyidagi buyruqni Administrator huquqlari bilan ishga tushiring:" -ForegroundColor Yellow
    Write-Host "  PowerShell (Administrator sifatida) → .\setup-firewall.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "Firewall qoidalari yaratilmoqda...`n" -ForegroundColor Yellow

# HTTP Port (3005) - API va Web Dashboard uchun
try {
    $existing = Get-NetFirewallRule -DisplayName "PBX HTTP" -ErrorAction SilentlyContinue
    if ($existing) {
        Remove-NetFirewallRule -DisplayName "PBX HTTP" -ErrorAction SilentlyContinue | Out-Null
    }
    New-NetFirewallRule -DisplayName "PBX HTTP" -Direction Inbound -LocalPort 3005 -Protocol TCP -Action Allow -Description "Call Soundz PBX HTTP API" | Out-Null
    Write-Host "✓ HTTP port 3005 TCP ochildi" -ForegroundColor Green
} catch {
    Write-Host "✗ HTTP port ochilmadi: $_" -ForegroundColor Red
}

# SIP Port (5060) - SIP signaling uchun
try {
    $existing = Get-NetFirewallRule -DisplayName "PBX SIP" -ErrorAction SilentlyContinue
    if ($existing) {
        Remove-NetFirewallRule -DisplayName "PBX SIP" -ErrorAction SilentlyContinue | Out-Null
    }
    New-NetFirewallRule -DisplayName "PBX SIP" -Direction Inbound -LocalPort 5060 -Protocol UDP -Action Allow -Description "Call Soundz PBX SIP Signaling" | Out-Null
    Write-Host "✓ SIP port 5060 UDP ochildi" -ForegroundColor Green
} catch {
    Write-Host "✗ SIP port ochilmadi: $_" -ForegroundColor Red
}

# RTP Port Range (10000-20000) - Media (ovoz/video) uchun
try {
    $existing = Get-NetFirewallRule -DisplayName "PBX RTP" -ErrorAction SilentlyContinue
    if ($existing) {
        Remove-NetFirewallRule -DisplayName "PBX RTP" -ErrorAction SilentlyContinue | Out-Null
    }
    New-NetFirewallRule -DisplayName "PBX RTP" -Direction Inbound -LocalPort 10000-20000 -Protocol UDP -Action Allow -Description "Call Soundz PBX RTP Media" | Out-Null
    $rtpPorts = "10000-20000 UDP"
    Write-Host "✓ RTP portlar $rtpPorts ochildi" -ForegroundColor Green
} catch {
    Write-Host "✗ RTP portlar ochilmadi: $_" -ForegroundColor Red
}

# PostgreSQL port (5432) - faqat localhost uchun (tavsiya)
$existing = Get-NetFirewallRule -DisplayName "PostgreSQL Local" -ErrorAction SilentlyContinue
if ($null -eq $existing) {
    try {
        New-NetFirewallRule -DisplayName "PostgreSQL Local" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow -RemoteAddress LocalSubnet -Description "PostgreSQL Database (Local Only)" | Out-Null
        Write-Host "✓ PostgreSQL port 5432 faqat local uchun ochildi" -ForegroundColor Green
    } catch {
        Write-Host "⚠ PostgreSQL port sozlanmadi: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ PostgreSQL port 5432 allaqachon mavjud" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ Firewall sozlamalari yakunlandi!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ochilgan portlar:" -ForegroundColor Yellow
Write-Host "  HTTP:  3005 TCP  (Web Dashboard va API)" -ForegroundColor White
Write-Host "  SIP:   5060 UDP  (SIP Signaling)" -ForegroundColor White
$rtpDisplay = "10000-20000 UDP"
Write-Host "  RTP:   $rtpDisplay  (Media - Ovoz/Video)" -ForegroundColor White
Write-Host ""
Write-Host "Server manzili:" -ForegroundColor Yellow
Write-Host "  IP:    185.137.152.229" -ForegroundColor White
Write-Host "  SIP:   185.137.152.229:5060" -ForegroundColor White
Write-Host "  HTTP:  http://185.137.152.229:3005" -ForegroundColor White
Write-Host ""
