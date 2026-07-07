@echo off
echo ========================================
echo  Retail POS - Database Setup
echo ========================================
echo.

cd /d E:\Kasir\backend

if exist "C:\xampp\mysql\bin\mysql.exe" (
    set "MYSQL_BIN=C:\xampp\mysql\bin\mysql.exe"
    set "MYSQL_PORT=8111"
    echo Terdeteksi: XAMPP MySQL ^(port 8111^)
) else if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    set "MYSQL_PORT=3306"
    echo Terdeteksi: MySQL Server 8.0 ^(port 3306^)
) else (
    echo [ERROR] MySQL client tidak ditemukan.
    pause
    exit /b 1
)

echo.
echo [1/5] Update .env ke port %MYSQL_PORT%...
(
echo DATABASE_URL="mysql://root:@localhost:%MYSQL_PORT%/retail_pos"
echo JWT_SECRET="retail-pos-jwt-secret-key-change-in-production"
echo JWT_EXPIRES_IN="24h"
echo PORT=3000
) > .env

echo [2/5] Mengecek koneksi MySQL...
"%MYSQL_BIN%" -u root -P %MYSQL_PORT% -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] MySQL tidak berjalan di port %MYSQL_PORT%!
    echo Jalankan: E:\Kasir\check-mysql.bat
    pause
    exit /b 1
)
echo       MySQL OK.

echo [3/5] Membuat database retail_pos...
"%MYSQL_BIN%" -u root -P %MYSQL_PORT% -e "CREATE DATABASE IF NOT EXISTS retail_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo [4/5] Menjalankan Prisma migration...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo [ERROR] Migration gagal.
    pause
    exit /b 1
)

echo [5/5] Menjalankan seed data...
call npm run prisma:seed
if errorlevel 1 (
    echo [ERROR] Seed gagal.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Setup SELESAI!
echo.
echo  Login Admin: admin / admin123
echo  Login Kasir: kasir1 / kasir123
echo ========================================
pause