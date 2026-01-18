# PostgreSQL Installation Script for Windows
# Bu skript PostgreSQL ni winget orqali o'rnatadi

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL O'rnatish" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Administrator huquqlarini tekshirish
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠ Administrator huquqlari kerak!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quyidagi buyruqni Administrator huquqlari bilan ishga tushiring:" -ForegroundColor Yellow
    Write-Host "  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Cyan
    Write-Host "  .\install-postgresql.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# winget ni tekshirish
try {
    $wingetVersion = winget --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "winget topilmadi"
    }
    Write-Host "✓ winget topildi: $wingetVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ winget topilmadi!" -ForegroundColor Red
    Write-Host ""
    Write-Host "winget Microsoft Store App Installer bilan keladi." -ForegroundColor Yellow
    Write-Host "Microsoft Store dan App Installer ni o'rnating." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "PostgreSQL o'rnatilmoqda..." -ForegroundColor Yellow
Write-Host "Bu biroz vaqt olishi mumkin..." -ForegroundColor Gray
Write-Host ""

# PostgreSQL ni o'rnatish
try {
    winget install PostgreSQL.PostgreSQL --accept-package-agreements --accept-source-agreements
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ PostgreSQL muvaffaqiyatli o'rnatildi!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Keyingi qadamlar:" -ForegroundColor Yellow
        Write-Host "1. PostgreSQL servisini ishga tushiring" -ForegroundColor Cyan
        Write-Host "2. .\setup-postgresql.ps1 skriptini ishga tushiring" -ForegroundColor Cyan
        Write-Host "3. npm run migrate - database migrationlarni ishga tushirish" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ PostgreSQL o'rnatishda xatolik!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Qo'lda o'rnatish:" -ForegroundColor Yellow
        Write-Host "1. https://www.postgresql.org/download/windows/ dan yuklab oling" -ForegroundColor Yellow
        Write-Host "2. O'rnatishda port 5432 va parol 'postgres' ni tanlang" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "✗ Xatolik: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Qo'lda o'rnatish:" -ForegroundColor Yellow
    Write-Host "1. https://www.postgresql.org/download/windows/ dan yuklab oling" -ForegroundColor Yellow
    Write-Host ""
}
