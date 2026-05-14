# Bahan Presentasi — Employee Management System PT Digital Nusantara

> **Demo Teknis | Fullstack Web Application**
> NIM: 411231139 | Nama: Muhamad Aditya Saputra

---

## Slide 1: Judul

**PT Digital Nusantara — Employee Management System**

- Fullstack Web Application
- Tech: Node.js + Express + MySQL + EJS + Bootstrap 5
- Durasi demo: 5-10 menit

---

## Slide 2: Arsitektur Sistem

```
┌─────────────┐       ┌──────────────────────┐       ┌───────────┐
│   Browser   │──────▶│    Express.js Server  │──────▶│   MySQL   │
│  (EJS+BS5)  │◀──────│  + Session Store (DB) │◀──────│  (InnoDB) │
└─────────────┘       └──────────────────────┘       └───────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
           Multer         Puppeteer       ExcelJS
          (Upload)         (PDF)         (Export)
```

**Pattern:** MVC (Model-View-Controller)
- **Model** → Query MySQL via mysql2/promise (prepared statements)
- **View** → EJS template engine (server-side rendering)
- **Controller** → Business logic + request handling
- **Middleware** → Auth check, role guard, file upload validation

### Catatan pembicara:
- Arsitektur monolith sederhana, cocok untuk skala project UTS
- Session disimpan di MySQL (bukan memory) → persistent across server restart
- Dual auth: session-based untuk web, JWT untuk API endpoint

---

## Slide 3: Tech Stack & Alasan Pemilihan

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Backend** | Express.js 4.22 | Ringan, middleware ecosystem luas, de-facto standard Node.js |
| **Template** | EJS 5.0 | Server-side rendering, syntax mirip HTML, mudah dipelajari |
| **Database** | MySQL 8 + mysql2/promise | Relational DB cocok untuk data terstruktur karyawan |
| **Auth** | bcrypt + JWT + express-session | Keamanan berlapis (hashing + token + session) |
| **Upload** | Multer 2.1 | Standard file upload middleware untuk Express |
| **Export** | ExcelJS + Puppeteer | Excel native format + PDF via headless Chrome |
| **UI** | Bootstrap 5 + Dasher Template | Responsive, admin-ready, profesional |
| **DevOps** | Docker Compose | One-command deployment (app + database) |

### Catatan pembicara:
- mysql2/promise dipilih karena support prepared statements → anti SQL injection
- Puppeteer render HTML ke PDF → fleksibel untuk layout custom tanpa library PDF rumit
- Dasher template mempercepat development UI tanpa desain dari nol

---

## Slide 4: Database Design

```
┌─ employees (23 kolom) ─────────────────────────┐
│ id (PK, AUTO_INCREMENT)                         │
│ employee_code (UNIQUE) ← NIK karyawan           │
│ full_name, gender, birth_date, marital_status   │
│ email (UNIQUE), phone_number                    │
│ address, city, province, postal_code            │
│ division, position, salary (DECIMAL 12,2)       │
│ join_date, employment_status                    │
│ emergency_contact, emergency_phone              │
│ profile_photo, education                        │
│ created_at, updated_at                          │
│                                                 │
│ INDEX: idx_full_name, idx_division              │
└─────────────────────────────────────────────────┘
         │
         │ 1 : 0..1 (FK, ON DELETE SET NULL)
         ▼
┌─ users (14 kolom) ─────────────────────────────┐
│ id (PK)                                         │
│ employee_id (FK → employees.id)                 │
│ username (UNIQUE), email (UNIQUE)               │
│ password (bcrypt hash)                          │
│ role (Admin / Employee)                         │
│ status (Active / Inactive)                      │
│ remember_token, last_login                      │
│ reset_token, reset_token_expires                │
│ created_at, updated_at                          │
└─────────────────────────────────────────────────┘

┌─ sessions ─────────────────────────────────────┐
│ session_id (PK), expires, data                  │
│ (auto-managed oleh express-mysql-session)       │
└─────────────────────────────────────────────────┘
```

### Catatan pembicara:
- Relasi 1:1 → 1 karyawan boleh punya 0 atau 1 akun user
- ON DELETE SET NULL → jika karyawan dihapus, akun user tetap ada tapi tidak terhubung
- DECIMAL(12,2) untuk gaji → presisi uang (bukan FLOAT yang bisa kehilangan presisi)
- Index pada full_name dan division → mempercepat pencarian LIKE dan GROUP BY

---

## Slide 5: Fitur Utama (Demo Flow)

### 1. Authentication & Security
- Login dengan **CAPTCHA matematika** (random soal, server-side validation)
- **Remember Me** → auto-restore session via cookie token (30 hari)
- **Forgot Password** → generate reset token + link (expiry 1 jam)
- Auto logout setelah 1 jam inactivity

### 2. Dashboard
- 4 statistik cards (total karyawan, divisi, user, karyawan aktif)
- Chart interaktif: donut (per divisi) + bar (per status)
- Data real-time dari database

### 3. Employee CRUD
- 23 field data lengkap termasuk foto profil
- Search by nama/divisi/status + pagination (10/halaman)
- Upload foto (max 2MB, validasi format jpg/png)

### 4. Role-Based Access Control
- **Admin** → akses penuh (CRUD, user management, import/export)
- **Employee** → hanya bisa lihat dashboard & data karyawan

### 5. Import/Export
- **Import Excel/CSV** → bulk insert, deteksi duplikat kode karyawan
- **Export Excel** → download .xlsx dengan header berwarna
- **Export PDF** → generate via Puppeteer, layout tabel profesional

### 6. User Management (Admin only)
- Buat akun user terhubung ke data karyawan
- Set role, aktivasi/nonaktifasi akun

### Catatan pembicara:
- Urutan demo yang disarankan: Login → Dashboard → Tambah Karyawan → Import Excel → Export PDF → Logout
- Tunjukkan CAPTCHA berubah setiap refresh halaman login
- Tunjukkan perbedaan akses Admin vs Employee

---

## Slide 6: Security Implementation

| Aspek | Implementasi | Detail |
|-------|-------------|--------|
| Password | bcrypt | 10 salt rounds, one-way hash |
| Session | express-session + MySQL Store | maxAge 1 jam, httpOnly cookie |
| CAPTCHA | Custom math | Server-side generate & validate |
| Remember Me | crypto.randomBytes(32) | Token di cookie httpOnly, 30 hari |
| Reset Password | Token + expiry | 32 bytes random, expire 1 jam |
| File Upload | Multer validation | Whitelist mimetype + max 2MB |
| SQL Injection | Prepared statements | Parameterized queries via mysql2 |
| XSS | Output sanitization | Escape `<>` di data chart dashboard |
| Role Guard | Middleware isAdmin | Cek role sebelum akses route |

### Catatan pembicara:
- Semua query menggunakan `?` placeholder → tidak ada string concatenation
- Cookie httpOnly → tidak bisa diakses via JavaScript (anti XSS cookie theft)
- Middleware chain: `isAuthenticated → isAdmin → controller` memastikan akses berlapis

---

## Slide 7: Struktur Project

```
web_uts_fullstack/
├── server.js              ← Entry point (npm start)
├── app.js                 ← Express config, middleware, routes, error handler
├── config/
│   └── database.js        ← MySQL connection pool (10 connections)
├── controllers/           ← Business logic
│   ├── authController.js      (login, register, forgot/reset password)
│   ├── dashboardController.js (statistik + chart data)
│   ├── employeeController.js  (CRUD karyawan)
│   ├── userController.js      (user management)
│   └── uploadController.js    (excel import + file management)
├── models/                ← Database query layer
│   ├── Employee.js            (findAll, create, update, delete, bulkCreate)
│   └── User.js               (findByUsername, findByEmail, findByRememberToken)
├── middleware/            ← Request pipeline
│   ├── auth.js                (session check + remember me restore)
│   ├── role.js                (admin-only guard)
│   └── upload.js              (multer config: photo + excel)
├── routes/                ← URL → Controller mapping
├── views/                 ← EJS templates (6 folder)
├── utils/                 ← Helpers
│   ├── captcha.js             (random math question generator)
│   ├── excelGenerator.js      (ExcelJS workbook builder)
│   └── pdfGenerator.js        (Puppeteer HTML → PDF)
├── uploads/               ← Runtime files (photos + excels)
├── public/                ← Static assets (CSS, JS, fonts)
└── docker-compose.yml     ← Docker deployment
```

### Catatan pembicara:
- Separation of concerns yang jelas: setiap file punya 1 tanggung jawab
- Request flow: `Route → Middleware → Controller → Model → Database`
- Total ~15 file kode utama (tidak termasuk views & static assets)

---

## Slide 8: Penutup & Key Takeaways

### Yang sudah diimplementasikan:
- ✅ Fullstack MVC dengan Node.js + Express + MySQL
- ✅ Authentication & authorization berlapis (session + JWT + CAPTCHA)
- ✅ CRUD lengkap dengan 23 field data karyawan
- ✅ Import/Export data (Excel & PDF)
- ✅ Role-Based Access Control (Admin vs Employee)
- ✅ Responsive UI dengan Bootstrap 5
- ✅ Docker-ready untuk deployment

### Pembelajaran teknis:
- Implementasi session management dengan persistent store
- File upload handling dengan validasi keamanan
- Bulk data import dengan error handling per-row
- PDF generation menggunakan headless browser

---

## Lampiran: Quick Commands

```bash
# Jalankan project
npm start                    # http://localhost:3000

# Atau via Docker
docker-compose up -d         # Auto setup MySQL + App

# Login default
Username: admin
Password: password
```

---

*Dokumen ini dibuat sebagai bahan pendukung presentasi demo teknis.*


---

## Lampiran: Code Highlights untuk Ditampilkan & Dijelaskan

Berikut bagian-bagian kode yang paling penting untuk ditunjukkan saat presentasi, beserta poin penjelasannya.

---

### 1. `config/database.js` — Koneksi Database (Connection Pool)

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
```

**Cara kerja detail:**

1. **`require('mysql2/promise')`** — Mengimpor versi promise-based dari mysql2. Berbeda dengan mysql2 biasa yang pakai callback (`(err, result) => {}`), versi ini return Promise sehingga bisa pakai `async/await`. Ini membuat kode lebih mudah dibaca dan di-maintain.

2. **`require('dotenv').config()`** — Membaca file `.env` di root project dan memasukkan isinya ke `process.env`. Jadi credential database tidak perlu ditulis langsung di kode (hardcode), melainkan disimpan di file `.env` yang tidak di-commit ke Git.

3. **`mysql.createPool({...})`** — Membuat **connection pool**, bukan single connection. Bedanya:
   - **Single connection**: 1 koneksi dipakai bergantian. Jika ada 10 request bersamaan, 9 harus menunggu.
   - **Connection pool**: Menyiapkan beberapa koneksi sekaligus. Request bisa dilayani paralel tanpa saling menunggu.

4. **`waitForConnections: true`** — Jika semua 10 koneksi sedang dipakai, request baru akan **menunggu** (antri) sampai ada koneksi yang selesai, bukan langsung error.

5. **`connectionLimit: 10`** — Maksimal 10 koneksi aktif ke MySQL secara bersamaan. Angka ini dipilih karena:
   - Cukup untuk aplikasi skala UTS (tidak terlalu banyak concurrent user)
   - Tidak membebani MySQL server (setiap koneksi pakai memory di server DB)

6. **`module.exports = pool`** — Pool di-export sebagai singleton. Seluruh aplikasi (models, controllers) menggunakan pool yang sama. Tidak perlu buat koneksi baru setiap kali query.

**Alur saat query dijalankan:**
```
Controller panggil Model → Model panggil pool.execute(sql)
→ Pool ambil 1 koneksi idle dari pool
→ Kirim query ke MySQL → Terima hasil
→ Koneksi dikembalikan ke pool (siap dipakai request lain)
```

---

### 2. `middleware/auth.js` — Authentication + Remember Me

```javascript
async function isAuthenticated(req, res, next) {
  if (req.session.user) return next();

  const rememberToken = req.cookies?.remember_token;
  if (rememberToken) {
    try {
      const user = await User.findByRememberToken(rememberToken);
      if (user) {
        req.session.user = { id: user.id, username: user.username, role: user.role };
        return next();
      }
    } catch {}
  }

  req.session.error = 'Silakan login terlebih dahulu';
  res.redirect('/auth/login');
}
```

**Cara kerja detail:**

Middleware ini adalah "penjaga gerbang" — setiap request ke halaman yang butuh login **harus melewati fungsi ini dulu**.

1. **`if (req.session.user) return next()`** — Pengecekan pertama: apakah session masih aktif? `req.session.user` berisi `{id, username, role}` yang di-set saat login. Jika ada, langsung `next()` (lanjut ke controller). Session berlaku 1 jam sejak aktivitas terakhir.

2. **`req.cookies?.remember_token`** — Pengecekan kedua: jika session sudah expired (lewat 1 jam), cek apakah ada cookie `remember_token`. Operator `?.` (optional chaining) mencegah error jika `req.cookies` undefined.

3. **`User.findByRememberToken(rememberToken)`** — Cari di database: apakah token ini cocok dengan salah satu user? Query-nya: `SELECT * FROM users WHERE remember_token = ?`. Jika cocok, berarti user ini pernah login dan centang "Remember Me".

4. **`req.session.user = {...}`** — Jika token valid, **buat session baru** otomatis tanpa user perlu login ulang. Ini yang disebut "auto-restore session". User tidak sadar session-nya pernah expired.

5. **`catch {}`** — Jika terjadi error (misal DB down), abaikan saja dan lanjut ke langkah berikutnya (redirect login). Tidak crash server.

6. **`req.session.error = '...'` + `res.redirect('/auth/login')`** — Pengecekan ketiga (fallback): jika session tidak ada DAN remember token tidak valid → redirect ke halaman login dengan pesan error.

**Alur visual:**
```
Request masuk
  ├─ Session ada? → ✅ next() (lanjut ke halaman)
  ├─ Cookie remember_token ada?
  │   ├─ Token cocok di DB? → ✅ Buat session baru → next()
  │   └─ Token tidak cocok → ❌ Redirect login
  └─ Tidak ada cookie → ❌ Redirect login
```

**Kenapa pattern ini penting:**
- User tidak perlu login ulang setiap 1 jam jika sudah centang "Remember Me"
- Cookie berlaku 30 hari, jadi selama itu user bisa auto-login
- Jika user logout, cookie dihapus → remember token tidak bisa dipakai lagi

---

### 3. `middleware/role.js` — Role-Based Access Control

```javascript
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'Admin') return next();
  req.session.error = 'Akses ditolak. Hanya Admin yang dapat mengakses halaman ini.';
  res.redirect('/dashboard');
}
```

**Cara kerja detail:**

Middleware ini mengontrol **otorisasi** (authorization) — bukan siapa yang boleh masuk sistem (itu authentication), tapi **apa yang boleh dilakukan** setelah masuk.

1. **`req.session.user && req.session.user.role === 'Admin'`** — Dua pengecekan sekaligus:
   - `req.session.user` → pastikan session ada (user sudah login)
   - `.role === 'Admin'` → pastikan role-nya Admin, bukan Employee
   
   Jika keduanya true → `next()` (lanjut ke controller).

2. **Kenapa cek session lagi padahal sudah ada `isAuthenticated`?** — Defensive programming. Middleware ini bisa saja dipanggil tanpa `isAuthenticated` di depannya (misalnya developer lupa). Dengan cek `req.session.user &&`, tidak akan crash jika session null.

3. **`req.session.error = '...'`** — Set pesan error di session. Pesan ini akan muncul 1 kali di halaman dashboard (flash message pattern).

4. **`res.redirect('/dashboard')`** — User Employee yang coba akses halaman Admin dikembalikan ke dashboard, bukan ke halaman login. Karena mereka sudah login, hanya saja tidak punya izin.

**Cara penggunaan di route:**
```javascript
// Hanya Admin yang bisa tambah karyawan
router.post('/', isAuthenticated, isAdmin, controller.create);

// Semua user login bisa lihat list
router.get('/', isAuthenticated, controller.index);
```

**Alur middleware chain:**
```
Request POST /employees
  → isAuthenticated: sudah login? ✅
  → isAdmin: role Admin? ✅
  → controller.create: proses tambah karyawan
```

Jika Employee coba POST /employees:
```
  → isAuthenticated: sudah login? ✅
  → isAdmin: role Admin? ❌ → redirect /dashboard + pesan error
  (controller.create TIDAK pernah dijalankan)
```

---

### 4. `utils/captcha.js` — Custom Math CAPTCHA

```javascript
function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b, a, b };
}
```

**Cara kerja detail:**

CAPTCHA (Completely Automated Public Turing test to tell Computers and Humans Apart) ini mencegah bot melakukan brute-force login.

1. **`Math.random()`** — Menghasilkan angka desimal acak antara 0 (inklusif) dan 1 (eksklusif). Contoh: 0.7342...

2. **`Math.random() * 10`** — Kalikan 10 → range jadi 0 sampai 9.999... Contoh: 7.342...

3. **`Math.floor(...)`** — Bulatkan ke bawah → jadi integer 0-9. Contoh: 7

4. **`... + 1`** — Tambah 1 → range final jadi 1-10. Ini agar soal tidak ada angka 0 (terlalu mudah).

5. **Return object:**
   - `question: "7 + 3 = ?"` → ditampilkan ke user di form login
   - `answer: 10` → disimpan di `req.session.captchaAnswer` (server-side)
   - `a, b` → angka individual (untuk keperluan rendering di template jika perlu)

**Alur penggunaan di sistem:**
```
1. User buka /auth/login
2. showLogin() panggil generateCaptcha()
3. Jawaban (answer) disimpan di req.session.captchaAnswer
4. Soal (question) dikirim ke template EJS → ditampilkan di form
5. User isi jawaban + submit form
6. login() bandingkan: parseInt(req.body.captcha) === req.session.captchaAnswer
7. Jika salah → redirect login + error "CAPTCHA salah"
8. Jika benar → lanjut proses login
9. Setelah login sukses → delete req.session.captchaAnswer (bersihkan)
```

**Kenapa efektif mencegah bot:**
- Jawaban disimpan di **server session**, bukan di HTML → bot tidak bisa baca jawaban dari source code halaman
- Soal berubah setiap kali halaman di-refresh → bot tidak bisa hardcode jawaban
- Bot harus bisa "memahami" soal matematika → menambah kompleksitas serangan
- Sederhana untuk manusia (penjumlahan 1-10) tapi menambah 1 langkah untuk bot

---

### 5. `controllers/authController.js` — Login Flow (bagian penting)

```javascript
async login(req, res) {
  const { username, password, captcha } = req.body;

  // 1. Validasi CAPTCHA
  if (parseInt(captcha) !== req.session.captchaAnswer) {
    req.session.error = 'CAPTCHA salah. Silakan coba lagi.';
    return res.redirect('/auth/login');
  }

  // 2. Cari user
  const user = await User.findByUsername(username);
  if (!user) { /* error */ }

  // 3. Cek status akun
  if (user.status === 'Inactive') { /* error: akun nonaktif */ }

  // 4. Verifikasi password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) { /* error */ }

  // 5. Generate JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 6. Set session
  req.session.user = { id: user.id, username: user.username, role: user.role };
  req.session.token = token;

  // 7. Update last login timestamp
  await User.updateLastLogin(user.id);

  // 8. Handle Remember Me
  if (req.body.remember) {
    const rememberToken = crypto.randomBytes(32).toString('hex');
    await User.update(user.id, { remember_token: rememberToken });
    res.cookie('remember_token', rememberToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  delete req.session.captchaAnswer;
  return res.redirect('/dashboard');
}
```

**Cara kerja detail (8 langkah berurutan):**

**Langkah 1 — Validasi CAPTCHA:**
- `req.body` berisi data dari form HTML (username, password, captcha)
- `parseInt(captcha)` → konversi string input user ke angka
- Bandingkan dengan `req.session.captchaAnswer` yang di-set saat halaman login di-render
- Jika salah → langsung redirect, **tidak lanjut ke pengecekan password** (hemat resource, tidak perlu query DB)

**Langkah 2 — Cari user di database:**
- `User.findByUsername(username)` → query: `SELECT * FROM users WHERE username = ?`
- Jika tidak ditemukan → return error "Username atau password salah"
- Pesan error sengaja **tidak spesifik** (tidak bilang "username tidak ada") → agar attacker tidak bisa enumerate username yang valid

**Langkah 3 — Cek status akun:**
- Admin bisa nonaktifkan akun user (set status = 'Inactive')
- User yang dinonaktifkan tidak bisa login meskipun password benar
- Use case: karyawan resign tapi datanya masih disimpan

**Langkah 4 — Verifikasi password dengan bcrypt:**
- `bcrypt.compare(plaintext, hash)` → membandingkan password yang diketik user dengan hash di database
- bcrypt **tidak pernah decrypt** hash → ia hash ulang input dengan salt yang sama, lalu bandingkan hasilnya
- Ini one-way: dari hash tidak bisa dikembalikan ke password asli
- Return `true` atau `false`

**Langkah 5 — Generate JWT token:**
- `jwt.sign(payload, secret, options)` → buat token berisi data user
- Payload: `{id, username, role}` → data yang bisa dibaca dari token
- Secret: kunci rahasia dari `.env` → untuk verifikasi keaslian token
- `expiresIn: '1h'` → token otomatis invalid setelah 1 jam
- Token ini disimpan di session untuk dipakai jika ada API call

**Langkah 6 — Set session:**
- `req.session.user = {...}` → menyimpan data user di session MySQL
- Setelah ini, middleware `isAuthenticated` akan mengenali user ini sebagai "sudah login"
- Data minimal: hanya id, username, role (tidak simpan password di session)

**Langkah 7 — Update last login:**
- `UPDATE users SET last_login = NOW() WHERE id = ?`
- Untuk audit trail: admin bisa lihat kapan terakhir user login
- Berguna untuk deteksi akun yang tidak aktif

**Langkah 8 — Handle Remember Me:**
- `crypto.randomBytes(32).toString('hex')` → generate 32 bytes random = 64 karakter hex
- Token ini **tidak bisa ditebak** (256-bit entropy, sama kuatnya dengan kunci enkripsi)
- Simpan di 2 tempat: database (kolom `remember_token`) dan cookie browser
- Cookie settings:
  - `maxAge: 30 * 24 * 60 * 60 * 1000` → 30 hari dalam milidetik (2.592.000.000 ms)
  - `httpOnly: true` → JavaScript di browser **tidak bisa** akses cookie ini (anti XSS)
  - `sameSite: 'lax'` → cookie tidak dikirim dari website lain (anti CSRF dasar)

**Terakhir:**
- `delete req.session.captchaAnswer` → bersihkan jawaban CAPTCHA dari session (tidak diperlukan lagi)
- `res.redirect('/dashboard')` → user berhasil login, arahkan ke dashboard

---

### 6. `models/Employee.js` — Query dengan Pagination & Search

```javascript
async findAll({ search, page = 1, limit = 10 }) {
  let sql = 'SELECT * FROM employees';
  let countSql = 'SELECT COUNT(*) AS total FROM employees';
  const params = [];
  const conditions = [];

  if (search) {
    const s = `%${search}%`;
    conditions.push('(full_name LIKE ? OR email LIKE ? OR division LIKE ? OR employment_status LIKE ?)');
    params.push(s, s, s, s);
  }

  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
    countSql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const allParams = [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)];

  const [rows] = await pool.execute(sql, allParams);
  const [countResult] = await pool.execute(countSql, params);
  const total = countResult[0].total;

  return { rows, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
}
```

**Cara kerja detail:**

Fungsi ini menangani 3 hal sekaligus: **pencarian**, **pagination**, dan **counting** — semua dengan prepared statements (anti SQL injection).

**1. Dynamic Query Building:**
```javascript
let sql = 'SELECT * FROM employees';       // Query dasar
const conditions = [];                       // Array untuk WHERE clauses
```
- Query dibangun secara dinamis — jika tidak ada search, WHERE tidak ditambahkan
- Pattern `conditions[]` memudahkan penambahan filter baru di masa depan (misal filter by divisi, status, dll)

**2. Search dengan LIKE:**
```javascript
const s = `%${search}%`;  // % = wildcard (cocok dengan karakter apapun)
conditions.push('(full_name LIKE ? OR email LIKE ? OR division LIKE ? OR employment_status LIKE ?)');
params.push(s, s, s, s);  // 4 parameter untuk 4 kolom
```
- `%keyword%` → cari "keyword" di posisi manapun dalam string
- Contoh: search "budi" → cocok dengan "Budi Santoso", "Agus Budiman", dll
- Search di 4 kolom sekaligus → user tidak perlu pilih mau cari di kolom mana
- **Prepared statement** (`?`) → nilai search TIDAK digabung langsung ke SQL string, mencegah SQL injection

**3. Pagination dengan LIMIT & OFFSET:**
```javascript
sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
const allParams = [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)];
```
- `ORDER BY created_at DESC` → data terbaru di atas
- `LIMIT 10` → ambil maksimal 10 baris
- `OFFSET` = berapa baris yang di-skip:
  - Page 1: OFFSET 0 (skip 0, ambil baris 1-10)
  - Page 2: OFFSET 10 (skip 10, ambil baris 11-20)
  - Page 3: OFFSET 20 (skip 20, ambil baris 21-30)
  - Formula: `(page - 1) * limit`

**4. Dua query terpisah:**
```javascript
const [rows] = await pool.execute(sql, allParams);        // Ambil data (10 baris)
const [countResult] = await pool.execute(countSql, params); // Hitung total semua
```
- Query pertama: ambil data untuk halaman ini saja (cepat, hanya 10 baris)
- Query kedua: hitung total data yang cocok (untuk tahu ada berapa halaman)
- Kenapa tidak pakai `SQL_CALC_FOUND_ROWS`? Karena sudah deprecated di MySQL 8.0+

**5. Return metadata pagination:**
```javascript
return { rows, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
```
- `rows` → array 10 data karyawan untuk ditampilkan
- `total` → total semua data yang cocok (misal 47)
- `page` → halaman saat ini (misal 2)
- `totalPages` → `Math.ceil(47 / 10)` = 5 halaman
- `Math.ceil` → pembulatan ke atas (47 data / 10 per halaman = 4.7 → 5 halaman)

**Contoh query yang dihasilkan:**
```sql
-- Tanpa search, page 1:
SELECT * FROM employees ORDER BY created_at DESC LIMIT 10 OFFSET 0

-- Dengan search "IT", page 2:
SELECT * FROM employees 
WHERE (full_name LIKE '%IT%' OR email LIKE '%IT%' OR division LIKE '%IT%' OR employment_status LIKE '%IT%') 
ORDER BY created_at DESC LIMIT 10 OFFSET 10
```

---

### 7. `models/Employee.js` — Bulk Import dengan Error Handling

```javascript
async bulkCreate(rows) {
  const fields = Object.keys(rows[0]).join(', ');
  const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
  const sql = `INSERT INTO employees (${fields}) VALUES (${placeholders})`;
  let inserted = 0;
  const skipped = [];

  for (const row of rows) {
    try {
      await pool.execute(sql, Object.values(row));
      inserted++;
    } catch (e) {
      skipped.push(row.employee_code || 'unknown');
    }
  }

  return { inserted, total: rows.length, skipped };
}
```

**Cara kerja detail:**

Fungsi ini mengimport banyak data karyawan sekaligus dari file Excel/CSV, dengan penanganan error per-baris.

**1. Bangun SQL template dari baris pertama:**
```javascript
const fields = Object.keys(rows[0]).join(', ');
// Hasil: "employee_code, full_name, gender, birth_date, email, ..."

const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
// Hasil: "?, ?, ?, ?, ?, ..."

const sql = `INSERT INTO employees (${fields}) VALUES (${placeholders})`;
// Hasil: "INSERT INTO employees (employee_code, full_name, ...) VALUES (?, ?, ...)"
```
- `Object.keys(rows[0])` → ambil nama-nama kolom dari object pertama
- Template SQL dibuat **sekali** di awal, dipakai berulang untuk setiap baris
- Tetap pakai `?` placeholder → aman dari SQL injection

**2. Loop per-row dengan try/catch:**
```javascript
for (const row of rows) {
  try {
    await pool.execute(sql, Object.values(row));
    inserted++;    // Berhasil → counter naik
  } catch (e) {
    skipped.push(row.employee_code || 'unknown');  // Gagal → catat kode-nya
  }
}
```
- **Kenapa insert per-row, bukan batch INSERT?**
  - Jika pakai batch (`INSERT INTO ... VALUES (...), (...), (...)`), 1 row error = SEMUA gagal
  - Dengan per-row: jika row ke-5 duplikat, row 1-4 dan 6-10 tetap berhasil masuk
  - Trade-off: sedikit lebih lambat, tapi jauh lebih reliable

- **Apa yang menyebabkan error (catch)?**
  - `employee_code` duplikat (UNIQUE constraint di database)
  - `email` duplikat (UNIQUE constraint)
  - Data tidak valid (misal tanggal format salah)
  - Kolom required yang kosong

- **`Object.values(row)`** → ambil semua nilai dari object, urutannya sama dengan `Object.keys`
  - Contoh: `{employee_code: "EMP001", full_name: "Budi"}` → `["EMP001", "Budi"]`

**3. Return statistik:**
```javascript
return { inserted, total: rows.length, skipped };
// Contoh: { inserted: 8, total: 10, skipped: ["EMP001", "EMP005"] }
```
- `inserted: 8` → 8 data berhasil masuk database
- `total: 10` → total 10 data di file Excel
- `skipped: ["EMP001", "EMP005"]` → kode karyawan yang gagal (duplikat)

**Pesan yang ditampilkan ke user:**
```
"Berhasil mengimport 8 dari 10 data. Kode duplikat/error: EMP001, EMP005"
```

**Alur lengkap dari upload sampai insert:**
```
User upload file.xlsx
→ Multer simpan ke uploads/excels/
→ Controller baca file dengan XLSX library
→ XLSX.utils.sheet_to_json() → array of objects
→ Mapping kolom (Indonesia → English field names)
→ bulkCreate(mappedRows)
→ Loop insert per-row
→ Return statistik → tampilkan ke user
```

---

### 8. `middleware/upload.js` — File Upload Validation

```javascript
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, photoDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) cb(null, true);
    else cb(new Error('Hanya file JPG dan PNG yang diizinkan'));
  },
});
```

**Cara kerja detail:**

Multer adalah middleware Express untuk menangani `multipart/form-data` (format yang dipakai saat upload file dari HTML form).

**1. Storage Configuration — Di mana dan dengan nama apa file disimpan:**

```javascript
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, photoDir),
  // photoDir = 'uploads/photos/' → folder tujuan penyimpanan

  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  // Date.now() = timestamp milidetik (misal: 1715698765432)
  // path.extname('foto_saya.jpg') = '.jpg'
  // Hasil: '1715698765432.jpg'
});
```
- **Kenapa pakai timestamp sebagai nama file?**
  - Mencegah bentrok nama (2 user upload "foto.jpg" bersamaan)
  - Mencegah karakter spesial di nama file yang bisa menyebabkan error
  - Unik karena timestamp milidetik tidak pernah sama

- **`cb(null, value)`** — Pattern callback Node.js: parameter pertama = error (null = tidak ada error), parameter kedua = nilai yang dikembalikan

**2. Size Limit — Batasi ukuran file:**
```javascript
limits: { fileSize: 2 * 1024 * 1024 }  // 2 MB dalam bytes
// 2 * 1024 = 2048 KB
// 2048 * 1024 = 2,097,152 bytes = 2 MB
```
- Jika file > 2MB → Multer throw error `LIMIT_FILE_SIZE`
- Error ini di-catch di `app.js` error handler → redirect dengan pesan "Ukuran file terlalu besar"
- Proteksi server dari upload file besar yang bisa menghabiskan disk space

**3. File Filter — Validasi tipe file SEBELUM disimpan:**
```javascript
fileFilter: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  // '.JPG' → '.jpg' (case-insensitive)
  
  if (['.jpg', '.jpeg', '.png'].includes(ext)) cb(null, true);   // ✅ Izinkan
  else cb(new Error('Hanya file JPG dan PNG yang diizinkan'));     // ❌ Tolak
},
```
- **Whitelist approach** → hanya izinkan format yang diketahui aman
- File ditolak **sebelum** ditulis ke disk → hemat storage, tidak perlu cleanup
- `.toLowerCase()` → user upload "FOTO.JPG" tetap diterima

**4. Auto-create folder (di bagian atas file):**
```javascript
if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });
if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });
```
- Saat server pertama kali jalan, folder `uploads/photos/` dan `uploads/excels/` otomatis dibuat
- `recursive: true` → buat parent folder juga jika belum ada (misal `uploads/` belum ada)

**5. Cara penggunaan di route:**
```javascript
router.post('/', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), controller.create);
//                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// 'profile_photo' = nama field <input type="file" name="profile_photo"> di HTML form
// .single() = hanya terima 1 file
```
- Setelah Multer selesai, file info tersedia di `req.file`:
  ```javascript
  req.file = {
    filename: '1715698765432.jpg',
    path: 'uploads/photos/1715698765432.jpg',
    size: 524288,  // bytes
    mimetype: 'image/jpeg'
  }
  ```
- Controller tinggal simpan `req.file.filename` ke database

**Alur lengkap upload foto:**
```
User pilih file di form → Submit
→ Multer cek: ukuran < 2MB? ✅
→ Multer cek: ekstensi jpg/png? ✅
→ Multer simpan ke uploads/photos/1715698765432.jpg
→ Controller ambil req.file.filename
→ INSERT ke database (kolom profile_photo = '1715698765432.jpg')
→ Saat tampilkan: <img src="/uploads/photos/1715698765432.jpg">
```

---

### 9. `utils/pdfGenerator.js` — PDF Export via Puppeteer

```javascript
async function generatePDFStream(employees, res) {
  const htmlRows = employees.map((e, i) => `
    <tr>
      <td>${i + 1}</td><td>${e.employee_code || ''}</td><td>${e.full_name || ''}</td>
      <td>${e.division || ''}</td><td>${e.position || ''}</td>
      <td>${e.employment_status || ''}</td><td>${e.email || ''}</td><td>${e.phone_number || ''}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html>...
    <h2>Laporan Data Karyawan - PT Digital Nusantara</h2>
    <table>...<tbody>${htmlRows}</tbody></table>
  </html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4', landscape: true, printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=employees_report.pdf',
    });
    res.end(pdfBuffer);
  } finally {
    await browser.close();
  }
}
```

**Cara kerja detail:**

Puppeteer adalah library Node.js yang mengontrol browser Chrome/Chromium secara programatik (tanpa tampilan GUI = "headless"). Kita memanfaatkannya untuk "print" halaman HTML menjadi PDF.

**1. Bangun HTML string dari data karyawan:**
```javascript
const htmlRows = employees.map((e, i) => `
  <tr>
    <td>${i + 1}</td><td>${e.employee_code || ''}</td>...
  </tr>
`).join('');
```
- `employees.map()` → loop setiap karyawan, buat baris `<tr>` HTML
- `i + 1` → nomor urut (dimulai dari 1, bukan 0)
- `e.employee_code || ''` → jika null/undefined, tampilkan string kosong (mencegah "null" muncul di PDF)
- `.join('')` → gabungkan semua baris jadi 1 string HTML

**2. HTML lengkap dengan CSS inline:**
```html
<style>
  body { font-family: Arial; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #0d6efd; color: white; }  /* Header biru */
  tr:nth-child(even) { background: #f9f9f9; }  /* Zebra striping */
</style>
```
- CSS langsung di dalam HTML (inline) karena Puppeteer tidak load file CSS eksternal
- Styling sama persis seperti yang akan muncul di PDF
- **Keuntungan Puppeteer vs library PDF biasa**: bisa pakai CSS standar, tidak perlu belajar API khusus

**3. Launch headless Chrome:**
```javascript
const browser = await puppeteer.launch({
  headless: true,                        // Tanpa GUI (tidak buka jendela browser)
  args: ['--no-sandbox', '--disable-setuid-sandbox'],  // Diperlukan di Linux/Docker
});
```
- `headless: true` → Chrome berjalan di background, tidak ada tampilan visual
- `--no-sandbox` → menonaktifkan sandbox Chrome (diperlukan saat jalan sebagai root di Docker)
- Proses ini memakan ~50-100MB RAM sementara

**4. Render HTML dan generate PDF:**
```javascript
const page = await browser.newPage();                          // Buka tab baru
await page.setContent(html, { waitUntil: 'networkidle0' });   // Isi dengan HTML kita
const pdfBuffer = await page.pdf({
  format: 'A4',           // Ukuran kertas A4
  landscape: true,        // Horizontal (karena tabel lebar, banyak kolom)
  printBackground: true,  // Cetak warna background (header biru, zebra striping)
  margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
});
```
- `setContent(html)` → seperti mengetik HTML di browser, Chrome render-nya
- `waitUntil: 'networkidle0'` → tunggu sampai tidak ada network request (memastikan semua selesai di-render)
- `page.pdf()` → Chrome "print to PDF" halaman tersebut → return Buffer (binary data)
- `landscape: true` → karena tabel karyawan punya 8 kolom, lebih cocok horizontal

**5. Stream PDF langsung ke browser user:**
```javascript
res.writeHead(200, {
  'Content-Type': 'application/pdf',                              // Tipe file: PDF
  'Content-Disposition': 'attachment; filename=employees_report.pdf',  // Force download
  'Content-Length': pdfBuffer.length,                              // Ukuran file
  'Cache-Control': 'no-cache',                                    // Jangan cache
});
res.end(pdfBuffer);  // Kirim binary PDF ke browser
```
- `Content-Disposition: attachment` → browser akan **download** file, bukan menampilkan di tab
- `filename=employees_report.pdf` → nama file saat di-download
- PDF dikirim langsung dari memory ke browser → **tidak disimpan di server** (hemat disk)

**6. Cleanup dengan try/finally:**
```javascript
try {
  // ... generate PDF ...
} finally {
  await browser.close();  // SELALU tutup browser, meskipun terjadi error
}
```
- `finally` block **pasti dijalankan** baik sukses maupun error
- Jika tidak ditutup → proses Chrome tetap jalan di background → memory leak
- Setiap request export PDF: buka Chrome → generate → tutup Chrome

**Alur lengkap:**
```
User klik "Export PDF"
→ Route GET /employees/export/pdf
→ Controller ambil semua data karyawan dari DB
→ generatePDFStream(employees, res)
→ Bangun HTML string dengan data
→ Launch Chrome headless
→ Render HTML di Chrome
→ Chrome "print" ke PDF (buffer)
→ Stream buffer ke response HTTP
→ Browser user download file PDF
→ Chrome ditutup
```

---

### 10. `routes/employeeRoutes.js` — Middleware Chain di Route

```javascript
router.get('/', isAuthenticated, employeeController.index);
router.get('/create', isAuthenticated, isAdmin, employeeController.showCreate);
router.post('/', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), employeeController.create);

// Export routes MUST be before /:id
router.get('/export/excel', isAuthenticated, async (req, res) => { /* ... */ });
router.get('/export/pdf', isAuthenticated, async (req, res) => { /* ... */ });

router.get('/:id', isAuthenticated, employeeController.show);
router.get('/:id/edit', isAuthenticated, isAdmin, employeeController.showEdit);
router.post('/:id', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), employeeController.update);
router.post('/:id/delete', isAuthenticated, isAdmin, employeeController.delete);
```

**Cara kerja detail:**

File ini mendefinisikan **semua URL yang berhubungan dengan karyawan** dan menentukan siapa yang boleh mengaksesnya serta middleware apa yang dijalankan.

**1. Konsep Middleware Chain:**
```javascript
router.post('/', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), employeeController.create);
//              ───────────────  ───────  ─────────────────────────────────────  ─────────────────────────
//              Middleware #1    Mid #2   Middleware #3                           Handler terakhir
```
- Express menjalankan middleware **dari kiri ke kanan** secara berurutan
- Setiap middleware harus panggil `next()` untuk lanjut ke middleware berikutnya
- Jika salah satu middleware **tidak** panggil `next()` (misal redirect), yang setelahnya **tidak dijalankan**
- Ini seperti pos pemeriksaan: harus lolos semua checkpoint sebelum sampai tujuan

**Contoh alur untuk `POST /employees` (tambah karyawan):**
```
Request masuk
→ isAuthenticated: sudah login? 
  ├─ Ya → next() → lanjut
  └─ Tidak → redirect /auth/login (BERHENTI, isAdmin tidak dijalankan)
→ isAdmin: role Admin?
  ├─ Ya → next() → lanjut
  └─ Tidak → redirect /dashboard (BERHENTI, upload tidak dijalankan)
→ photoUpload.single('profile_photo'): proses upload file
  ├─ File valid → next() → lanjut (file tersimpan, info di req.file)
  └─ File invalid → throw Error (ditangkap error handler di app.js)
→ employeeController.create: simpan data ke database
```

**2. Perbedaan akses per-route:**

| Route | Middleware | Siapa yang bisa akses |
|-------|-----------|----------------------|
| `GET /` (list) | isAuthenticated | Semua user login (Admin + Employee) |
| `GET /create` | isAuthenticated + isAdmin | Hanya Admin |
| `POST /` (simpan) | isAuthenticated + isAdmin + photoUpload | Hanya Admin |
| `GET /:id` (detail) | isAuthenticated | Semua user login |
| `POST /:id/delete` | isAuthenticated + isAdmin | Hanya Admin |

**3. Kenapa export routes HARUS sebelum `/:id`?**
```javascript
// ✅ BENAR - export dulu, baru :id
router.get('/export/excel', ...);  // URL: /employees/export/excel
router.get('/export/pdf', ...);    // URL: /employees/export/pdf
router.get('/:id', ...);           // URL: /employees/123

// ❌ SALAH - jika :id dulu
router.get('/:id', ...);           // URL: /employees/export → id = "export" ❌
router.get('/export/excel', ...);  // Tidak pernah tercapai!
```
- Express mencocokkan route **dari atas ke bawah** (first match wins)
- `/:id` adalah **wildcard** — cocok dengan APAPUN: `/employees/123`, `/employees/export`, `/employees/abc`
- Jika `/:id` di atas, URL `/employees/export/excel` akan ditangkap sebagai `id = "export"` → error
- Solusi: letakkan route spesifik (`/export/excel`) **sebelum** route wildcard (`/:id`)

**4. Method HTTP dan maknanya:**
```javascript
router.get('/', ...);           // GET = ambil/tampilkan data (read-only)
router.post('/', ...);          // POST = kirim data baru (create)
router.post('/:id', ...);      // POST = update data yang sudah ada
router.post('/:id/delete', ...); // POST = hapus data
```
- Kenapa delete pakai POST bukan DELETE? Karena HTML form hanya support GET dan POST
- Untuk REST API murni biasanya pakai PUT/DELETE, tapi untuk form HTML ini lebih pragmatis

**5. `photoUpload.single('profile_photo')`:**
- `.single('profile_photo')` → terima tepat 1 file dari field bernama `profile_photo`
- Nama field harus cocok dengan `<input type="file" name="profile_photo">` di HTML
- Jika form tidak ada file (opsional saat edit), `req.file` akan `undefined` (tidak error)

---

### 11. `app.js` — Session Configuration

```javascript
app.use(session({
  key: 'connect.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,          // MySQL store (persistent)
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000, httpOnly: true }, // 1 jam
}));
```

**Cara kerja detail:**

Session adalah mekanisme untuk "mengingat" user antar request. HTTP itu **stateless** (setiap request independen, server tidak tahu siapa yang kirim). Session mengatasi ini dengan menyimpan data user di server dan mengirim "kunci" (session ID) ke browser via cookie.

**1. `key: 'connect.sid'`** — Nama cookie yang dikirim ke browser.
- Browser menyimpan cookie: `connect.sid = abc123xyz...`
- Setiap request, browser otomatis kirim cookie ini ke server
- Server pakai nilai cookie untuk mencari data session di database

**2. `secret: process.env.SESSION_SECRET`** — Kunci rahasia untuk **menandatangani** (sign) cookie.
- Cookie di-sign agar tidak bisa dipalsukan
- Jika seseorang mengubah nilai cookie, signature tidak cocok → session ditolak
- Secret harus random dan panjang (64+ karakter) → disimpan di `.env`

**3. `store: sessionStore`** — Di mana data session disimpan.
```javascript
const sessionStore = new MySQLStore({}, pool);
```
- Data session disimpan di **tabel `sessions` di MySQL**, bukan di RAM server
- Keuntungan:
  - Server restart → session tetap ada (user tidak perlu login ulang)
  - Bisa scale ke multiple server (semua server baca session dari DB yang sama)
  - Session otomatis dihapus saat expired (MySQL Store handle cleanup)
- Jika pakai default (MemoryStore): session hilang saat server restart, memory leak di production

**4. `resave: false`** — Jangan simpan ulang session yang tidak berubah.
- Tanpa ini: setiap request, session ditulis ulang ke database (meskipun tidak ada perubahan)
- Dengan `false`: hanya tulis ke DB jika ada perubahan (misal `req.session.user = {...}`)
- Menghemat query database → performa lebih baik

**5. `saveUninitialized: false`** — Jangan buat session untuk visitor yang belum login.
- Tanpa ini: setiap orang yang buka halaman login langsung dapat session (meskipun belum login)
- Dengan `false`: session baru dibuat **hanya saat ada data yang perlu disimpan** (misal setelah login)
- Menghemat storage database → tidak penuh dengan session kosong

**6. `cookie: { maxAge: 3600000, httpOnly: true }`** — Konfigurasi cookie session.
- `maxAge: 3600000` → cookie (dan session) expire setelah **3.600.000 milidetik = 1 jam**
  - Setelah 1 jam tanpa aktivitas → session dianggap expired
  - User harus login ulang (kecuali ada remember_token)
  - Ini untuk keamanan: jika user lupa logout di komputer publik, session otomatis mati
- `httpOnly: true` → cookie **tidak bisa diakses oleh JavaScript** di browser
  - `document.cookie` tidak akan menampilkan session cookie
  - Mencegah serangan XSS: meskipun attacker inject script, tidak bisa mencuri session ID

**Alur session lengkap:**
```
1. User login berhasil
   → Server: req.session.user = {id: 1, username: 'admin', role: 'Admin'}
   → Server simpan ke MySQL: sessions table (session_id, data, expires)
   → Server kirim cookie: Set-Cookie: connect.sid=signed_session_id

2. User buka halaman /dashboard
   → Browser kirim cookie: Cookie: connect.sid=signed_session_id
   → Server verifikasi signature cookie
   → Server cari session di MySQL berdasarkan session_id
   → Server set req.session = data dari database
   → Middleware isAuthenticated cek req.session.user → ada → next()

3. Setelah 1 jam tanpa aktivitas
   → Cookie expired → browser hapus cookie
   → Session di MySQL juga expired → dihapus oleh cleanup job
   → Request berikutnya tidak ada cookie → isAuthenticated redirect ke login

4. User logout
   → req.session.destroy() → hapus session dari MySQL
   → res.clearCookie('remember_token') → hapus remember cookie
   → Redirect ke /auth/login
```

**Flash message middleware (tepat setelah session config):**
```javascript
app.use((req, res, next) => {
  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;
  delete req.session.error;
  delete req.session.success;
  next();
});
```
- `res.locals` → variabel yang bisa diakses di semua template EJS
- Pesan error/success dibaca dari session → disimpan ke locals → **langsung dihapus dari session**
- Efeknya: pesan hanya muncul **1 kali** (flash message pattern)
- Contoh: setelah login gagal, pesan "CAPTCHA salah" muncul sekali, refresh → hilang

---

## Urutan Rekomendasi Saat Presentasi

| No | File | Durasi | Fokus Penjelasan |
|----|------|--------|-----------------|
| 1 | `config/database.js` | 30 detik | Connection pool & env vars |
| 2 | `utils/captcha.js` | 20 detik | CAPTCHA sederhana tapi efektif |
| 3 | `middleware/auth.js` | 45 detik | Auth flow + remember me |
| 4 | `middleware/role.js` | 15 detik | RBAC sederhana |
| 5 | `controllers/authController.js` (login) | 1 menit | Login flow 8 langkah |
| 6 | `models/Employee.js` (findAll) | 45 detik | Search + pagination + prepared statements |
| 7 | `routes/employeeRoutes.js` | 30 detik | Middleware chain + route ordering |
| 8 | `middleware/upload.js` | 30 detik | File validation |
| 9 | `utils/pdfGenerator.js` | 30 detik | Puppeteer PDF stream to response |

**Total: ~5 menit** untuk code walkthrough, sisanya untuk demo live.

---

## Tips Presentasi

1. **Jangan baca kode baris per baris** — jelaskan konsep/pattern, tunjuk bagian penting
2. **Highlight keyword**: prepared statements, bcrypt, middleware chain, connection pool
3. **Hubungkan ke keamanan**: "kenapa pakai `?` bukan string concat? → anti SQL injection"
4. **Demo live setelah code walkthrough** → audiens sudah paham apa yang terjadi di balik layar
q