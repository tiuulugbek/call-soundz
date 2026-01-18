@echo off
REM Windows Start Script for Call Soundz PBX
REM Bu skript server ni ishga tushiradi

echo ==========================================
echo Call Soundz PBX - Server Start
echo ==========================================
echo.

cd /d "%~dp0"

REM Environment variables ni tekshirish
if not exist ".env" (
    echo Xatolik: .env fayli topilmadi!
    echo .env.example dan .env yarating va sozlang.
    pause
    exit /b 1
)

REM Database ulanishini tekshirish
echo Database ulanishini tekshiryapman...
node test-db-connection.js >nul 2>&1
if errorlevel 1 (
    echo Xatolik: Database ga ulanib bo'lmadi!
    echo PostgreSQL servisini tekshiring va migrationlarni ishga tushiring:
    echo   npm run migrate
    pause
    exit /b 1
)

echo Database ulanishi OK!
echo.

REM Server ni ishga tushirish
echo Server ishga tushirilmoqda...
echo.
echo API Endpoints:
echo   Web Dashboard: http://localhost:3005
echo   API Base: http://localhost:3005/api/v1
echo.
echo Server ni to'xtatish uchun Ctrl+C bosing
echo.

npm start
