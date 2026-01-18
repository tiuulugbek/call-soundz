# PostgreSQL Setup Script for Windows
# Bu skript PostgreSQL database va user ni avtomatik yaratadi

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# PostgreSQL bin papkasini topish
$pgPaths = @(
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files (x86)\PostgreSQL\16\bin",
    "C:\Program Files (x86)\PostgreSQL\15\bin",
    "C:\Program Files (x86)\PostgreSQL\14\bin"
)

$pgBinPath = $null
foreach ($path in $pgPaths) {
    if (Test-Path $path) {
        $pgBinPath = $path
        Write-Host "PostgreSQL topildi: $pgBinPath" -ForegroundColor Green
        break
    }
}

if (-not $pgBinPath) {
    Write-Host "PostgreSQL topilmadi!" -ForegroundColor Red
    Write-Host ""
    Write-Host "PostgreSQL ni o'rnatish kerak:" -ForegroundColor Yellow
    Write-Host "1. https://www.postgresql.org/download/windows/ dan yuklab oling" -ForegroundColor Yellow
    Write-Host "2. Yoki winget orqali: winget install PostgreSQL.PostgreSQL" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# PATH ga qo'shish
$env:Path = "$pgBinPath;$env:Path"

# PostgreSQL servisini tekshirish
Write-Host "PostgreSQL servisini tekshiryapman..." -ForegroundColor Yellow
$pgServices = Get-Service | Where-Object { $_.Name -like "postgresql*" }
if ($pgServices.Count -eq 0) {
    Write-Host "PostgreSQL servis topilmadi!" -ForegroundColor Red
    Write-Host "PostgreSQL servisini ishga tushiring:" -ForegroundColor Yellow
    Write-Host "Start Menu → PostgreSQL → pgAdmin 4" -ForegroundColor Yellow
    exit 1
}

$runningService = $pgServices | Where-Object { $_.Status -eq "Running" }
if ($runningService.Count -eq 0) {
    Write-Host "PostgreSQL servis ishlamayapti. Ishga tushiryapman..." -ForegroundColor Yellow
    Start-Service -Name $pgServices[0].Name
    Start-Sleep -Seconds 3
}

Write-Host "PostgreSQL servis ishlayapti!" -ForegroundColor Green
Write-Host ""

# Database va user yaratish
Write-Host "Database va user yaratilmoqda..." -ForegroundColor Yellow

$sqlCommands = @"
CREATE DATABASE soundzcalldb;
CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\c soundzcalldb
GRANT ALL ON SCHEMA public TO soundzuz_user;
"@

# SQL faylni yaratish
$tempSqlFile = "$env:TEMP\setup_db.sql"
$sqlCommands | Out-File -FilePath $tempSqlFile -Encoding UTF8

# PostgreSQL ga ulanish
Write-Host "PostgreSQL ga ulanish uchun parol kiriting (postgres user uchun):" -ForegroundColor Yellow
Write-Host "Agar parol bo'sh bo'lsa, Enter bosing" -ForegroundColor Gray

try {
    # psql buyrug'ini bajarish
    $psqlPath = Join-Path $pgBinPath "psql.exe"
    
    # Agar parol talab qilinmasa, to'g'ridan-to'g'ri ishga tushirish
    $env:PGPASSWORD = ""
    
    # SQL faylni ishga tushirish
    & $psqlPath -U postgres -f $tempSqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Database va user muvaffaqiyatli yaratildi!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Database: soundzcalldb" -ForegroundColor Cyan
        Write-Host "User: soundzuz_user" -ForegroundColor Cyan
        Write-Host "Password: Soundz&2026" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Xatolik yuz berdi. Qo'lda bajarish mumkin:" -ForegroundColor Red
        Write-Host "psql -U postgres" -ForegroundColor Yellow
        Write-Host "CREATE DATABASE soundzcalldb;" -ForegroundColor Yellow
        Write-Host "CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';" -ForegroundColor Yellow
        Write-Host "GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "Xatolik: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Qo'lda bajarish:" -ForegroundColor Yellow
    Write-Host "1. psql -U postgres" -ForegroundColor Yellow
    Write-Host "2. CREATE DATABASE soundzcalldb;" -ForegroundColor Yellow
    Write-Host "3. CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';" -ForegroundColor Yellow
    Write-Host "4. GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;" -ForegroundColor Yellow
    Write-Host "5. \q" -ForegroundColor Yellow
}

# Temp faylni o'chirish
Remove-Item $tempSqlFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Keyingi qadam: npm run migrate" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
