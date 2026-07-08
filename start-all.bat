@echo off
echo ========================================
echo  Retail POS - Start All Services
echo ========================================
echo.

echo [1] Cek MySQL XAMPP (port 8111)...
"C:\xampp\mysql\bin\mysql.exe" -u root -P 8111 -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] MySQL tidak berjalan!
    echo Buka XAMPP Control Panel -^> Start MySQL
    pause
    exit /b 1
)
echo       MySQL OK.

echo [2] Starting Backend (port 3000)...
start "Retail POS Backend" cmd /k "cd /d E:\Kasir\backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3] Starting Frontend (port 5173)...
start "Retail POS Frontend" cmd /k "cd /d E:\Kasir\frontend && npm run dev"

echo.
echo ========================================
echo  Aplikasi sedang berjalan!
echo  Buka: http://localhost:5173
echo.
echo  Login Admin: adminidrus / idrus123
echo  Login Kasir: kasir1 / kasir123
echo ========================================
pause