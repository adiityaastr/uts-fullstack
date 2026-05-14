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

**Poin penjelasan:**
- Menggunakan **connection pool** (bukan single connection) → efisien untuk multiple request
- `mysql2/promise` → support async/await, lebih clean dari callback
- Credential dari `.env` → tidak hardcode di source code (keamanan)
- `connectionLimit: 10` → maksimal 10 koneksi simultan ke database

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

**Poin penjelasan:**
- **3 layer pengecekan**: session aktif → remember token → redirect login
- Jika session expired tapi cookie remember_token masih ada → auto-restore session
- Pattern middleware Express: `(req, res, next)` → lanjut atau redirect

---

### 3. `middleware/role.js` — Role-Based Access Control

```javascript
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'Admin') return next();
  req.session.error = 'Akses ditolak. Hanya Admin yang dapat mengakses halaman ini.';
  res.redirect('/dashboard');
}
```

**Poin penjelasan:**
- Middleware sederhana tapi efektif → cek role dari session
- Digunakan di route: `router.post('/', isAuthenticated, isAdmin, controller.create)`
- Chain middleware: auth dulu → baru cek role → baru jalankan controller

---

### 4. `utils/captcha.js` — Custom Math CAPTCHA

```javascript
function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b, a, b };
}
```

**Poin penjelasan:**
- CAPTCHA sederhana tapi efektif mencegah brute-force bot
- Answer disimpan di `req.session.captchaAnswer` (server-side) → tidak bisa di-bypass dari client
- Soal berubah setiap kali halaman login di-load

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

**Poin penjelasan:**
- Login flow 8 langkah: CAPTCHA → find user → cek status → verify password → JWT → session → last login → remember me
- `bcrypt.compare()` → membandingkan plain text dengan hash (one-way, aman)
- `crypto.randomBytes(32)` → token random 256-bit (tidak bisa ditebak)
- Cookie `httpOnly: true` + `sameSite: 'lax'` → anti XSS & CSRF
- `delete req.session.captchaAnswer` → bersihkan CAPTCHA setelah login sukses

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

**Poin penjelasan:**
- **Prepared statements** (`?` placeholder) → anti SQL injection
- Search multi-kolom: nama, email, divisi, status sekaligus
- Pattern `conditions[]` → mudah ditambah filter baru (extensible)
- Pagination: `LIMIT ? OFFSET ?` → hanya ambil data yang ditampilkan
- Return metadata: total, page, totalPages → untuk render pagination UI

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

**Poin penjelasan:**
- Insert per-row (bukan batch) → jika 1 row gagal, yang lain tetap masuk
- Duplikat kode karyawan otomatis ter-catch oleh UNIQUE constraint
- Return statistik: berapa berhasil, berapa gagal, kode mana yang duplikat
- User mendapat feedback detail setelah import

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

**Poin penjelasan:**
- **3 layer validasi**: storage config + size limit + file type filter
- `fileFilter` reject file sebelum disimpan ke disk → hemat storage
- Error di-handle di `app.js` error handler → redirect dengan pesan error
- Filename: `Date.now() + extension` → unik, tidak bentrok
- Folder otomatis dibuat jika belum ada (`fs.mkdirSync` dengan `recursive: true`)

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

**Poin penjelasan:**
- Puppeteer = headless Chrome → render HTML persis seperti di browser
- Keuntungan: bisa pakai CSS biasa untuk styling PDF (tabel, warna, font)
- `--no-sandbox` → diperlukan untuk Docker/Linux environment
- `try/finally` → memastikan browser selalu ditutup meskipun error
- Stream langsung ke response → tidak perlu simpan file temporary

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

**Poin penjelasan:**
- Setiap route punya **middleware chain** yang berbeda sesuai kebutuhan
- `GET /` → semua user authenticated bisa lihat list
- `POST /` → hanya Admin + harus authenticated + upload foto
- Export routes **harus sebelum** `/:id` → agar tidak tertangkap sebagai parameter id
- Pattern: GET (read), POST (create/update/delete) — bukan REST murni tapi pragmatis untuk form HTML

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

**Poin penjelasan:**
- `store: sessionStore` → session disimpan di MySQL, bukan RAM
- `maxAge: 3600000` → session expire setelah 1 jam (keamanan)
- `httpOnly: true` → cookie tidak bisa diakses via JavaScript
- `resave: false` → tidak save ulang session yang tidak berubah (performa)

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