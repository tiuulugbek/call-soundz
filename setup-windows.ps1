# Windows Setup Script - To'liq o'rnatish
# Bu skript barcha o'rnatish qadamlarni avtomatik bajaradi

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Call Soundz PBX - Windows O'rnatish" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

# 1. Node.js va npm ni tekshirish
Write-Host "[1/7] Node.js va npm ni tekshiryapman..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js topilmadi! O'rnatish kerak." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Dependencies ni o'rnatish
Write-Host "[2/7] Dependencies o'rnatilmoqda..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies allaqachon o'rnatilgan" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Dependencies o'rnatishda xatolik!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies muvaffaqiyatli o'rnatildi" -ForegroundColor Green
}
Write-Host ""

# 3. Papkalarni yaratish
Write-Host "[3/7] Kerakli papkalar yaratilmoqda..." -ForegroundColor Yellow
$folders = @("recordings", "voicemails", "ivr", "logs")
foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "✓ $folder papkasi yaratildi" -ForegroundColor Green
    } else {
        Write-Host "✓ $folder papkasi mavjud" -ForegroundColor Green
    }
}
Write-Host ""

# 4. .env faylini tekshirish
Write-Host "[4/7] .env faylini tekshiryapman..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env fayli mavjud" -ForegroundColor Green
} else {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ .env fayli .env.example dan yaratildi" -ForegroundColor Green
        Write-Host "⚠ .env faylini sozlang va keyin davom eting!" -ForegroundColor Yellow
    } else {
        Write-Host "✗ .env.example topilmadi!" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# 5. PostgreSQL ni tekshirish
Write-Host "[5/7] PostgreSQL ni tekshiryapman..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL topildi" -ForegroundColor Green
    } else {
        throw "PostgreSQL topilmadi"
    }
} catch {
    Write-Host "⚠ PostgreSQL topilmadi!" -ForegroundColor Yellow
    Write-Host "PostgreSQL ni o'rnatish kerak:" -ForegroundColor Yellow
    Write-Host "1. https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "2. Yoki: winget install PostgreSQL.PostgreSQL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "PostgreSQL o'rnatilgandan keyin:" -ForegroundColor Yellow
    Write-Host "  .\setup-postgresql.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
Write-Host ""

# 6. Database ni sozlash
Write-Host "[6/7] Database ni sozlash..." -ForegroundColor Yellow
Write-Host "Database yaratish uchun setup-postgresql.ps1 ni ishga tushiring" -ForegroundColor Cyan
Write-Host "Yoki qo'lda bajarish:" -ForegroundColor Yellow
Write-Host "  psql -U postgres" -ForegroundColor Cyan
Write-Host "  CREATE DATABASE soundzcalldb;" -ForegroundColor Cyan
Write-Host "  CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';" -ForegroundColor Cyan
Write-Host "  GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;" -ForegroundColor Cyan
Write-Host ""
$continue = Read-Host "Database tayyor bo'lsa, davom etish uchun Enter bosing (yoki 'q' chiqish uchun)"
if ($continue -eq 'q') {
    exit 0
}
Write-Host ""

# 7. Migrationlarni ishga tushirish
Write-Host "[7/7] Database migrationlar ishga tushirilmoqda..." -ForegroundColor Yellow
npm run migrate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migrationlar muvaffaqiyatli bajarildi" -ForegroundColor Green
} else {
    Write-Host "✗ Migrationlarda xatolik!" -ForegroundColor Red
    Write-Host "Database va user yaratilganligini tekshiring" -ForegroundColor Yellow
}
Write-Host ""

# 8. Admin user yaratish
Write-Host "[8/8] Admin user yaratish..." -ForegroundColor Yellow
$createAdmin = Read-Host "Admin user yaratishni xohlaysizmi? (y/n)"
if ($createAdmin -eq 'y' -or $createAdmin -eq 'Y') {
    npm run create-admin
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "O'rnatish yakunlandi!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server ni ishga tushirish:" -ForegroundColor Yellow
Write-Host "  npm run dev    - Development mode" -ForegroundColor Cyan
Write-Host "  npm start      - Production mode" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  Web Dashboard: http://localhost:3005" -ForegroundColor Cyan
Write-Host "  API Base: http://localhost:3005/api/v1" -ForegroundColor Cyan
Write-Host ""
