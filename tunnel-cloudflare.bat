@echo off
echo ========================================
echo  Retail POS - Cloudflare Tunnel
echo ========================================
echo.

echo [1] Cek MySQL XAMPP...
"C:\xampp\mysql\bin\mysql.exe" -u root -P 8111 -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] MySQL tidak berjalan! Start MySQL di XAMPP dulu.
    pause
    exit /b 1
)
echo       MySQL OK.

echo [2] Cek Backend (port 3000)...
powershell -Command "(Test-NetConnection -ComputerName 127.0.0.1 -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded" | findstr "True" >nul
if errorlevel 1 (
    echo       Backend belum jalan, starting...
    start "Retail POS Backend" cmd /k "cd /d E:\Kasir\backend && npm run dev"
    timeout /t 4 /nobreak >nul
)

echo [3] Cek Frontend (port 5173)...
powershell -Command "(Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -WarningAction SilentlyContinue).TcpTestSucceeded" | findstr "True" >nul
if errorlevel 1 (
    echo       Frontend belum jalan, starting...
    start "Retail POS Frontend" cmd /k "cd /d E:\Kasir\frontend && npm run dev"
    timeout /t 5 /nobreak >nul
)

echo.
echo [4] Membuka Cloudflare Tunnel...
echo.
echo  URL akan muncul di bawah (contoh: https://xxx.trycloudflare.com)
echo  Bagikan URL itu ke orang lain untuk akses aplikasi.
echo.
echo  PENTING:
echo  - URL berubah setiap kali tunnel di-restart (mode gratis)
echo  - Hanya untuk demo/testing, JANGAN untuk data produksi
echo  - Tekan Ctrl+C untuk stop tunnel
echo.
echo ========================================

"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5173

pause