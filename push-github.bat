@echo off
echo ========================================
echo  Push Retail POS ke GitHub
echo ========================================
echo.

cd /d E:\Kasir

echo [1] Cek login GitHub CLI...
gh auth status >nul 2>&1
if errorlevel 1 (
    echo.
    echo Belum login GitHub. Jalankan perintah ini dulu:
    echo   gh auth login
    echo.
    echo Pilih:
    echo   - GitHub.com
    echo   - HTTPS
    echo   - Login via browser
    echo.
    pause
    gh auth login
)

echo.
echo [2] Buat repo dan push ke GitHub...
gh repo create retail-pos --public --source=. --remote=origin --push --description "Retail POS - Web Point of Sale"

if errorlevel 1 (
    echo.
    echo Jika repo sudah ada, coba push manual:
    echo   git remote add origin https://github.com/IdrusShahab/retail-pos.git
    echo   git branch -M main
    echo   git push -u origin main
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Berhasil! Cek: https://github.com/IdrusShahab/retail-pos
echo ========================================
pause