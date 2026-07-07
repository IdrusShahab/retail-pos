@echo off
echo ========================================
echo  Cek Koneksi MySQL
echo ========================================
echo.

if exist "C:\xampp\mysql\bin\mysql.exe" (
    set "MYSQL_BIN=C:\xampp\mysql\bin\mysql.exe"
    set "MYSQL_PORT=8111"
    set "MYSQL_NAME=XAMPP MySQL"
) else if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    set "MYSQL_PORT=3306"
    set "MYSQL_NAME=MySQL Server 8.0"
) else (
    echo [ERROR] MySQL client tidak ditemukan.
    echo Install MySQL Server atau XAMPP terlebih dahulu.
    pause
    exit /b 1
)

echo Mengecek %MYSQL_NAME% di port %MYSQL_PORT%...
"%MYSQL_BIN%" -u root -P %MYSQL_PORT% -e "SELECT 'MySQL OK' AS status;" 2>nul
if %errorlevel%==0 (
    echo.
    echo [OK] MySQL berjalan di localhost:%MYSQL_PORT%
    echo.
    echo Pastikan .env di backend menggunakan port yang sama:
    echo DATABASE_URL="mysql://root:@localhost:%MYSQL_PORT%/retail_pos"
    goto :end
)

echo.
echo [ERROR] MySQL TIDAK berjalan!
echo.
if "%MYSQL_PORT%"=="8111" (
    echo Cara menyalakan:
    echo   1. Buka XAMPP Control Panel
    echo   2. Klik "Start" pada baris MySQL
    echo   3. Pastikan port MySQL = 8111 ^(bukan 3306^)
) else (
    echo Cara menyalakan:
    echo   1. Win+R -^> services.msc -^> Start "MySQL80"
    echo   ATAU CMD sebagai Admin: net start MySQL80
)

:end
pause