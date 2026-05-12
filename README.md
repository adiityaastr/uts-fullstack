# PT Digital Nusantara - Employee Management System

> Sistem Manajemen Karyawan berbasis web untuk **Ujian Tengah Semester (UTS) Fullstack Web Development**.

**NIM:** 411231139 | **Nama:** Muhamad Aditya Saputra

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Fitur Lengkap](#fitur-lengkap)
- [Quick Start](#quick-start)
- [Akun Default](#akun-default)
- [Struktur Project](#struktur-project)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Environment Variables](#environment-variables)
- [Fitur Detail](#fitur-detail)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Credits](#credits)
- [License](#license)

---

## Tech Stack

| Layer       | Technology                           | Version  |
|-------------|--------------------------------------|----------|
| **Backend** | Node.js                              | 18+      |
|             | Express.js                           | 4.22+    |
| **Frontend**| EJS Template Engine                  | 5.0      |
|             | Bootstrap 5 (Dasher Admin Template)  | 5.3      |
|             | ApexCharts / Tabler Icons            | -        |
| **Database**| MySQL / MariaDB                      | 8.0+     |
|             | mysql2 (promise-based)               | 3.22+    |
| **Auth**    | bcrypt                               | 6.0      |
|             | jsonwebtoken (JWT)                   | 9.0      |
|             | express-session + MySQL Store        | 1.19     |
| **Upload**  | Multer                               | 2.1      |
| **Export**  | ExcelJS (Excel), xlsx                | 4.4      |
|             | Puppeteer (PDF)                      | 24.4+    |
| **DevOps**  | Docker + Docker Compose              | -        |

---

## Fitur Lengkap

### Authentication & Security
- [x] Login / Register / Logout
- [x] Custom Math CAPTCHA (random soal matematika)
- [x] Forgot Password dengan reset token via email
- [x] "Remember Me" — session auto-restore setelah cookie expired
- [x] Auto logout setelah **1 jam** inactivity (session maxAge)
- [x] Password hashing dengan bcrypt (10 salt rounds)
- [x] JWT untuk API authentication

### Role-Based Access Control
- [x] **Admin**: akses penuh ke semua fitur
- [x] **Employee**: akses terbatas (dashboard & profil sendiri)

### Dashboard
- [x] Statistik cards: total karyawan, aktif, divisi, user
- [x] Chart overview (ApexCharts)
- [x] Data real-time dari database

### Employee CRUD
- [x] Tambah / Edit / Hapus / Lihat detail karyawan
- [x] **23 field data** termasuk foto profil, kontak darurat, status pernikahan
- [x] Upload foto profil (max 2MB, format: jpg/jpeg/png)
- [x] Search by nama atau kode karyawan
- [x] Pagination (setiap 10 data per halaman)
- [x] Filter by divisi dan status

### User Management
- [x] Admin dapat membuat akun user yang terhubung ke data karyawan
- [x] Set role (Admin / Employee)
- [x] Aktifasi / non-aktifasi akun
- [x] Edit username, email, password
- [x] Catat last login timestamp

### Excel Import / Export
- [x] **Import**: upload file Excel (.xlsx) atau CSV untuk bulk insert karyawan
- [x] Support kolom **Bahasa Indonesia** dan **English**
- [x] Deteksi duplikat kode karyawan
- [x] **Export**: download seluruh data karyawan ke Excel (.xlsx)
- [x] Manajemen file upload (lihat, download, hapus)

### PDF Export
- [x] Generate laporan karyawan dalam format PDF
- [x] Menggunakan Puppeteer + Chromium headless
- [x] Layout profesional dengan tabel & header

---

## Quick Start

### Metode 1: Docker (Paling Mudah)

```bash
# Clone project (jika belum)
git clone https://github.com/adiityaastr/uts-fullstack.git
cd uts-fullstack

# Jalankan dengan Docker Compose
docker-compose up -d
```

Server berjalan di **http://localhost:3000** dalam hitungan detik. MySQL otomatis terkonfigurasi dan schema terimport.

### Metode 2: Manual (Node.js + MySQL Lokal)

```bash
# 1. Install dependencies
npm install

# 2. Buat database MySQL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS uts_employee_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Import schema
mysql -u root -p uts_employee_db < 411231139_muhamad_aditya_saputra.sql

# 4. Konfigurasi .env
copy .env.example .env    # Windows
# cp .env.example .env    # Linux/Mac
# Edit .env, isi DB_PASSWORD dan secret keys

# 5. Buat folder uploads
mkdir uploads\photos uploads\excels    # Windows
# mkdir -p uploads/photos uploads/excels  # Linux/Mac

# 6. Jalankan
npm start
```

### Metode 3: Setup Script Otomatis

```bash
# Windows
setup.bat

# Linux / Mac
chmod +x setup.sh && ./setup.sh
```

Script akan mengecek prerequisites, install dependencies, setup database, dan konfigurasi .env secara interaktif.

> **Panduan setup lengkap** (termasuk XAMPP, Docker, troubleshooting) tersedia di [SETUP.md](SETUP.md).

---

## Akun Default

Setelah import database, tersedia akun admin default:

| Username | Email           | Password   | Role  |
|----------|-----------------|------------|-------|
| admin    | admin@uts.com   | `password` | Admin |

> **PENTING**: Ganti password admin setelah login pertama kali di halaman **User Management**!

Untuk membuat akun baru:
1. Login sebagai Admin
2. Buka menu **Users** → **Add User**
3. Pilih employee yang akan dibuatkan akun
4. Isi username, email, dan password

---

## Struktur Project

```
web_uts_fullstack/
├── server.js                   # Entry point (npm start)
├── app.js                      # Express config, middleware, routes, error handler
├── config/
│   └── database.js             # MySQL connection pool (mysql2/promise)
├── controllers/                # Route handler logic
│   ├── authController.js       # Login, register, logout, forgot/reset password
│   ├── dashboardController.js  # Dashboard stats & charts
│   ├── employeeController.js   # Employee CRUD + search + pagination
│   ├── userController.js       # User management (admin only)
│   └── uploadController.js     # Excel/CSV upload & file management
├── middleware/                  # Express middleware
│   ├── auth.js                 # Session & JWT authentication + remember me
│   ├── role.js                 # Role-based access (Admin / Employee)
│   └── upload.js               # Multer config for photo & Excel upload
├── models/                     # Database query layer
│   ├── Employee.js             # All employee queries (CRUD, search, bulk)
│   └── User.js                 # User queries (find, create, reset, remember token)
├── routes/                     # Express route definitions
│   ├── authRoutes.js           # /auth/*
│   ├── dashboardRoutes.js      # /dashboard/*
│   ├── employeeRoutes.js       # /employees/*
│   ├── userRoutes.js           # /users/*
│   └── uploadRoutes.js         # /upload/*
├── views/                      # EJS templates (server-side rendering)
│   ├── auth/                   # Login, register, forgot/reset password
│   ├── dashboard/              # Dashboard with stats & charts
│   ├── employees/              # CRUD forms, list, detail, search
│   ├── users/                  # User list, create, edit
│   ├── upload/                 # Excel import page & file list
│   └── partials/               # Header, sidebar, footer (reusable)
├── public/                     # Static assets (Dasher Bootstrap 5 template)
│   ├── assets/                 # CSS, JS, fonts, images
│   └── libs/                   # Vendor libraries (Bootstrap, ApexCharts, etc.)
├── uploads/                    # Runtime upload folder
│   ├── photos/                 # Employee profile photos
│   └── excels/                 # Uploaded Excel/CSV files
├── utils/                      # Utility modules
│   ├── captcha.js              # Custom math CAPTCHA generator
│   ├── excelGenerator.js       # Excel export logic
│   └── pdfGenerator.js         # PDF export via Puppeteer
├── 411231139_muhamad_aditya_saputra.sql  # Database schema + default data
├── docker-compose.yml          # Docker Compose (MySQL + App)
├── Dockerfile                  # Docker image (Node 18 Alpine + Chromium)
├── setup.bat / setup.sh        # Automated setup scripts
├── .env.example                # Environment variables template
├── package.json                # Node.js dependencies & scripts
├── README.md                   # File ini
├── SETUP.md                    # Panduan setup lengkap
└── LICENSE                     # ISC License
```

---

## Database Schema

```
┌─ employees ───────────────────────────────────────────┐
│ id (PK, AI)           employee_code (UNIQUE)           │
│ full_name (INDEXED)   gender            birth_date     │
│ email (UNIQUE)        phone_number      address         │
│ city                  province          postal_code     │
│ division (INDEXED)    position          salary          │
│ join_date             employment_status profile_photo  │
│ emergency_contact     emergency_phone                   │
│ education             marital_status                    │
│ created_at            updated_at                        │
│                                                        │
│ PK: id       UNIQUE: employee_code, email               │
│ INDEX: idx_full_name (full_name), idx_division (division)│
└────────────────────────────────────────────────────────┘
        │
        │ 1 : 0..1 (FK employee_id ON DELETE SET NULL)
        ▼
┌─ users ────────────────────────────────────────────┐
│ id (PK)          employee_id (FK → employees.id)   │
│ username (UNIQUE) email (UNIQUE)  password         │
│ role             status           remember_token    │
│ last_login       reset_token      reset_token_exp. │
│ created_at       updated_at                         │
└─────────────────────────────────────────────────────┘

┌─ sessions ─────────────────────────────────────────┐
│ session_id (PK)  expires          data (TEXT)       │
└────────────────────────────────────────────────────┘
```

**Tabel:**
- `employees` — 23 kolom data karyawan; 6 kategori: identitas, pribadi, kontak, kepegawaian, keamanan, audit trail
- `users` — akun login dengan role Admin/Employee, terhubung ke employee
- `sessions` — session store MySQL (auto-managed oleh express-mysql-session)

**Constraints & Indexes:**
- `employee_code` — UNIQUE (mencegah duplikasi NIK)
- `email` — UNIQUE (mencegah duplikasi email)
- `idx_full_name` — INDEX pada `full_name` (mempercepat pencarian LIKE)
- `idx_division` — INDEX pada `division` (mempercepat filter & GROUP BY)

**Relasi:** `users.employee_id` → `employees.id` (1 employee boleh punya 0 atau 1 user account)

---

## API Routes

### Halaman Web (Server-Rendered EJS)

| Method | Path                        | Role      | Deskripsi                    |
|--------|-----------------------------|-----------|------------------------------|
| GET    | `/`                         | -         | Redirect ke dashboard/login  |
| GET    | `/auth/login`               | Guest     | Halaman login + CAPTCHA      |
| POST   | `/auth/login`               | Guest     | Proses login                 |
| GET    | `/auth/register`            | Guest     | Halaman registrasi           |
| POST   | `/auth/register`            | Guest     | Proses registrasi            |
| GET    | `/auth/logout`              | User      | Logout & hapus session       |
| GET    | `/auth/forgot-password`     | Guest     | Form lupa password           |
| POST   | `/auth/forgot-password`     | Guest     | Kirim reset token            |
| GET    | `/auth/reset-password/:token`| Guest    | Form reset password          |
| POST   | `/auth/reset-password/:token`| Guest    | Proses reset password        |
| GET    | `/dashboard`                | User      | Dashboard + statistik        |
| GET    | `/employees`                | User      | List karyawan + search       |
| GET    | `/employees/create`         | Admin     | Form tambah karyawan         |
| POST   | `/employees`                | Admin     | Simpan karyawan baru         |
| GET    | `/employees/:id`            | User      | Detail karyawan              |
| GET    | `/employees/:id/edit`       | Admin     | Form edit karyawan           |
| POST   | `/employees/:id/update`     | Admin     | Update data karyawan         |
| POST   | `/employees/:id/delete`     | Admin     | Hapus karyawan               |
| GET    | `/employees/export/excel`   | Admin     | Export Excel                 |
| GET    | `/employees/export/pdf`     | Admin     | Export PDF                   |
| GET    | `/users`                    | Admin     | List user accounts           |
| GET    | `/users/create`             | Admin     | Form tambah user             |
| POST   | `/users`                    | Admin     | Simpan user baru             |
| GET    | `/users/:id/edit`           | Admin     | Form edit user               |
| POST   | `/users/:id/update`         | Admin     | Update user                  |
| POST   | `/users/:id/delete`         | Admin     | Hapus user                   |
| GET    | `/upload`                   | Admin     | Halaman upload Excel         |
| POST   | `/upload/excel`             | Admin     | Proses upload & import       |
| POST   | `/upload/file/:filename/delete` | Admin | Hapus file Excel             |

### API Endpoints (JWT Bearer Token)

| Method | Path              | Auth  | Deskripsi                  |
|--------|-------------------|-------|----------------------------|
| GET    | `/api/employees`  | JWT   | List semua karyawan (JSON) |
| GET    | `/api/employees/:id`| JWT | Detail karyawan (JSON)     |

---

## Environment Variables

| Variable         | Deskripsi                      | Default          | Required |
|------------------|--------------------------------|------------------|----------|
| `DB_HOST`        | Host MySQL                     | `localhost`      | Yes      |
| `DB_USER`        | Username MySQL                 | `root`           | Yes      |
| `DB_PASSWORD`    | Password MySQL                 | *(kosong)*       | Yes      |
| `DB_NAME`        | Nama database                  | `uts_employee_db`| Yes      |
| `JWT_SECRET`     | Secret key untuk JWT signing   | *(wajib ganti)*  | Yes      |
| `SESSION_SECRET` | Secret key enkripsi session    | *(wajib ganti)*  | Yes      |
| `PORT`           | Port HTTP server               | `3000`           | No       |

> Generate JWT_SECRET dan SESSION_SECRET dengan:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## Fitur Detail

### Custom Math CAPTCHA
Saat login, user harus menjawab soal matematika acak (contoh: "Berapa hasil dari 7 + 3?"). CAPTCHA digenerate server-side dan divalidasi sebelum autentikasi. Mencegah brute-force login.

### "Remember Me"
Jika user mencentang "Remember Me" saat login, sistem menyimpan `remember_token` di cookie. Saat session 1 jam expired, cookie ini digunakan untuk auto-restore session tanpa perlu login ulang.

### Excel Import
Format yang didukung:
- **Excel (.xlsx)** — kolom pertama sebagai data
- **CSV** — comma-separated, baris pertama sebagai header

Kolom mendukung **Bahasa Indonesia** (Kode Karyawan, Nama Lengkap, dll) dan **English** (employee_code, full_name, dll). File dummy untuk testing tersedia di `uploads/excels/data_dummy_karyawan.xlsx`.

### Upload Foto Profil
- Max size: 2 MB
- Format: JPG, JPEG, PNG
- Disimpan di `uploads/photos/` dengan nama unik (timestamp + original name)

---

## Troubleshooting

### Error: Cannot find module 'xxx'
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: Access denied for user 'root'@'localhost'
Edit `.env`, pastikan `DB_PASSWORD` sesuai dengan password MySQL Anda.

### Error: connect ECONNREFUSED :3306
MySQL service tidak berjalan:
- **XAMPP**: Buka Control Panel → Start MySQL
- **Windows Services**: `services.msc` → MySQL → Start
- **Linux**: `sudo systemctl start mysql`

### Port 3000 sudah digunakan
Edit `.env`, ganti `PORT` ke nilai lain (misal: 8080).

### Halaman tampil tanpa CSS (404 assets)
Copy static assets dari `dasher-1.0.0/` ke `public/`. Lihat [SETUP.md](SETUP.md) untuk detail.

> **Troubleshooting lengkap** (8+ error & solusi) tersedia di [SETUP.md](SETUP.md#troubleshooting).

---

## Deployment

### Production dengan PM2

```bash
npm install -g pm2
pm2 start server.js --name employee-app
pm2 startup
pm2 save
```

### Production dengan Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Production
Pastikan mengubah di `.env`:
- `DB_PASSWORD` — password MySQL production
- `JWT_SECRET` — secret key random 64 karakter
- `SESSION_SECRET` — secret key random 64 karakter
- Gunakan reverse proxy (Nginx/Apache) untuk HTTPS

---

## Credits

- **Dasher Admin Template** — Bootstrap 5 admin dashboard oleh [CodesCandy](https://codescandy.com/) / [ThemeWagon](https://themewagon.com/)
- **ApexCharts** — Library chart interaktif
- **Tabler Icons** — SVG icon set
- **Bootstrap 5** — CSS framework

---

## License

ISC © 2026 Muhamad Aditya Saputra (411231139) — UTS Fullstack Web Development
