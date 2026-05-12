# Setup Lengkap - Employee Management System

Panduan lengkap untuk setup dan menjalankan project Employee Management System berbasis Node.js dan MySQL.

## Daftar Isi

- [Persyaratan Sistem](#persyaratan-sistem)
- [Metode 1: Setup Manual](#metode-1-setup-manual)
- [Metode 2: Setup Otomatis dengan Script](#metode-2-setup-otomatis-dengan-script)
- [Metode 3: Setup dengan Docker](#metode-3-setup-dengan-docker)
- [Troubleshooting](#troubleshooting)
- [Konfigurasi Tambahan](#konfigurasi-tambahan)

---

## Persyaratan Sistem

### Minimum Requirements
- **Node.js**: v18.0.0 atau lebih tinggi
- **MySQL**: v8.0 atau lebih tinggi
- **RAM**: 4 GB (direkomendasikan 8 GB untuk Puppeteer)
- **Storage**: 500 MB (termasuk node_modules)

### Software yang Harus Diinstall
1. **Node.js** - [Download di sini](https://nodejs.org/)
2. **MySQL** - [Download di sini](https://dev.mysql.com/downloads/)
3. **Git** (opsional) - [Download di sini](https://git-scm.com/)
4. **Docker & Docker Compose** (opsional, untuk metode Docker) - [Download di sini](https://www.docker.com/)

### Verifikasi Instalasi

```bash
# Cek Node.js
node --version
# Output: v18.x.x atau lebih tinggi

# Cek npm
npm --version
# Output: 9.x.x atau lebih tinggi

# Cek MySQL
mysql --version
# Output: mysql  Ver 8.0.x

# Cek Docker (opsional)
docker --version
docker-compose --version
```

---

## Metode 1: Setup Manual

### Langkah 1: Clone atau Extract Project

```bash
# Jika menggunakan git
git clone https://github.com/adiityaastr/uts-fullstack.git
cd uts-fullstack

# Jika menggunakan zip, extract dan masuk ke folder
# cd path/to/uts-fullstack
```

### Langkah 2: Install Dependencies

```bash
npm install
```

Ini akan menginstall semua package yang tercantum di `package.json`:
- express, ejs, mysql2 (core)
- bcrypt, jsonwebtoken, express-session (auth)
- exceljs, puppeteer, xlsx (export)
- multer (upload)
- dotenv (environment)

### Langkah 3: Setup Database MySQL

#### 3.1 Login ke MySQL

```bash
# Windows
mysql -u root -p

# Atau jika menggunakan XAMPP/WAMP, buka phpMyAdmin di browser
# http://localhost/phpmyadmin
```

#### 3.2 Buat Database

```sql
CREATE DATABASE IF NOT EXISTS uts_employee_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

SHOW DATABASES;
EXIT;
```

#### 3.3 Import Schema Database

```bash
# Pastikan sudah di folder project
mysql -u root -p uts_employee_db < 411231139_muhamad_aditya_saputra.sql
```

Jika berhasil, tidak akan ada output error.

### Langkah 4: Konfigurasi Environment Variables

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit file `.env` dengan text editor:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_anda
DB_NAME=uts_employee_db
JWT_SECRET=rahasia_jwt_yang_sangat_panjang_dan_acak_12345
SESSION_SECRET=rahasia_session_yang_sangat_panjang_dan_acak_67890
PORT=3000
```

⚠️ **PENTING**: Ganti password dan secret keys dengan nilai yang unik dan aman!

### Langkah 5: Buat Folder Uploads (Jika Belum Ada)

```bash
# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path uploads\photos
New-Item -ItemType Directory -Force -Path uploads\excels

# Linux/Mac
mkdir -p uploads/photos uploads/excels
```

### Langkah 6: Jalankan Aplikasi

```bash
npm start
```

Server akan berjalan di: `http://localhost:3000`

---

## Metode 2: Setup Otomatis dengan Script

### Windows (setup.bat)

1. Buka Command Prompt atau PowerShell sebagai Administrator
2. Navigasi ke folder project:
```bash
cd C:\path\to\uts-fullstack
```

3. Jalankan script:
```bash
setup.bat
```

Script akan otomatis:
- ✅ Mengecek instalasi Node.js dan MySQL
- ✅ Menginstall dependencies
- ✅ Membuat database (jika MySQL root tanpa password)
- ✅ Menyalin dan mengkonfigurasi .env
- ✅ Membuat folder uploads
- ✅ Memberikan instruksi selanjutnya

### Linux/Mac (setup.sh)

1. Buka Terminal
2. Navigasi ke folder project:
```bash
cd /path/to/uts-fullstack
```

3. Berikan permission execute:
```bash
chmod +x setup.sh
```

4. Jalankan script:
```bash
./setup.sh
```

---

## Metode 3: Setup dengan Docker

Metode ini paling mudah karena tidak perlu install MySQL atau Node.js secara terpisah.

### Prasyarat
- Docker Desktop (Windows/Mac) atau Docker Engine (Linux)
- Docker Compose

### Langkah Setup

1. **Pastikan Docker berjalan**
```bash
docker --version
docker-compose --version
```

2. **Jalankan Docker Compose**
```bash
docker-compose up -d
```

Ini akan:
- Membuat container MySQL dengan database `uts_employee_db`
- Import schema database secara otomatis
- Build dan jalankan aplikasi Node.js
- Aplikasi tersedia di: `http://localhost:3000`

3. **Cek Status Container**
```bash
docker-compose ps
```

4. **Lihat Logs**
```bash
docker-compose logs -f app
docker-compose logs -f mysql
```

5. **Stop Aplikasi**
```bash
docker-compose down
```

6. **Stop dan Hapus Data (HATI-HATI!)**
```bash
docker-compose down -v
```

### Default Credentials (Docker)

| Service | Username | Password | Database |
|---------|----------|----------|----------|
| MySQL   | root     | rootpassword | uts_employee_db |
| App     | -        | -        | -        |

---

## Troubleshooting

### 1. Error: Cannot find module 'xxx'

**Penyebab**: Dependencies belum terinstall

**Solusi**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Error: Access denied for user 'root'@'localhost'

**Penyebab**: Password MySQL salah

**Solusi**:
1. Edit file `.env`
2. Pastikan `DB_PASSWORD` sesuai dengan password MySQL Anda
3. Jika lupa password, reset password MySQL terlebih dahulu

### 3. Error: connect ECONNREFUSED 127.0.0.1:3306

**Penyebab**: MySQL tidak berjalan

**Solusi**:
- Windows: Buka Services → Cari MySQL → Start
- XAMPP: Buka XAMPP Control Panel → Start MySQL
- Linux: `sudo systemctl start mysql`
- Mac: `brew services start mysql`

### 4. Error: Cannot find module '../utils/captcha'

**Penyebab**: File utils tidak ada

**Solusi**: Pastikan folder `utils/` ada dengan file:
- `captcha.js`
- `excelGenerator.js`
- `pdfGenerator.js`

### 5. Error: Puppeteer tidak bisa generate PDF

**Penyebab**: Dependencies Chrome tidak lengkap (biasa di Linux)

**Solusi**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y libgbm-dev libxkbcommon-x11-0 libgtk-3-0

# Docker (sudah dihandle di Dockerfile)
```

### 6. Error: EACCES: permission denied, mkdir 'uploads'

**Penyebab**: Folder uploads tidak ada atau permission denied

**Solusi**:
```bash
# Windows - Jalankan CMD/PowerShell sebagai Administrator

# Linux/Mac
mkdir -p uploads/photos uploads/excels
chmod 755 uploads uploads/photos uploads/excels
```

### 7. Database Schema Import Gagal

**Solusi Manual**:
1. Buka file `411231139_muhamad_aditya_saputra.sql`
2. Copy seluruh isi file
3. Buka phpMyAdmin atau MySQL client
4. Paste dan execute

### 8. Port 3000 sudah digunakan

**Solusi**:
1. Edit `.env`, ganti `PORT` ke nilai lain (misal: 3001, 8080)
2. Atau kill proses yang menggunakan port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## Konfigurasi Tambahan

### 1. SSL/HTTPS (Production)

Jika deploy ke production dengan HTTPS, update file `config/database.js`:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
    // atau ca: fs.readFileSync('path/to/ca.pem')
  }
});
```

### 2. Environment Variables Lanjutan

Tambahkan di `.env` jika diperlukan:

```env
# Node Environment
NODE_ENV=development

# Session Configuration
SESSION_MAX_AGE=3600000  # 1 jam dalam milliseconds

# Upload Limits
MAX_FILE_SIZE=5242880    # 5 MB

# Puppeteer Config (untuk PDF export)
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox
```

### 3. Backup Database

```bash
# Backup
mysqldump -u root -p uts_employee_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
mysql -u root -p uts_employee_db < backup_file.sql
```

### 4. Update Dependencies

```bash
# Cek update yang tersedia
npm outdated

# Update semua
npm update

# Update package tertentu
npm install express@latest
```

### 5. Production Deployment

Untuk production, gunakan process manager seperti PM2:

```bash
# Install PM2
npm install -g pm2

# Jalankan dengan PM2
pm2 start server.js --name employee-app

# Setup auto-start
pm2 startup
pm2 save
```

---

## Struktur Folder Setelah Setup

```
uts-fullstack/
├── node_modules/          # Dependencies (auto-generated)
├── uploads/               # Folder uploads
│   ├── photos/           # Foto karyawan
│   └── excels/           # File Excel upload
├── .env                   # Environment variables (jangan di-commit!)
├── .env.example          # Template environment
├── server.js             # Entry point
├── app.js                # Express app
├── package.json          # Project config
├── package-lock.json     # Locked dependencies
├── docker-compose.yml    # Docker config
├── Dockerfile            # Docker image
├── setup.bat             # Windows setup script
├── setup.sh              # Linux/Mac setup script
├── SETUP.md              # File ini
├── README.md             # Dokumentasi umum
└── 411231139_muhamad_aditya_saputra.sql  # Database schema
```

---

## Support

Jika mengalami masalah saat setup:

1. Cek bagian **Troubleshooting** di atas
2. Periksa logs error dengan detail
3. Pastikan semua persyaratan sistem terpenuhi
4. Coba metode setup lain (Manual → Script → Docker)

---

## Catatan Penting

⚠️ **Keamanan**:
- Jangan commit file `.env` ke repository publik
- Ganti default password dan secret keys
- Gunakan HTTPS untuk production
- Update dependencies secara berkala

⚠️ **Data**:
- Backup database secara berkala
- Folder `uploads/` perlu di-backup juga

---

**Selamat menggunakan Employee Management System!**
