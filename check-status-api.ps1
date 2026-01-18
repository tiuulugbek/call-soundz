# SIP Status Check via API
# Bu skript API orqali SIP holatini tekshiradi

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SIP Status Check via API" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://185.137.152.229:3005/api/v1"
$username = "admin"
$password = "admin123"

Write-Host "[1] Login qilish..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = $username
        password = $password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.token) {
        $token = $loginResponse.token
        Write-Host "✓ Login muvaffaqiyatli!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "✗ Login xatosi!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Login xatosi: $_" -ForegroundColor Red
    Write-Host "Server ishlayaptimi? http://185.137.152.229:3005" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "[2] SIP Server Status..." -ForegroundColor Yellow
try {
    $serverStatus = Invoke-RestMethod -Uri "$baseUrl/sip-status/server" -Method Get -Headers $headers
    if ($serverStatus.success) {
        $data = $serverStatus.data
        Write-Host "  Registrar:" -ForegroundColor Cyan
        Write-Host "    Running: $($data.registrar.running)" -ForegroundColor White
        Write-Host "    Port: $($data.registrar.port)" -ForegroundColor White
        Write-Host "  Trunk Manager:" -ForegroundColor Cyan
        Write-Host "    Running: $($data.trunkManager.running)" -ForegroundColor White
        Write-Host "    Trunks Count: $($data.trunkManager.trunksCount)" -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "  ✗ Server status xatosi: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "[3] SIP Trunks Status..." -ForegroundColor Yellow
try {
    $trunksStatus = Invoke-RestMethod -Uri "$baseUrl/sip-status/trunks" -Method Get -Headers $headers
    if ($trunksStatus.success) {
        $trunks = $trunksStatus.data
        if ($trunks.Count -eq 0) {
            Write-Host "  ⚠ Trunks topilmadi!" -ForegroundColor Yellow
        } else {
            foreach ($trunk in $trunks) {
                Write-Host "  DID Number: $($trunk.number)" -ForegroundColor Cyan
                Write-Host "    Provider: $($trunk.provider)" -ForegroundColor White
                Write-Host "    Registered: $($trunk.registered)" -ForegroundColor $(if ($trunk.registered) { "Green" } else { "Red" })
                Write-Host "    Contact URI: $($trunk.contactUri)" -ForegroundColor White
                Write-Host "    Expires At: $($trunk.expiresAt)" -ForegroundColor White
                Write-Host ""
            }
        }
    }
} catch {
    Write-Host "  ✗ Trunks status xatosi: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "[4] Extensions Status..." -ForegroundColor Yellow
try {
    $extensionsStatus = Invoke-RestMethod -Uri "$baseUrl/sip-status/extensions" -Method Get -Headers $headers
    if ($extensionsStatus.success) {
        $extensions = $extensionsStatus.data
        if ($extensions.Count -eq 0) {
            Write-Host "  ⚠ Registered extensions topilmadi!" -ForegroundColor Yellow
        } else {
            foreach ($ext in $extensions) {
                Write-Host "  Extension ID: $($ext.id)" -ForegroundColor Cyan
                Write-Host "    Contact: $($ext.contact)" -ForegroundColor White
                Write-Host "    Expires: $($ext.expires)" -ForegroundColor White
                Write-Host ""
            }
        }
    }
} catch {
    Write-Host "  ✗ Extensions status xatosi: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "[5] DID Numbers..." -ForegroundColor Yellow
try {
    $didNumbers = Invoke-RestMethod -Uri "$baseUrl/did-numbers" -Method Get -Headers $headers
    if ($didNumbers.success) {
        $dids = $didNumbers.data
        if ($dids.Count -eq 0) {
            Write-Host "  ⚠ DID Numbers topilmadi!" -ForegroundColor Yellow
            Write-Host "  DID Number yaratish kerak." -ForegroundColor Yellow
        } else {
            foreach ($did in $dids) {
                Write-Host "  Number: $($did.number)" -ForegroundColor Cyan
                Write-Host "    Provider: $($did.provider)" -ForegroundColor White
                Write-Host "    Enabled: $($did.enabled)" -ForegroundColor White
                Write-Host "    Route Type: $($did.route_type)" -ForegroundColor White
                Write-Host "    Trunk Username: $($did.trunk_username)" -ForegroundColor White
                Write-Host "    Trunk Password: $(if ($did.trunk_password) { '***' } else { 'N/A' })" -ForegroundColor White
                Write-Host ""
            }
        }
    }
} catch {
    Write-Host "  ✗ DID Numbers xatosi: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Status Check Yakunlandi" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
