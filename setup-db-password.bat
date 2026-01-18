@echo off
REM PostgreSQL Database Setup Script
REM Bu skript database va user ni yaratadi

echo ==========================================
echo PostgreSQL Database Setup
echo ==========================================
echo.

cd /d "%~dp0"

echo PostgreSQL postgres user parolini kiriting:
echo (Agar bo'sh bo'lsa, Enter bosing va "postgres" ishlatiladi)
set /p POSTGRES_PASS="Parol: "

if "%POSTGRES_PASS%"=="" set POSTGRES_PASS=postgres

echo.
echo Database yaratilmoqda...
set POSTGRES_PASSWORD=%POSTGRES_PASS%
node setup-database.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo Database migrationlar ishga tushirilmoqda...
    echo ==========================================
    echo.
    npm run migrate
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ==========================================
        echo Admin user yaratilmoqda...
        echo ==========================================
        echo.
        npm run create-admin
        echo.
        echo ==========================================
        echo ✓ O'rnatish yakunlandi!
        echo ==========================================
        echo.
        echo Server ni ishga tushirish:
        echo   npm start
        echo   Yoki: npm run dev
        echo.
    )
)

pause
