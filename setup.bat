@echo off
chcp 65001 >nul
echo ==========================================
echo Employee Management System - Setup Wizard
echo ==========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Script tidak berjalan sebagai Administrator.
    echo Beberapa fitur mungkin memerlukan elevated privileges.
    echo.
)

echo [1/6] Mengecek prerequisites...
echo ------------------------------------------

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Silakan install Node.js v18+ dari https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo [OK] Node.js terinstall: %NODE_VERSION%

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm tidak ditemukan!
    echo Node.js seharusnya sudah include npm.
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
echo [OK] npm terinstall: %NPM_VERSION%

REM Check MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MySQL command line client tidak ditemukan!
    echo Pastikan MySQL terinstall dan PATH sudah dikonfigurasi.
    echo Atau gunakan phpMyAdmin untuk import database secara manual.
    set MYSQL_FOUND=0
) else (
    for /f "tokens=*" %%a in ('mysql --version') do set MYSQL_VERSION=%%a
    echo [OK] MySQL terinstall: %MYSQL_VERSION%
    set MYSQL_FOUND=1
)

echo.
echo [2/6] Menginstall dependencies...
echo ------------------------------------------
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Gagal menginstall dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies berhasil diinstall

echo.
echo [3/6] Setup environment variables...
echo ------------------------------------------

if exist .env (
    echo File .env sudah ada.
    choice /C YN /M "Apakah Anda ingin menggantinya"
    if errorlevel 2 goto :SkipEnv
)

echo Membuat file .env dari template...
copy /Y .env.example .env >nul

echo.
echo Konfigurasi Database MySQL:
echo (Tekan Enter untuk menggunakan default)
echo.

set /p DB_HOST="Host [localhost]: "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_USER="Username [root]: "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="Password [kosong]: "
if "%DB_PASS%"=="" set DB_PASS=

set /p DB_NAME="Database Name [uts_employee_db]: "
if "%DB_NAME%"=="" set DB_NAME=uts_employee_db

REM Generate random secrets
for /f "tokens=*" %%a in ('powershell -Command "[Convert]::ToBase64String([byte[]]::new(32))"') do set JWT_SECRET=%%a
for /f "tokens=*" %%a in ('powershell -Command "[Convert]::ToBase64String([byte[]]::new(32))"') do set SESSION_SECRET=%%a

echo.
echo Menyimpan konfigurasi ke .env...
(
echo DB_HOST=%DB_HOST%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASS%
echo DB_NAME=%DB_NAME%
echo JWT_SECRET=%JWT_SECRET%
echo SESSION_SECRET=%SESSION_SECRET%
echo PORT=3000
) > .env

echo [OK] File .env berhasil dibuat dan dikonfigurasi

:SkipEnv

echo.
echo [4/6] Setup database...
echo ------------------------------------------

if %MYSQL_FOUND%==0 (
    echo [WARNING] MySQL client tidak tersedia.
    echo Anda perlu mengimport database secara manual:
    echo 1. Buka phpMyAdmin atau MySQL client
    echo 2. Buat database: CREATE DATABASE %DB_NAME%;
    echo 3. Import file: 411231139_muhamad_aditya_saputra.sql
    goto :SkipDB
)

echo Mencoba membuat database...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Tidak dapat membuat database otomatis.
    echo Kemungkinan penyebab:
    echo - Password MySQL salah
    echo - MySQL service tidak berjalan
    echo.
    echo Silakan buat database secara manual:
    echo 1. Buka phpMyAdmin: http://localhost/phpmyadmin
    echo 2. Buat database: %DB_NAME%
    echo 3. Import file: 411231139_muhamad_aditya_saputra.sql
    goto :SkipDB
)
echo [OK] Database berhasil dibuat

echo Importing database schema...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% < 411231139_muhamad_aditya_saputra.sql 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Gagal mengimport schema database!
    echo Silakan import secara manual menggunakan phpMyAdmin.
    goto :SkipDB
)
echo [OK] Database schema berhasil diimport

:SkipDB

echo.
echo [5/6] Membuat folder uploads...
echo ------------------------------------------

if not exist uploads (
    mkdir uploads
    echo [OK] Folder uploads dibuat
)

if not exist uploads\photos (
    mkdir uploads\photos
    echo [OK] Folder uploads/photos dibuat
)

if not exist uploads\excels (
    mkdir uploads\excels
    echo [OK] Folder uploads/excels dibuat
)

echo.
echo [6/6] Verifikasi setup...
echo ------------------------------------------

echo Mengecek struktur folder...
if exist node_modules (echo [OK] node_modules/) else (echo [ERR] node_modules/ tidak ditemukan)
if exist .env (echo [OK] .env) else (echo [ERR] .env tidak ditemukan)
if exist uploads (echo [OK] uploads/) else (echo [ERR] uploads/ tidak ditemukan)

echo.
echo ==========================================
echo Setup Selesai!
echo ==========================================
echo.
echo Untuk menjalankan aplikasi:
echo   npm start
echo.
echo Aplikasi akan berjalan di:
echo   http://localhost:3000
echo.
echo Catatan penting:
echo - Pastikan MySQL service berjalan sebelum start aplikasi
echo - Edit .env jika konfigurasi database berubah
echo - Jangan commit file .env ke repository!
echo.
echo Untuk dokumentasi lengkap, baca SETUP.md
echo.

choice /C YN /M "Apakah Anda ingin menjalankan aplikasi sekarang"
if errorlevel 2 goto :End
if errorlevel 1 goto :RunApp

:RunApp
echo.
echo Menjalankan aplikasi...
npm start
goto :End

:End
pause
