# Setup Lengkap - Employee Management System

> Panduan lengkap untuk setup dan menjalankan PT Digital Nusantara Employee Management System.

## Daftar Isi

- [Persyaratan Sistem](#persyaratan-sistem)
- [Metode 1: Setup Manual](#metode-1-setup-manual)
- [Metode 2: Setup Otomatis dengan Script](#metode-2-setup-otomatis-dengan-script)
- [Metode 3: Setup dengan Docker](#metode-3-setup-dengan-docker)
- [Metode 4: Setup dengan XAMPP](#metode-4-setup-dengan-xampp)
- [Setup Static Assets (Dasher Template)](#setup-static-assets-dasher-template)
- [Akun Default & Login Pertama](#akun-default--login-pertama)
- [Menambahkan Data Dummy](#menambahkan-data-dummy)
- [Menjalankan di Background](#menjalankan-di-background)
- [Konfigurasi phpMyAdmin](#konfigurasi-phpmyadmin)
- [Environment Variables Lengkap](#environment-variables-lengkap)
- [Troubleshooting](#troubleshooting)
- [Checklist Verifikasi Setup](#checklist-verifikasi-setup)
- [Konfigurasi Tambahan](#konfigurasi-tambahan)
- [Catatan Penting](#catatan-penting)

---

## Persyaratan Sistem

### Minimum Requirements
- **Node.js**: v18.0.0 atau lebih tinggi
- **MySQL / MariaDB**: v8.0 atau lebih tinggi
- **RAM**: 4 GB (direkomendasikan 8 GB untuk Puppeteer PDF export)
- **Storage**: 500 MB bebas (termasuk node_modules)

### Software yang Harus Diinstall

| Software        | Download Link                        | Wajib |
|-----------------|--------------------------------------|-------|
| Node.js & npm   | https://nodejs.org/                  | Yes   |
| MySQL / MariaDB | https://dev.mysql.com/downloads/     | Yes   |
| XAMPP           | https://www.apachefriends.org/       | No*   |
| Git             | https://git-scm.com/                 | No    |
| Docker Desktop  | https://www.docker.com/              | No    |

*\* XAMPP sudah include MariaDB + phpMyAdmin, cocok untuk pemula.*

### Verifikasi Instalasi

```bash
# Cek Node.js
node --version
# Harus: v18.x.x atau lebih tinggi

# Cek npm
npm --version
# Harus: 9.x.x atau lebih tinggi

# Cek MySQL
mysql --version
# Harus: mysql Ver 8.0.x / mariadb Ver 10.x.x

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

Package yang akan diinstall:
- `express`, `ejs`, `mysql2` — core framework
- `bcrypt`, `jsonwebtoken`, `express-session`, `express-mysql-session`, `cookie-parser` — authentication
- `exceljs`, `puppeteer`, `xlsx` — export/report
- `multer` — file upload
- `dotenv` — environment variables

### Langkah 3: Setup Database MySQL

#### 3.1 Login ke MySQL

```bash
# Via terminal
mysql -u root -p

# Untuk XAMPP, password root default adalah kosong (tekan Enter saja)
mysql -u root
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
# Windows (PowerShell)
Get-Content 411231139_muhamad_aditya_saputra.sql | mysql -u root -p uts_employee_db

# Windows (Command Prompt)
# mysql -u root -p uts_employee_db < 411231139_muhamad_aditya_saputra.sql

# Linux/Mac
mysql -u root -p uts_employee_db < 411231139_muhamad_aditya_saputra.sql
```

Jika berhasil, tidak ada output error. Tabel yang terbentuk: `employees`, `users`, `sessions`.

#### 3.4 Verifikasi Database

```bash
mysql -u root -p -e "USE uts_employee_db; SHOW TABLES; SELECT COUNT(*) AS total_employees FROM employees; SELECT COUNT(*) AS total_users FROM users;"
```

Output yang diharapkan:
```
Tables_in_uts_employee_db
employees
sessions
users
total_employees: 0
total_users: 1 (admin default)
```

### Langkah 4: Konfigurasi Environment Variables

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit file `.env` dengan text editor (Notepad, VS Code, nano, vim):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_anda
DB_NAME=uts_employee_db
JWT_SECRET=rahasia_jwt_yang_sangat_panjang_dan_acak_12345
SESSION_SECRET=rahasia_session_yang_sangat_panjang_dan_acak_67890
PORT=3000
```

> ⚠️ **PENTING**: Ganti `DB_PASSWORD`, `JWT_SECRET`, dan `SESSION_SECRET` dengan nilai unik Anda!
>
> Generate secret key yang aman:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Langkah 5: Setup Static Assets (PENTING!)

Project ini menggunakan template Bootstrap 5 Dasher Admin. Static assets (CSS, JS, fonts) harus di-copy dari folder `dasher-1.0.0/` ke `public/`.

**Lihat bagian [Setup Static Assets](#setup-static-assets-dasher-template) di bawah untuk instruksi lengkap.**

Singkatnya:
```bash
# Copy assets dari dasher-1.0.0/dist/ ke public/
xcopy /E /Y dasher-1.0.0\dist\* public\      # Windows
# cp -r dasher-1.0.0/dist/* public/            # Linux/Mac
```

> ⚠️ Tanpa langkah ini, halaman web akan tampil tanpa CSS/JS (404 pada semua asset).

### Langkah 6: Buat Folder Uploads

```bash
# Windows
New-Item -ItemType Directory -Force -Path uploads\photos
New-Item -ItemType Directory -Force -Path uploads\excels

# Linux/Mac
mkdir -p uploads/photos uploads/excels
```

### Langkah 7: Jalankan Aplikasi

```bash
# Development
npm start          # atau: npm run dev, node server.js

# Server akan berjalan di: http://localhost:3000
```

Output yang diharapkan:
```
Server running on http://localhost:3000
```

---

## Metode 2: Setup Otomatis dengan Script

### Windows (setup.bat)

1. Buka Command Prompt atau PowerShell
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
- ✅ Menginstall dependencies (`npm install`)
- ✅ Membuat database (jika MySQL root tanpa password)
- ✅ Menyalin dan mengkonfigurasi `.env` (interaktif)
- ✅ Membuat folder `uploads/`
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

Metode paling mudah — tidak perlu install MySQL atau Node.js secara terpisah.

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
- ⏳ Download image MySQL 8.0 (sekali saja)
- 🗄️ Membuat container MySQL dengan database `uts_employee_db`
- 📥 Import schema database otomatis (`411231139_muhamad_aditya_saputra.sql`)
- 🏗️ Build image aplikasi Node.js
- 🚀 Jalankan container aplikasi di port 3000

3. **Cek Status Container**
```bash
docker-compose ps
```

Output yang diharapkan:
```
NAME              STATUS
employee_mysql    Up (healthy)
employee_app      Up
```

4. **Lihat Logs (jika ada masalah)**
```bash
docker-compose logs -f app     # Log aplikasi
docker-compose logs -f mysql   # Log database
```

5. **Akses Aplikasi**
Buka browser ke: **http://localhost:3000**

6. **Stop Aplikasi**
```bash
docker-compose down
```

7. **Stop dan Hapus Semua Data (HATI-HATI!)**
```bash
docker-compose down -v
```
⚠️ Ini akan menghapus semua data di database!

### Default Credentials (Docker)

| Service | Host     | Username      | Password       | Database         |
|---------|----------|---------------|----------------|------------------|
| MySQL   | mysql    | root          | rootpassword   | uts_employee_db  |
| MySQL   | mysql    | employee_user | employee_pass  | uts_employee_db  |
| App     | localhost:3000 | -        | -              | -                |

### Port Mapping

| Service | Container Port | Host Port |
|---------|---------------|-----------|
| MySQL   | 3306          | 3306      |
| App     | 3000          | 3000      |

---

## Metode 4: Setup dengan XAMPP

Metode ini cocok untuk mahasiswa yang sudah familiar dengan XAMPP.

### Prasyarat
- XAMPP terinstall (https://www.apachefriends.org/)
- Node.js v18+ terinstall

### Langkah 1: Start MySQL di XAMPP

1. Buka **XAMPP Control Panel** (`C:\xampp\xampp-control.exe`)
2. Klik tombol **Start** pada baris MySQL
3. Pastikan status berubah menjadi hijau ("Running")
4. Port default: 3306

### Langkah 2: Buat Database via phpMyAdmin

1. Buka browser, akses: **http://localhost/phpmyadmin**
2. Klik **New** di sidebar kiri
3. Isi:
   - Database name: `uts_employee_db`
   - Collation: `utf8mb4_unicode_ci`
4. Klik **Create**

### Langkah 3: Import Database Schema

1. Di phpMyAdmin, klik database `uts_employee_db` di sidebar kiri
2. Klik tab **Import**
3. Klik **Choose File** → pilih `411231139_muhamad_aditya_saputra.sql`
4. Klik **Go** (biarkan opsi default)

### Langkah 4: Setup Project

```bash
cd C:\path\to\uts-fullstack
npm install
copy .env.example .env
```

Edit `.env`, pastikan:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=              # Kosongkan (XAMPP default tanpa password)
DB_NAME=uts_employee_db
JWT_SECRET=ganti_dengan_random_string_panjang
SESSION_SECRET=ganti_dengan_random_string_panjang
PORT=3000
```

### Langkah 5: Setup Static Assets & Jalankan

```bash
# Copy assets Dasher
xcopy /E /Y dasher-1.0.0\dist\* public\

# Buat folder uploads
mkdir uploads\photos uploads\excels

# Jalankan
npm start
```

> **Note**: Apache di XAMPP tidak perlu di-start. Aplikasi ini menggunakan Express.js sendiri, bukan Apache.

---

## Setup Static Assets (Dasher Template)

Project ini menggunakan **Dasher Bootstrap 5 Admin Template**. Static assets harus tersedia di folder `public/` agar CSS, JS, font, dan gambar termuat dengan benar.

### Metode A: Copy dari folder dasher-1.0.0/dist/

Jika folder `dasher-1.0.0/dist/` sudah ada:

```bash
# Windows (PowerShell / CMD)
xcopy /E /Y dasher-1.0.0\dist\* public\

# Linux / Mac
cp -r dasher-1.0.0/dist/* public/
```

### Metode B: Build dari source

Jika folder `dist/` belum ada, build dulu:

```bash
cd dasher-1.0.0
npm install
npm run build      # atau: gulp build
cd ..

# Copy hasil build ke public
xcopy /E /Y dasher-1.0.0\dist\* public\
```

### Metode C: Download dari ThemeWagon

```bash
# Download Dasher dari https://themewagon.com/themes/dasher/
# Extract dan copy folder assets/ dan libs/ ke public/
```

### Struktur public/ yang diharapkan

Setelah copy, folder `public/` harus berisi:
```
public/
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   ├── fonts/
│   └── images/
├── libs/
│   ├── bootstrap/
│   ├── apexcharts/
│   ├── simplebar/
│   └── ...
└── index.html (jika ada, bisa dihapus)
```

### Verifikasi Assets

Buka browser, akses salah satu file CSS:
```
http://localhost:3000/assets/css/style.css
```
Jika file CSS ter-load (bukan 404), assets sudah benar.

> ⚠️ **PENTING**: Tanpa static assets, semua halaman akan tampil tanpa CSS styling dan JavaScript. Toolbar, sidebar, chart, dan komponen interaktif tidak akan berfungsi.

---

## Akun Default & Login Pertama

Setelah database diimport, tersedia **1 akun admin default**:

| Field    | Value            |
|----------|------------------|
| Username | `admin`          |
| Email    | `admin@uts.com`  |
| Password | `password`       |
| Role     | Admin            |
| Status   | Active           |

### Cara Login Pertama Kali

1. Buka **http://localhost:3000**
2. Masukkan **Email**: `admin@uts.com`
3. Masukkan **Password**: `password`
4. Jawab CAPTCHA (soal matematika yang muncul)
5. Centang **Remember Me** (opsional, untuk auto-login nanti)
6. Klik **Login**

### Setelah Login — Yang Harus Dilakukan

1. **Ganti password admin** — Buka **Users** → klik edit pada admin → ganti password
2. **Tambah data karyawan** — Buka **Employees** → **Add Employee**
3. **Upload data dummy** — Buka **Upload** → pilih file Excel dummy (lihat [Menambahkan Data Dummy](#menambahkan-data-dummy))

### Membuat Akun Baru

1. Login sebagai Admin
2. Buka menu **Users** → **Add User**
3. Pilih employee dari dropdown (employee harus sudah ada di database)
4. Isi username, email, password
5. Pilih role: `Admin` atau `Employee`
6. Klik **Save**

---

## Menambahkan Data Dummy

Project ini sudah menyertakan file dummy di `uploads/excels/`:

| File | Format | Jumlah Data |
|------|--------|-------------|
| `data_dummy_karyawan.xlsx` | Excel | 10 karyawan |
| `data_dummy_karyawan.csv` | CSV | 10 karyawan |

### Cara Import Data Dummy

1. Login sebagai Admin
2. Buka menu **Upload** (sidebar)
3. Klik **Choose File** → pilih `data_dummy_karyawan.xlsx` dari `uploads/excels/`
4. Klik **Upload & Import**
5. Sistem akan menampilkan hasil: "Berhasil mengimport 10 dari 10 data"
6. Buka **Employees** untuk melihat data yang sudah diimport

### Field yang Diimport

Kolom mendukung **Bahasa Indonesia** dan **English**:

| Kolom (ID)       | Kolom (EN)          | Contoh                    |
|------------------|---------------------|---------------------------|
| Kode Karyawan    | employee_code       | EMP001                    |
| Nama Lengkap     | full_name           | Budi Santoso              |
| Jenis Kelamin    | gender              | Male / Female             |
| Tanggal Lahir    | birth_date          | 1990-05-15                |
| Email            | email               | budi@email.com            |
| No HP            | phone_number        | 081234567890              |
| Alamat           | address             | Jl. Merdeka No. 10        |
| Kota             | city                | Jakarta                   |
| Provinsi         | province            | DKI Jakarta               |
| Kode Pos         | postal_code         | 10110                     |
| Divisi           | division            | IT                        |
| Jabatan          | position            | Senior Developer          |
| Gaji             | salary              | 15000000                  |
| Tanggal Masuk    | join_date           | 2020-03-01                |
| Status           | employment_status   | Active                    |
| Pendidikan       | education           | S1 Teknik Informatika     |
| Status Pernikahan| marital_status      | Single / Married          |
| Kontak Darurat   | emergency_contact   | Siti Rahayu               |
| Telp Darurat     | emergency_phone     | 081298765432              |

---

## Menjalankan di Background

Agar server tetap berjalan setelah terminal ditutup:

### Metode A: PM2 (Direkomendasikan)

```bash
# Install PM2 global
npm install -g pm2

# Jalankan aplikasi
pm2 start server.js --name employee-app

# Lihat status
pm2 status
pm2 logs employee-app

# Auto-start saat boot
pm2 startup
pm2 save

# Stop / Restart
pm2 stop employee-app
pm2 restart employee-app
```

### Metode B: nohup (Linux/Mac)

```bash
nohup node server.js > server.log 2>&1 &
echo $! > app.pid   # Simpan PID

# Stop
kill $(cat app.pid)
```

### Metode C: forever

```bash
npm install -g forever
forever start server.js

# Stop
forever stop server.js
```

### Metode D: Windows Task Scheduler

1. Buat file `.bat`:
```batch
cd C:\path\to\uts-fullstack
node server.js
```
2. Buka **Task Scheduler** → Create Task
3. Trigger: **At startup**
4. Action: jalankan `.bat` file

---

## Konfigurasi phpMyAdmin

### Akses phpMyAdmin (XAMPP)

1. Start **Apache** dan **MySQL** di XAMPP Control Panel
2. Buka: **http://localhost/phpmyadmin**
3. Login: Username `root`, password kosong (default XAMPP)

### Operasi Penting via phpMyAdmin

| Operasi                    | Cara                                                       |
|----------------------------|------------------------------------------------------------|
| Lihat data tabel           | Klik tabel → tab **Browse**                                |
| Edit data                  | Klik tabel → Browse → klik **Edit** (ikon pensil)          |
| Import SQL                 | Tab **Import** → Choose File → Go                          |
| Export database            | Tab **Export** → pilih tabel → Go                          |
| Cek struktur tabel         | Klik tabel → tab **Structure**                             |
| Hapus tabel                | Klik tabel → tab **Operations** → Drop table               |
| Reset database (reset ulang)| Drop semua tabel → Import ulang file SQL                   |

### Reset Database (Mulai dari Awal)

```sql
-- Jalankan di SQL tab phpMyAdmin, atau via terminal:
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS employees;
```

Kemudian import ulang `411231139_muhamad_aditya_saputra.sql`.

---

## Environment Variables Lengkap

Semua environment variable yang digunakan aplikasi:

| Variable         | Deskripsi                             | Default              | Required | Contoh                       |
|------------------|---------------------------------------|----------------------|----------|------------------------------|
| `DB_HOST`        | Host database MySQL                   | `localhost`          | **Yes**  | `localhost` / `mysql` (Docker) |
| `DB_USER`        | Username MySQL                        | `root`               | **Yes**  | `root`                       |
| `DB_PASSWORD`    | Password MySQL                        | *(kosong)*           | **Yes**  | `password123`                |
| `DB_NAME`        | Nama database                         | `uts_employee_db`    | **Yes**  | `uts_employee_db`            |
| `JWT_SECRET`     | Secret key JWT (tokens signing)       | *(wajib ganti)*      | **Yes**  | Random 64-char hex string    |
| `SESSION_SECRET` | Secret key session encryption         | *(wajib ganti)*      | **Yes**  | Random 64-char hex string    |
| `PORT`           | Port HTTP server                      | `3000`               | No       | `3000` / `8080`              |
| `NODE_ENV`       | Environment mode                      | `development`        | No       | `production` / `development` |

### Konfigurasi per Metode Setup

**Setup Manual (localhost MySQL):**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=            # Isi password MySQL Anda
DB_NAME=uts_employee_db
JWT_SECRET=<random_64_char>
SESSION_SECRET=<random_64_char>
PORT=3000
```

**Setup XAMPP:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=            # Kosongkan (default XAMPP)
DB_NAME=uts_employee_db
JWT_SECRET=<random_64_char>
SESSION_SECRET=<random_64_char>
PORT=3000
```

**Setup Docker:**
```env
# Sudah di-set otomatis di docker-compose.yml
DB_HOST=mysql
DB_USER=employee_user
DB_PASSWORD=employee_pass
DB_NAME=uts_employee_db
```

---

## Troubleshooting

### 1. Error: Cannot find module 'xxx'

**Penyebab**: Dependencies belum terinstall atau corrupt.

**Solusi**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Error: Access denied for user 'root'@'localhost'

**Penyebab**: Password MySQL di `.env` tidak sesuai.

**Solusi**:
1. Edit `.env`, pastikan `DB_PASSWORD` sesuai
2. Untuk XAMPP default: biarkan `DB_PASSWORD=` kosong
3. Coba login manual: `mysql -u root -p`

### 3. Error: connect ECONNREFUSED 127.0.0.1:3306

**Penyebab**: MySQL service tidak berjalan.

**Solusi**:
- **XAMPP**: Buka Control Panel → klik Start di MySQL
- **Windows Services**: `services.msc` → cari MySQL → Start
- **Linux**: `sudo systemctl start mysql`
- **Mac (Homebrew)**: `brew services start mysql`

### 4. Error: Unknown database 'uts_employee_db'

**Penyebab**: Database belum dibuat atau nama database salah.

**Solusi**:
```sql
CREATE DATABASE IF NOT EXISTS uts_employee_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Lalu import ulang file SQL.

### 5. Halaman tampil tanpa CSS/Styling (404 pada /assets/...)

**Penyebab**: Static assets Dasher belum di-copy ke `public/`.

**Solusi**: Ikuti instruksi [Setup Static Assets](#setup-static-assets-dasher-template).
```bash
xcopy /E /Y dasher-1.0.0\dist\* public\
```

### 6. Error: EACCES: permission denied, mkdir 'uploads'

**Penyebab**: Folder uploads tidak ada atau permission denied.

**Solusi**:
```bash
# Windows (jalankan terminal sebagai Administrator)
New-Item -ItemType Directory -Force -Path uploads\photos
New-Item -ItemType Directory -Force -Path uploads\excels

# Linux/Mac
mkdir -p uploads/photos uploads/excels
chmod 755 uploads uploads/photos uploads/excels
```

### 7. Error: Table 'uts_employee_db.sessions' doesn't exist

**Penyebab**: Session table belum dibuat oleh express-mysql-session.

**Solusi**: File SQL `411231139_muhamad_aditya_saputra.sql` sudah include tabel sessions di bagian akhir. Import ulang file SQL.

### 8. Port 3000 already in use

**Penyebab**: Port 3000 sudah digunakan aplikasi lain.

**Solusi**:
```bash
# Cari proses yang pakai port 3000
netstat -ano | findstr :3000          # Windows
lsof -ti:3000                         # Linux/Mac

# Kill proses (ganti <PID> dengan hasil di atas)
taskkill /PID <PID> /F                # Windows
kill -9 <PID>                         # Linux/Mac

# Atau: ganti port di .env
PORT=8080
```

### 9. Puppeteer gagal generate PDF

**Penyebab**: Dependencies Chrome headless tidak lengkap (umum di Linux server).

**Solusi Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y \
  libgbm-dev \
  libxkbcommon-x11-0 \
  libgtk-3-0 \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxdamage1 \
  libxcomposite1 \
  libxrandr2
```

**Solusi Docker**: Sudah dihandle di Dockerfile (install chromium via apk).

### 10. Error: Table 'uts_employee_db.sessions' is full / MySQL gone away

**Penyebab**: Session table terlalu besar atau koneksi MySQL timeout.

**Solusi**:
```sql
-- Bersihkan session expired
DELETE FROM sessions WHERE expires < UNIX_TIMESTAMP(NOW());

-- Optimize table
OPTIMIZE TABLE sessions;
```

### 11. SQL Import gagal: "ERROR 1064" atau "syntax error"

**Penyebab**: Versi MySQL/MariaDB tidak kompatibel.

**Solusi**: Import via phpMyAdmin (lebih forgiving terhadap perbedaan versi).

### 12. Error: The '<' operator is reserved for future use (PowerShell)

**Penyebab**: PowerShell tidak support redirect `<` untuk stdin.

**Solusi**:
```bash
# Gunakan Get-Content pipeline (PowerShell)
Get-Content file.sql | mysql -u root -p database_name

# Atau gunakan Command Prompt (cmd)
mysql -u root -p database_name < file.sql
```

---

## Checklist Verifikasi Setup

Centang satu per satu untuk memastikan semua langkah sudah benar:

### Instalasi Dasar

- [ ] Node.js v18+ terinstall (`node --version`)
- [ ] npm terinstall (`npm --version`)
- [ ] MySQL/MariaDB terinstall (`mysql --version`)
- [ ] `npm install` berhasil tanpa error
- [ ] Folder `node_modules/` terisi 300+ package

### Database

- [ ] MySQL service berjalan (cek via XAMPP / services / systemctl)
- [ ] Database `uts_employee_db` sudah dibuat
- [ ] Tabel `employees` ada (`mysql -u root -p -e "USE uts_employee_db; SHOW TABLES;"`)
- [ ] Tabel `users` ada
- [ ] Tabel `sessions` ada
- [ ] User admin default ada (`SELECT * FROM users WHERE username='admin';`)

### Environment Variables

- [ ] File `.env` sudah dibuat (copy dari `.env.example`)
- [ ] `DB_HOST` sudah benar (`localhost` atau `mysql` untuk Docker)
- [ ] `DB_USER` sudah benar
- [ ] `DB_PASSWORD` sudah diisi (atau sengaja dikosongkan untuk XAMPP)
- [ ] `JWT_SECRET` sudah diganti (bukan nilai default)
- [ ] `SESSION_SECRET` sudah diganti (bukan nilai default)

### Static Assets

- [ ] Folder `public/` tidak kosong (`dir public` / `ls public/`)
- [ ] Folder `public/assets/css/` ada
- [ ] Folder `public/libs/bootstrap/` ada
- [ ] Akses `http://localhost:3000/assets/css/style.css` mengembalikan CSS (bukan 404)

### Upload Folders

- [ ] Folder `uploads/photos/` ada
- [ ] Folder `uploads/excels/` ada

### Aplikasi Berjalan

- [ ] `npm start` berjalan tanpa error
- [ ] Console output: "Server running on http://localhost:3000"
- [ ] Buka `http://localhost:3000` → redirect ke halaman login
- [ ] Halaman login tampil dengan CSS dan styling
- [ ] CAPTCHA muncul di halaman login
- [ ] Login dengan `admin@uts.com` / `password` berhasil
- [ ] Setelah login, redirect ke dashboard
- [ ] Dashboard menampilkan statistik cards
- [ ] Sidebar menampilkan menu lengkap

---

## Konfigurasi Tambahan

### SSL/HTTPS (Production)

Jika deploy ke production dengan HTTPS, update file `config/database.js`:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
  }
});
```

### Backup Database

```bash
# Backup (semua tabel)
mysqldump -u root -p uts_employee_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup (specific tabel saja)
mysqldump -u root -p uts_employee_db employees users > backup_karyawan.sql

# Restore
mysql -u root -p uts_employee_db < backup_file.sql
```

### Update Dependencies

```bash
# Cek update yang tersedia
npm outdated

# Update semua ke versi terbaru (hati-hati, bisa breaking changes)
npm update

# Update package tertentu
npm install express@latest
```

---

## Catatan Penting

### Keamanan

- ⚠️ Jangan commit file `.env` ke repository publik
- ⚠️ Ganti `JWT_SECRET` dan `SESSION_SECRET` dengan random string yang panjang
- ⚠️ Ganti password admin default (`password`) setelah login pertama
- ⚠️ Gunakan HTTPS untuk production deployment
- ⚠️ Update dependencies secara berkala untuk patch security

### Data

- 💾 Backup database secara berkala (minimal sebelum update)
- 📁 Folder `uploads/` perlu di-backup juga (foto karyawan)
- 🗂️ Export data ke Excel secara berkala sebagai backup tambahan

### Development

- 🔧 Gunakan `npm run dev` untuk development (alias untuk `node server.js`)
- 📝 Restart server manual saat ada perubahan kode (tidak ada auto-reload/hot-reload)
- 🐛 Error detail tampil di console, cek terminal saat development

### Production

- 🚀 Gunakan PM2 atau Docker untuk production deployment
- 📊 Setup monitoring (PM2 monitoring, Docker healthcheck)
- 🔄 Setup restart otomatis jika server crash (PM2: `--max-restarts`, Docker: `restart: unless-stopped`)

---

## Struktur Folder Setelah Setup

```
uts-fullstack/
├── node_modules/                   # Dependencies (auto-generated, jangan di-commit)
├── public/                         # Static assets Dasher (harus di-copy manual)
│   ├── assets/
│   │   ├── css/style.css
│   │   ├── js/
│   │   ├── fonts/
│   │   └── images/
│   └── libs/
│       ├── bootstrap/dist/
│       ├── apexcharts/
│       └── ...
├── uploads/                        # Folder uploads
│   ├── photos/                     # Foto profil karyawan
│   └── excels/                     # File Excel upload & data dummy
├── .env                            # Environment variables (JANGAN di-commit!)
├── .env.example                    # Template environment (boleh di-commit)
├── server.js                       # Entry point
├── app.js                          # Express configuration
├── package.json                    # Project metadata & dependencies
├── package-lock.json               # Locked dependency versions
├── docker-compose.yml              # Docker Compose configuration
├── Dockerfile                      # Docker image definition
├── setup.bat                       # Windows automated setup
├── setup.sh                        # Linux/Mac automated setup
├── README.md                       # Project overview & quick start
├── SETUP.md                        # File ini — panduan setup lengkap
├── LICENSE                         # ISC License
├── .gitignore
└── 411231139_muhamad_aditya_saputra.sql  # Database schema & default data
```

---

**Selamat menggunakan Employee Management System!**

Jika ada masalah, ulangi langkah dari [Checklist Verifikasi Setup](#checklist-verifikasi-setup) atau cek bagian [Troubleshooting](#troubleshooting).
