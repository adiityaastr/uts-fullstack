# UTS Employee Management System - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fullstack Node.js employee management app with JWT auth, session, CRUD, search/pagination, dashboard, and additional features (CAPTCHA, forgot-password, export PDF/Excel, dark mode, role permission).

**Architecture:** Monolithic Express.js + EJS app using Dasher Bootstrap 5 Admin Template. MySQL with manual queries. express-session + JWT dual auth. Models with raw SQL parameterized queries.

**Tech Stack:** Node.js, Express.js, EJS, MySQL (mysql2), bcrypt, jsonwebtoken, express-session, express-mysql-session, multer, xlsx, exceljs, puppeteer, Bootstrap 5.3 (Dasher template)

---

## Phase 1: Project Setup

### Task 1: Initialize Project & Install Dependencies

**Files:**
- Create: `package.json`
- Create: `.env`
- Create: `.gitignore`

- [ ] **Step 1: Initialize package.json**

```bash
cd D:\web_uts_fullstack && npm init -y
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install express ejs mysql2 bcrypt jsonwebtoken express-session express-mysql-session multer xlsx exceljs puppeteer dotenv
```

- [ ] **Step 3: Create .env file**

Write `D:\web_uts_fullstack\.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=uts_employee_db
JWT_SECRET=uts_jwt_secret_key_2026
SESSION_SECRET=uts_session_secret_key_2026
PORT=3000
```

- [ ] **Step 4: Create .gitignore**

Write `D:\web_uts_fullstack\.gitignore`:
```
node_modules/
.env
uploads/
.DS_Store
```

---

### Task 2: Setup MySQL Database Connection

**Files:**
- Create: `config/database.js`

- [ ] **Step 1: Create MySQL connection pool**

Write `D:\web_uts_fullstack\config\database.js`:
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

---

### Task 3: Create SQL Dump File

**Files:**
- Create: `411231139_muhamad_aditya_saputra.sql`

- [ ] **Step 1: Write SQL dump**

Write `D:\web_uts_fullstack\411231139_muhamad_aditya_saputra.sql`:
```sql
-- NIM: 411231139
-- Nama: Muhamad Aditya Saputra
-- UTS Employee Management System - PT Digital Nusantara

CREATE DATABASE IF NOT EXISTS uts_employee_db;
USE uts_employee_db;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  gender ENUM('Male','Female') NOT NULL,
  birth_date DATE,
  email VARCHAR(100),
  phone_number VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(10),
  division VARCHAR(100),
  position VARCHAR(100),
  salary DECIMAL(12,2),
  join_date DATE,
  employment_status ENUM('Active','Inactive','Resigned') DEFAULT 'Active',
  profile_photo VARCHAR(255),
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  education VARCHAR(100),
  marital_status ENUM('Single','Married'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin','Employee') DEFAULT 'Employee',
  status ENUM('Active','Inactive') DEFAULT 'Active',
  remember_token VARCHAR(255),
  last_login DATETIME,
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  expires INT NOT NULL,
  data TEXT
);

-- Default admin user (password: admin123)
INSERT INTO users (username, email, password, role, status) VALUES
('admin', 'admin@uts.com', '$2b$10$placeholder_hash_will_be_regenerated', 'Admin', 'Active');
```

---

## Phase 2: Core Express App

### Task 4: Create Express App Entry Point

**Files:**
- Create: `app.js`
- Create: `server.js`

- [ ] **Step 1: Write app.js**

Write `D:\web_uts_fullstack\app.js`:
```javascript
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');

const app = express();

const sessionStore = new MySQLStore({}, pool);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  key: 'connect.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000,
    httpOnly: true,
  },
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;
  delete req.session.error;
  delete req.session.success;
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.redirect('/auth/login');
});

module.exports = app;
```

- [ ] **Step 2: Write server.js**

Write `D:\web_uts_fullstack\server.js`:
```javascript
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

### Task 5: Create Auth Middleware

**Files:**
- Create: `middleware/auth.js`
- Create: `middleware/role.js`
- Create: `middleware/upload.js`

- [ ] **Step 1: Write auth middleware**

Write `D:\web_uts_fullstack\middleware\auth.js`:
```javascript
const jwt = require('jsonwebtoken');
require('dotenv').config();

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  req.session.error = 'Silakan login terlebih dahulu';
  res.redirect('/auth/login');
}

function isAuthenticatedAPI(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { isAuthenticated, isAuthenticatedAPI };
```

- [ ] **Step 2: Write role middleware**

Write `D:\web_uts_fullstack\middleware\role.js`:
```javascript
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'Admin') return next();
  req.session.error = 'Akses ditolak. Hanya Admin yang dapat mengakses halaman ini.';
  res.redirect('/dashboard');
}

module.exports = { isAdmin };
```

- [ ] **Step 3: Write upload middleware**

Write `D:\web_uts_fullstack\middleware\upload.js`:
```javascript
const multer = require('multer');
const path = require('path');

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/photos/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/excels/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) cb(null, true);
    else cb(new Error('Hanya file JPG dan PNG yang diizinkan'));
  },
});

const excelUpload = multer({
  storage: excelStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls', '.csv'].includes(ext)) cb(null, true);
    else cb(new Error('Hanya file Excel/CSV yang diizinkan'));
  },
});

module.exports = { photoUpload, excelUpload };
```

- [ ] **Step 4: Create upload directories**

```bash
New-Item -ItemType Directory -Path "D:\web_uts_fullstack\uploads\photos" -Force && New-Item -ItemType Directory -Path "D:\web_uts_fullstack\uploads\excels" -Force
```

---

## Phase 3: Models

### Task 6: Create Employee Model

**Files:**
- Create: `models/Employee.js`

- [ ] **Step 1: Write Employee model**

Write `D:\web_uts_fullstack\models\Employee.js`:
```javascript
const pool = require('../config/database');

const Employee = {
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
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(
      `INSERT INTO employees (${fields}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  },

  async update(id, data) {
    const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const [result] = await pool.execute(
      `UPDATE employees SET ${sets} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async bulkCreate(rows) {
    const fields = Object.keys(rows[0]).join(', ');
    const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
    const sql = `INSERT INTO employees (${fields}) VALUES (${placeholders})`;
    let inserted = 0;
    for (const row of rows) {
      try {
        await pool.execute(sql, Object.values(row));
        inserted++;
      } catch {}
    }
    return inserted;
  },

  async countByStatus(status) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM employees WHERE employment_status = ?', [status]
    );
    return rows[0].total;
  },

  async countAll() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM employees');
    return rows[0].total;
  },

  async countDivisions() {
    const [rows] = await pool.execute('SELECT COUNT(DISTINCT division) AS total FROM employees');
    return rows[0].total;
  },

  async getByDivision() {
    const [rows] = await pool.execute(
      'SELECT division, COUNT(*) AS total FROM employees GROUP BY division'
    );
    return rows;
  },

  async getByStatus() {
    const [rows] = await pool.execute(
      'SELECT employment_status AS status, COUNT(*) AS total FROM employees GROUP BY employment_status'
    );
    return rows;
  },

  async getAllForExport() {
    const [rows] = await pool.execute('SELECT * FROM employees ORDER BY created_at DESC');
    return rows;
  },
};

module.exports = Employee;
```

---

### Task 7: Create User Model

**Files:**
- Create: `models/User.js`

- [ ] **Step 1: Write User model**

Write `D:\web_uts_fullstack\models\User.js`:
```javascript
const pool = require('../config/database');

const User = {
  async findByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findAll({ search, page = 1, limit = 10 }) {
    let sql = 'SELECT u.*, e.full_name AS employee_name FROM users u LEFT JOIN employees e ON u.employee_id = e.id';
    let countSql = 'SELECT COUNT(*) AS total FROM users';
    const params = [];
    const conditions = [];

    if (search) {
      const s = `%${search}%`;
      conditions.push('(u.username LIKE ? OR u.email LIKE ? OR e.full_name LIKE ?)');
      params.push(s, s, s);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
      countSql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    const allParams = [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)];

    const [rows] = await pool.execute(sql, allParams);
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;

    return { rows, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
  },

  async create(data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const [result] = await pool.execute(
      `INSERT INTO users (${fields}) VALUES (${placeholders})`,
      Object.values(data)
    );
    return result.insertId;
  },

  async update(id, data) {
    const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const [result] = await pool.execute(
      `UPDATE users SET ${sets} WHERE id = ?`,
      [...Object.values(data), id]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async updateLastLogin(id) {
    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  },

  async findByResetToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  async countAll() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    return rows[0].total;
  },

  async getEmployeesWithoutUser() {
    const [rows] = await pool.execute(
      `SELECT e.id, e.full_name, e.employee_code 
       FROM employees e 
       LEFT JOIN users u ON e.id = u.employee_id 
       WHERE u.id IS NULL`
    );
    return rows;
  },
};

module.exports = User;
```

---

## Phase 4: Authentication System

### Task 8: Create CAPTCHA Utility

**Files:**
- Create: `utils/captcha.js`

- [ ] **Step 1: Write CAPTCHA utility**

Write `D:\web_uts_fullstack\utils\captcha.js`:
```javascript
function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return {
    question: `${a} + ${b} = ?`,
    answer: a + b,
    a,
    b,
  };
}

module.exports = { generateCaptcha };
```

---

### Task 9: Create Auth Controller

**Files:**
- Create: `controllers/authController.js`

- [ ] **Step 1: Write auth controller**

Write `D:\web_uts_fullstack\controllers\authController.js`:
```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { generateCaptcha } = require('../utils/captcha');
require('dotenv').config();

const authController = {
  showLogin(req, res) {
    const captcha = generateCaptcha();
    req.session.captchaAnswer = captcha.answer;
    res.render('auth/login', { captcha, title: 'Login' });
  },

  async login(req, res) {
    try {
      const { username, password, captcha } = req.body;

      if (parseInt(captcha) !== req.session.captchaAnswer) {
        req.session.error = 'CAPTCHA salah. Silakan coba lagi.';
        return res.redirect('/auth/login');
      }

      const user = await User.findByUsername(username);
      if (!user) {
        req.session.error = 'Username atau password salah.';
        return res.redirect('/auth/login');
      }

      if (user.status === 'Inactive') {
        req.session.error = 'Akun Anda tidak aktif. Hubungi admin.';
        return res.redirect('/auth/login');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.session.error = 'Username atau password salah.';
        return res.redirect('/auth/login');
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      req.session.token = token;

      await User.updateLastLogin(user.id);

      if (req.body.remember) {
        const rememberToken = crypto.randomBytes(32).toString('hex');
        await User.update(user.id, { remember_token: rememberToken });
      }

      delete req.session.captchaAnswer;
      return res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      req.session.error = 'Terjadi kesalahan server.';
      res.redirect('/auth/login');
    }
  },

  showRegister(req, res) {
    User.getEmployeesWithoutUser().then(employees => {
      res.render('auth/register', { employees, title: 'Register' });
    });
  },

  async register(req, res) {
    try {
      const { username, email, password, employee_id, role } = req.body;

      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        req.session.error = 'Username sudah digunakan.';
        return res.redirect('/auth/register');
      }

      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        req.session.error = 'Email sudah digunakan.';
        return res.redirect('/auth/register');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        username,
        email,
        password: hashedPassword,
        employee_id: employee_id || null,
        role: role || 'Employee',
      });

      req.session.success = 'User berhasil didaftarkan.';
      res.redirect('/users');
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal mendaftarkan user.';
      res.redirect('/auth/register');
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  },

  showForgotPassword(req, res) {
    res.render('auth/forgot-password', { title: 'Lupa Password' });
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        req.session.error = 'Email tidak ditemukan.';
        return res.redirect('/auth/forgot-password');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000);

      await User.update(user.id, {
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires,
      });

      const resetLink = `/auth/reset/${resetToken}`;
      res.render('auth/forgot-password', {
        title: 'Lupa Password',
        resetLink,
        resetSent: true,
      });
    } catch (err) {
      console.error(err);
      req.session.error = 'Terjadi kesalahan.';
      res.redirect('/auth/forgot-password');
    }
  },

  showResetPassword(req, res) {
    User.findByResetToken(req.params.token).then(user => {
      if (!user) {
        req.session.error = 'Token tidak valid atau sudah kadaluarsa.';
        return res.redirect('/auth/forgot-password');
      }
      res.render('auth/reset-password', { title: 'Reset Password', token: req.params.token });
    });
  },

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findByResetToken(token);
      if (!user) {
        req.session.error = 'Token tidak valid atau sudah kadaluarsa.';
        return res.redirect('/auth/forgot-password');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.update(user.id, {
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      });

      req.session.success = 'Password berhasil direset. Silakan login.';
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal mereset password.';
      res.redirect('/auth/forgot-password');
    }
  },
};

module.exports = authController;
```

---

### Task 10: Create Auth Routes

**Files:**
- Create: `routes/authRoutes.js`

- [ ] **Step 1: Write auth routes**

Write `D:\web_uts_fullstack\routes\authRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/register', isAuthenticated, isAdmin, authController.showRegister);
router.post('/register', isAuthenticated, isAdmin, authController.register);
router.get('/logout', isAuthenticated, authController.logout);
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset/:token', authController.showResetPassword);
router.post('/reset/:token', authController.resetPassword);

module.exports = router;
```

- [ ] **Step 2: Wire routes in app.js**

Edit `D:\web_uts_fullstack\app.js` — add before `module.exports`:
```javascript
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);
```

---

## Phase 5: Views (EJS Templates from Dasher)

### Task 11: Setup Dasher Static Assets

**Files:**
- Copy from `dasher-1.0.0/src/assets` to `public/assets`
- Copy from `dasher-1.0.0/node_modules` needed libs

- [ ] **Step 1: Copy Dasher assets to public**

```powershell
Copy-Item -Path "D:\web_uts_fullstack\dasher-1.0.0\src\assets\*" -Destination "D:\web_uts_fullstack\public\assets\" -Recurse -Force
```

- [ ] **Step 2: Copy node_modules libs**

```powershell
New-Item -ItemType Directory -Path "D:\web_uts_fullstack\public\assets\libs" -Force
Copy-Item -Path "D:\web_uts_fullstack\dasher-1.0.0\node_modules\bootstrap\*" -Destination "D:\web_uts_fullstack\public\assets\libs\bootstrap\" -Recurse -Force
Copy-Item -Path "D:\web_uts_fullstack\dasher-1.0.0\node_modules\@popperjs\*" -Destination "D:\web_uts_fullstack\public\assets\libs\@popperjs\" -Recurse -Force
Copy-Item -Path "D:\web_uts_fullstack\dasher-1.0.0\node_modules\@tabler\*" -Destination "D:\web_uts_fullstack\public\assets\libs\@tabler\" -Recurse -Force
Copy-Item -Path "D:\web_uts_fullstack\dasher-1.0.0\node_modules\simplebar\*" -Destination "D:\web_uts_fullstack\public\assets\libs\simplebar\" -Recurse -Force
Copy-Item -Path "D:\web_uts_fullstack\dasher-1.0.0\node_modules\apexcharts\*" -Destination "D:\web_uts_fullstack\public\assets\libs\apexcharts\" -Recurse -Force
Copy-Item -Path "D:\web_uts_fullstack\dasher-1.0.0\node_modules\swiper\*" -Destination "D:\web_uts_fullstack\public\assets\libs\swiper\" -Recurse -Force
Copy-Item -Path "D:\web_uts_fullstack\dasher-1.0.0\node_modules\choices.js\*" -Destination "D:\web_uts_fullstack\public\assets\libs\choices.js\" -Recurse -Force
Copy-Item -Path "D:\web_uts_fullstack\dasher-1.0.0\node_modules\jsvectormap\*" -Destination "D:\web_uts_fullstack\public\assets\libs\jsvectormap\" -Recurse -Force
```

---

### Task 12: Create Layout Partials (EJS)

**Files:**
- Create: `views/partials/header.ejs`
- Create: `views/partials/scripts.ejs`
- Create: `views/partials/sidebar.ejs`
- Create: `views/partials/topbar.ejs`
- Create: `views/partials/footer.ejs`
- Create: `views/partials/alert.ejs`

- [ ] **Step 1: Write header.ejs**

Write `D:\web_uts_fullstack\views\partials\header.ejs`:
```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof title !== 'undefined' ? title + ' | ' : '' %>PT Digital Nusantara</title>
  <link rel="stylesheet" href="/assets/libs/bootstrap/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="/assets/libs/@tabler/icons-webfont/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/libs/choices.js/public/assets/styles/choices.min.css">
  <link rel="stylesheet" href="/assets/libs/simplebar/dist/simplebar.min.css">
</head>
<body>
<div id="miniSidebar">
  <div class="brand-logo p-4">
    <a href="/dashboard" class="d-flex align-items-center gap-2 text-decoration-none">
      <span class="fw-bold fs-4 text-primary">PT Digital Nusantara</span>
    </a>
  </div>
  <%- include('sidebar') %>
</div>
<div id="content" class="position-relative">
  <%- include('topbar') %>
  <div class="custom-container p-4">
    <%- include('alert') %>
```

- [ ] **Step 2: Write scripts.ejs**

Write `D:\web_uts_fullstack\views\partials\scripts.ejs`:
```html
  </div>
</div>
<script src="/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
<script src="/assets/libs/simplebar/dist/simplebar.min.js"></script>
<script src="/assets/libs/apexcharts/dist/apexcharts.min.js"></script>
<script src="/assets/js/theme.js" type="module"></script>
<script>
  document.getElementById('darkModeToggle')?.addEventListener('click', function() {
    const html = document.documentElement;
    const theme = html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  });

  (function() {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-bs-theme', saved);
  })();
</script>
</body>
</html>
```

- [ ] **Step 3: Write sidebar.ejs**

Write `D:\web_uts_fullstack\views\partials\sidebar.ejs`:
```html
<ul class="navbar-nav flex-column mt-2">
  <li class="nav-item">
    <a class="nav-link <%= currentPage === 'dashboard' ? 'active' : '' %>" href="/dashboard">
      <span class="nav-icon"><i class="ti ti-dashboard"></i></span>
      <span class="text">Dashboard</span>
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link <%= currentPage === 'employees' ? 'active' : '' %>" href="/employees">
      <span class="nav-icon"><i class="ti ti-users"></i></span>
      <span class="text">Karyawan</span>
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link <%= currentPage === 'users' ? 'active' : '' %>" href="/users">
      <span class="nav-icon"><i class="ti ti-user-shield"></i></span>
      <span class="text">Users</span>
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link <%= currentPage === 'upload' ? 'active' : '' %>" href="/upload">
      <span class="nav-icon"><i class="ti ti-file-upload"></i></span>
      <span class="text">Upload Excel</span>
    </a>
  </li>
  <li class="nav-item mt-4">
    <hr class="mx-3">
  </li>
  <li class="nav-item">
    <a class="nav-link" href="/auth/logout">
      <span class="nav-icon"><i class="ti ti-logout"></i></span>
      <span class="text">Logout</span>
    </a>
  </li>
</ul>
```

- [ ] **Step 4: Write topbar.ejs**

Write `D:\web_uts_fullstack\views\partials\topbar.ejs`:
```html
<nav class="navbar navbar-expand bg-body-tertiary border-bottom px-3">
  <div class="container-fluid">
    <span class="navbar-text fw-semibold">Employee Management System</span>
    <div class="d-flex align-items-center gap-3 ms-auto">
      <button id="darkModeToggle" class="btn btn-sm btn-outline-secondary" title="Toggle Dark Mode">
        <i class="ti ti-moon"></i>
      </button>
      <% if (locals.user) { %>
      <div class="dropdown">
        <button class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
          <i class="ti ti-user-circle me-1"></i><%= user.username %>
          <span class="badge bg-primary ms-1"><%= user.role %></span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="/auth/logout"><i class="ti ti-logout me-1"></i>Logout</a></li>
        </ul>
      </div>
      <% } %>
    </div>
  </div>
</nav>
```

- [ ] **Step 5: Write footer.ejs** (empty - just closing tags handled by scripts.ejs)

Write `D:\web_uts_fullstack\views\partials\footer.ejs`:
```html
<!-- footer content if needed -->
```

- [ ] **Step 6: Write alert.ejs**

Write `D:\web_uts_fullstack\views\partials\alert.ejs`:
```html
<% if (locals.success) { %>
<div class="alert alert-success alert-dismissible fade show" role="alert">
  <%= success %><button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<% } %>
<% if (locals.error) { %>
<div class="alert alert-danger alert-dismissible fade show" role="alert">
  <%= error %><button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<% } %>
```

---

### Task 13: Create Auth Views

**Files:**
- Create: `views/auth/login.ejs`
- Create: `views/auth/register.ejs`
- Create: `views/auth/forgot-password.ejs`
- Create: `views/auth/reset-password.ejs`

- [ ] **Step 1: Write login.ejs**

Write `D:\web_uts_fullstack\views\auth\login.ejs`:
```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | PT Digital Nusantara</title>
  <link rel="stylesheet" href="/assets/libs/bootstrap/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="/assets/libs/@tabler/icons-webfont/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-light d-flex align-items-center justify-content-center min-vh-100">
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-5 col-lg-4">
      <div class="text-center mb-4">
        <h3 class="fw-bold">PT Digital Nusantara</h3>
        <p class="text-muted">Employee Management System</p>
      </div>
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h5 class="card-title text-center mb-4">Login</h5>
          <% if (locals.error) { %>
          <div class="alert alert-danger"><%= error %></div>
          <% } %>
          <% if (locals.success) { %>
          <div class="alert alert-success"><%= success %></div>
          <% } %>
          <form method="POST" action="/auth/login">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input type="text" name="username" class="form-control" required autofocus>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" name="password" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">CAPTCHA: <%= captcha.question %></label>
              <input type="number" name="captcha" class="form-control" required>
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" name="remember" class="form-check-input" id="remember">
              <label class="form-check-label" for="remember">Remember me</label>
            </div>
            <button type="submit" class="btn btn-primary w-100 mb-2">Login</button>
            <a href="/auth/forgot-password" class="d-block text-center">Lupa Password?</a>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
<script src="/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write register.ejs**

Write `D:\web_uts_fullstack\views\auth\register.ejs`:
```html
<%- include('../partials/header', { currentPage: 'users', title: 'Register User' }) %>
<div class="card">
  <div class="card-header">
    <h5 class="card-title mb-0">Register User Baru</h5>
  </div>
  <div class="card-body">
    <form method="POST" action="/auth/register">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Username</label>
          <input type="text" name="username" class="form-control" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input type="email" name="email" class="form-control" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Password</label>
          <input type="password" name="password" class="form-control" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Role</label>
          <select name="role" class="form-select">
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Karyawan (opsional)</label>
          <select name="employee_id" class="form-select">
            <option value="">-- Tidak ada --</option>
            <% employees.forEach(e => { %>
            <option value="<%= e.id %>"><%= e.full_name %> (<%= e.employee_code %>)</option>
            <% }) %>
          </select>
        </div>
      </div>
      <div class="mt-3">
        <button type="submit" class="btn btn-primary">Register</button>
        <a href="/users" class="btn btn-secondary">Kembali</a>
      </div>
    </form>
  </div>
</div>
<%- include('../partials/scripts') %>
```

- [ ] **Step 3: Write forgot-password.ejs**

Write `D:\web_uts_fullstack\views\auth\forgot-password.ejs`:
```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lupa Password | PT Digital Nusantara</title>
<link rel="stylesheet" href="/assets/libs/bootstrap/dist/css/bootstrap.min.css">
</head>
<body class="bg-light d-flex align-items-center justify-content-center min-vh-100">
<div class="container"><div class="row justify-content-center"><div class="col-md-5 col-lg-4">
<div class="card shadow-sm"><div class="card-body p-4">
<h5 class="card-title text-center mb-4">Lupa Password</h5>
<% if (locals.error) { %><div class="alert alert-danger"><%= error %></div><% } %>
<% if (locals.resetSent) { %>
<div class="alert alert-success">
  Link reset password telah dibuat:<br>
  <a href="<%= resetLink %>"><%= resetLink %></a>
</div>
<% } else { %>
<form method="POST" action="/auth/forgot-password">
  <div class="mb-3">
    <label class="form-label">Email</label>
    <input type="email" name="email" class="form-control" required>
  </div>
  <button type="submit" class="btn btn-primary w-100 mb-2">Kirim Link Reset</button>
  <a href="/auth/login" class="d-block text-center">Kembali ke Login</a>
</form>
<% } %>
</div></div></div></div></div>
<script src="/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
</body></html>
```

- [ ] **Step 4: Write reset-password.ejs**

Write `D:\web_uts_fullstack\views\auth\reset-password.ejs`:
```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Password | PT Digital Nusantara</title>
<link rel="stylesheet" href="/assets/libs/bootstrap/dist/css/bootstrap.min.css">
</head>
<body class="bg-light d-flex align-items-center justify-content-center min-vh-100">
<div class="container"><div class="row justify-content-center"><div class="col-md-5 col-lg-4">
<div class="card shadow-sm"><div class="card-body p-4">
<h5 class="card-title text-center mb-4">Reset Password</h5>
<% if (locals.error) { %><div class="alert alert-danger"><%= error %></div><% } %>
<form method="POST" action="/auth/reset/<%= token %>">
  <div class="mb-3">
    <label class="form-label">Password Baru</label>
    <input type="password" name="password" class="form-control" required minlength="6">
  </div>
  <button type="submit" class="btn btn-primary w-100">Reset Password</button>
</form>
</div></div></div></div></div>
<script src="/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
</body></html>
```

---

## Phase 6: Dashboard

### Task 14: Create Dashboard Controller & View

**Files:**
- Create: `controllers/dashboardController.js`
- Create: `routes/dashboardRoutes.js`
- Create: `views/dashboard/index.ejs`

- [ ] **Step 1: Write dashboard controller**

Write `D:\web_uts_fullstack\controllers\dashboardController.js`:
```javascript
const Employee = require('../models/Employee');
const User = require('../models/User');

const dashboardController = {
  async index(req, res) {
    try {
      const totalKaryawan = await Employee.countAll();
      const totalDivisi = await Employee.countDivisions();
      const totalUser = await User.countAll();
      const totalAktif = await Employee.countByStatus('Active');
      const byDivision = await Employee.getByDivision();
      const byStatus = await Employee.getByStatus();

      res.render('dashboard/index', {
        title: 'Dashboard',
        currentPage: 'dashboard',
        totalKaryawan,
        totalDivisi,
        totalUser,
        totalAktif,
        byDivision,
        byStatus,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },
};

module.exports = dashboardController;
```

- [ ] **Step 2: Write dashboard routes**

Write `D:\web_uts_fullstack\routes\dashboardRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, dashboardController.index);

module.exports = router;
```

- [ ] **Step 3: Write dashboard view**

Write `D:\web_uts_fullstack\views\dashboard\index.ejs`:
```html
<%- include('../partials/header', { currentPage: 'dashboard', title: 'Dashboard' }) %>
<div class="row g-4 mb-4">
  <div class="col-xl-3 col-md-6">
    <div class="card border-primary border-start border-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div><h6 class="text-muted mb-1">Total Karyawan</h6><h2 class="mb-0"><%= totalKaryawan %></h2></div>
          <span class="bg-primary rounded-circle p-3"><i class="ti ti-users text-white fs-4"></i></span>
        </div>
      </div>
    </div>
  </div>
  <div class="col-xl-3 col-md-6">
    <div class="card border-success border-start border-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div><h6 class="text-muted mb-1">Total Divisi</h6><h2 class="mb-0"><%= totalDivisi %></h2></div>
          <span class="bg-success rounded-circle p-3"><i class="ti ti-building text-white fs-4"></i></span>
        </div>
      </div>
    </div>
  </div>
  <div class="col-xl-3 col-md-6">
    <div class="card border-info border-start border-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div><h6 class="text-muted mb-1">Total User</h6><h2 class="mb-0"><%= totalUser %></h2></div>
          <span class="bg-info rounded-circle p-3"><i class="ti ti-user-shield text-white fs-4"></i></span>
        </div>
      </div>
    </div>
  </div>
  <div class="col-xl-3 col-md-6">
    <div class="card border-warning border-start border-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div><h6 class="text-muted mb-1">Data Aktif</h6><h2 class="mb-0"><%= totalAktif %></h2></div>
          <span class="bg-warning rounded-circle p-3"><i class="ti ti-check text-white fs-4"></i></span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="row g-4">
  <div class="col-md-6">
    <div class="card"><div class="card-header"><h5 class="card-title mb-0">Karyawan per Divisi</h5></div>
      <div class="card-body"><div id="chartDivision" style="min-height:320px;"></div></div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card"><div class="card-header"><h5 class="card-title mb-0">Karyawan per Status</h5></div>
      <div class="card-body"><div id="chartStatus" style="min-height:320px;"></div></div>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var divisionData = <%- JSON.stringify(byDivision) %>;
  var statusData = <%- JSON.stringify(byStatus) %>;

  new ApexCharts(document.querySelector('#chartDivision'), {
    chart: { type: 'donut', height: 320 },
    labels: divisionData.map(d => d.division),
    series: divisionData.map(d => d.total),
    legend: { position: 'bottom' },
  }).render();

  new ApexCharts(document.querySelector('#chartStatus'), {
    chart: { type: 'bar', height: 320 },
    xaxis: { categories: statusData.map(d => d.status) },
    series: [{ name: 'Total', data: statusData.map(d => d.total) }],
    colors: ['#0d6efd'],
  }).render();
});
</script>
<%- include('../partials/scripts') %>
```

- [ ] **Step 4: Wire dashboard routes in app.js**

Edit `D:\web_uts_fullstack\app.js` — add:
```javascript
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/dashboard', dashboardRoutes);
```

---

## Phase 7: Employee CRUD + Search + Pagination

### Task 15: Create Employee Controller

**Files:**
- Create: `controllers/employeeController.js`

- [ ] **Step 1: Write employee controller**

Write `D:\web_uts_fullstack\controllers\employeeController.js`:
```javascript
const Employee = require('../models/Employee');

const employeeController = {
  async index(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const data = await Employee.findAll({ search, page, limit });
      res.render('employees/index', {
        title: 'Data Karyawan',
        currentPage: 'employees',
        employees: data.rows,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        search: search || '',
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  showCreate(req, res) {
    res.render('employees/create', {
      title: 'Tambah Karyawan',
      currentPage: 'employees',
    });
  },

  async create(req, res) {
    try {
      const data = { ...req.body };
      if (req.file) data.profile_photo = '/uploads/photos/' + req.file.filename;
      delete data._method;
      await Employee.create(data);
      req.session.success = 'Data karyawan berhasil ditambahkan.';
      res.redirect('/employees');
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal menambahkan data karyawan.';
      res.redirect('/employees/create');
    }
  },

  async show(req, res) {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
        req.session.error = 'Karyawan tidak ditemukan.';
        return res.redirect('/employees');
      }
      res.render('employees/detail', {
        title: 'Detail Karyawan',
        currentPage: 'employees',
        employee,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  async showEdit(req, res) {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
        req.session.error = 'Karyawan tidak ditemukan.';
        return res.redirect('/employees');
      }
      res.render('employees/edit', {
        title: 'Edit Karyawan',
        currentPage: 'employees',
        employee,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  async update(req, res) {
    try {
      const data = { ...req.body };
      if (req.file) data.profile_photo = '/uploads/photos/' + req.file.filename;
      delete data._method;
      await Employee.update(req.params.id, data);
      req.session.success = 'Data karyawan berhasil diupdate.';
      res.redirect('/employees');
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal mengupdate data karyawan.';
      res.redirect('/employees/' + req.params.id + '/edit');
    }
  },

  async delete(req, res) {
    try {
      await Employee.delete(req.params.id);
      req.session.success = 'Data karyawan berhasil dihapus.';
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal menghapus data karyawan.';
    }
    res.redirect('/employees');
  },
};

module.exports = employeeController;
```

---

### Task 16: Create Employee Routes

**Files:**
- Create: `routes/employeeRoutes.js`

- [ ] **Step 1: Write employee routes**

Write `D:\web_uts_fullstack\routes\employeeRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const { photoUpload } = require('../middleware/upload');

router.get('/', isAuthenticated, employeeController.index);
router.get('/create', isAuthenticated, isAdmin, employeeController.showCreate);
router.post('/', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), employeeController.create);
router.get('/:id', isAuthenticated, employeeController.show);
router.get('/:id/edit', isAuthenticated, isAdmin, employeeController.showEdit);
router.post('/:id', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), employeeController.update);
router.post('/:id/delete', isAuthenticated, isAdmin, employeeController.delete);

module.exports = router;
```

- [ ] **Step 2: Wire employee routes in app.js**

Edit `D:\web_uts_fullstack\app.js` — add:
```javascript
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/employees', employeeRoutes);
```

---

### Task 17: Create Employee Views (List, Create, Edit, Detail)

**Files:**
- Create: `views/employees/index.ejs`
- Create: `views/employees/create.ejs`
- Create: `views/employees/edit.ejs`
- Create: `views/employees/detail.ejs`

- [ ] **Step 1: Write employees index.ejs (list with search + pagination)**

Write `D:\web_uts_fullstack\views\employees\index.ejs`:
```html
<%- include('../partials/header', { currentPage: 'employees', title: 'Data Karyawan' }) %>
<div class="d-flex justify-content-between align-items-center mb-3">
  <h5 class="mb-0">Data Karyawan</h5>
  <div class="d-flex gap-2">
    <a href="/employees/export/excel" class="btn btn-success btn-sm"><i class="ti ti-download me-1"></i>Export Excel</a>
    <a href="/employees/export/pdf" class="btn btn-danger btn-sm"><i class="ti ti-file-pdf me-1"></i>Export PDF</a>
    <a href="/employees/create" class="btn btn-primary btn-sm"><i class="ti ti-plus me-1"></i>Tambah</a>
  </div>
</div>

<form method="GET" action="/employees" class="row g-2 mb-3">
  <div class="col-md-4">
    <input type="text" name="search" class="form-control" placeholder="Cari nama, email, divisi, status..." value="<%= search %>">
  </div>
  <div class="col-auto">
    <button type="submit" class="btn btn-primary"><i class="ti ti-search me-1"></i>Cari</button>
    <a href="/employees" class="btn btn-secondary">Reset</a>
  </div>
</form>

<div class="card">
  <div class="table-responsive">
    <table class="table table-hover mb-0">
      <thead class="table-light">
        <tr>
          <th>#</th><th>Kode</th><th>Nama</th><th>Divisi</th><th>Jabatan</th><th>Status</th><th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <% if (employees.length === 0) { %>
        <tr><td colspan="7" class="text-center">Tidak ada data</td></tr>
        <% } %>
        <% employees.forEach((e, i) => { %>
        <tr>
          <td><% var offset = (page-1)*10; %><%= offset + i + 1 %></td>
          <td><%= e.employee_code %></td>
          <td><%= e.full_name %></td>
          <td><%= e.division %></td>
          <td><%= e.position %></td>
          <td>
            <span class="badge <%= e.employment_status === 'Active' ? 'bg-success' : e.employment_status === 'Inactive' ? 'bg-warning' : 'bg-danger' %>">
              <%= e.employment_status %>
            </span>
          </td>
          <td>
            <div class="btn-group btn-group-sm">
              <a href="/employees/<%= e.id %>" class="btn btn-info" title="Detail"><i class="ti ti-eye"></i></a>
              <a href="/employees/<%= e.id %>/edit" class="btn btn-warning" title="Edit"><i class="ti ti-edit"></i></a>
              <form method="POST" action="/employees/<%= e.id %>/delete" style="display:inline" onsubmit="return confirm('Hapus karyawan ini?')">
                <button class="btn btn-danger" title="Hapus"><i class="ti ti-trash"></i></button>
              </form>
            </div>
          </td>
        </tr>
        <% }) %>
      </tbody>
    </table>
  </div>
  <% if (totalPages > 1) { %>
  <div class="card-footer">
    <nav>
      <ul class="pagination justify-content-center mb-0">
        <% for (let p = 1; p <= totalPages; p++) { %>
        <li class="page-item <%= p === page ? 'active' : '' %>">
          <a class="page-link" href="?search=<%= search %>&page=<%= p %>"><%= p %></a>
        </li>
        <% } %>
      </ul>
    </nav>
    <small class="text-muted d-block text-center mt-1"><%= total %> total data</small>
  </div>
  <% } %>
</div>
<%- include('../partials/scripts') %>
```

- [ ] **Step 2: Write employees create.ejs (form 23 fields)**

Write `D:\web_uts_fullstack\views\employees\create.ejs`:
```html
<%- include('../partials/header', { currentPage: 'employees', title: 'Tambah Karyawan' }) %>
<div class="card">
  <div class="card-header"><h5 class="card-title mb-0">Tambah Karyawan</h5></div>
  <div class="card-body">
    <form method="POST" action="/employees" enctype="multipart/form-data">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label">Kode Karyawan</label><input type="text" name="employee_code" class="form-control" required></div>
        <div class="col-md-6"><label class="form-label">Nama Lengkap</label><input type="text" name="full_name" class="form-control" required></div>
        <div class="col-md-4"><label class="form-label">Jenis Kelamin</label><select name="gender" class="form-select"><option>Male</option><option>Female</option></select></div>
        <div class="col-md-4"><label class="form-label">Tanggal Lahir</label><input type="date" name="birth_date" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Pendidikan</label><input type="text" name="education" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Status Pernikahan</label><select name="marital_status" class="form-select"><option>Single</option><option>Married</option></select></div>
        <div class="col-md-4"><label class="form-label">Email</label><input type="email" name="email" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">No HP</label><input type="text" name="phone_number" class="form-control"></div>
        <div class="col-12"><label class="form-label">Alamat</label><textarea name="address" class="form-control" rows="2"></textarea></div>
        <div class="col-md-4"><label class="form-label">Kota</label><input type="text" name="city" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Provinsi</label><input type="text" name="province" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Kode Pos</label><input type="text" name="postal_code" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Divisi</label><input type="text" name="division" class="form-control" required></div>
        <div class="col-md-4"><label class="form-label">Jabatan</label><input type="text" name="position" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Gaji</label><input type="number" step="0.01" name="salary" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Tanggal Masuk</label><input type="date" name="join_date" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Status</label><select name="employment_status" class="form-select"><option>Active</option><option>Inactive</option><option>Resigned</option></select></div>
        <div class="col-md-4"><label class="form-label">Foto Profil</label><input type="file" name="profile_photo" class="form-control"></div>
        <div class="col-md-6"><label class="form-label">Kontak Darurat</label><input type="text" name="emergency_contact" class="form-control"></div>
        <div class="col-md-6"><label class="form-label">Telp Darurat</label><input type="text" name="emergency_phone" class="form-control"></div>
      </div>
      <div class="mt-3">
        <button type="submit" class="btn btn-primary"><i class="ti ti-save me-1"></i>Simpan</button>
        <a href="/employees" class="btn btn-secondary">Batal</a>
      </div>
    </form>
  </div>
</div>
<%- include('../partials/scripts') %>
```

- [ ] **Step 3: Write employees edit.ejs**

Write `D:\web_uts_fullstack\views\employees\edit.ejs`:
```html
<%- include('../partials/header', { currentPage: 'employees', title: 'Edit Karyawan' }) %>
<div class="card">
  <div class="card-header"><h5 class="card-title mb-0">Edit Karyawan</h5></div>
  <div class="card-body">
    <form method="POST" action="/employees/<%= employee.id %>" enctype="multipart/form-data">
      <input type="hidden" name="_method" value="PUT">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label">Kode Karyawan</label><input type="text" name="employee_code" class="form-control" value="<%= employee.employee_code %>" required></div>
        <div class="col-md-6"><label class="form-label">Nama Lengkap</label><input type="text" name="full_name" class="form-control" value="<%= employee.full_name %>" required></div>
        <div class="col-md-4"><label class="form-label">Jenis Kelamin</label><select name="gender" class="form-select"><option <%= employee.gender === 'Male' ? 'selected' : '' %>>Male</option><option <%= employee.gender === 'Female' ? 'selected' : '' %>>Female</option></select></div>
        <div class="col-md-4"><label class="form-label">Tanggal Lahir</label><input type="date" name="birth_date" class="form-control" value="<%= employee.birth_date ? employee.birth_date.toISOString().split('T')[0] : '' %>"></div>
        <div class="col-md-4"><label class="form-label">Pendidikan</label><input type="text" name="education" class="form-control" value="<%= employee.education || '' %>"></div>
        <div class="col-md-4"><label class="form-label">Status Pernikahan</label><select name="marital_status" class="form-select"><option <%= employee.marital_status === 'Single' ? 'selected' : '' %>>Single</option><option <%= employee.marital_status === 'Married' ? 'selected' : '' %>>Married</option></select></div>
        <div class="col-md-4"><label class="form-label">Email</label><input type="email" name="email" class="form-control" value="<%= employee.email || '' %>"></div>
        <div class="col-md-4"><label class="form-label">No HP</label><input type="text" name="phone_number" class="form-control" value="<%= employee.phone_number || '' %>"></div>
        <div class="col-12"><label class="form-label">Alamat</label><textarea name="address" class="form-control" rows="2"><%= employee.address || '' %></textarea></div>
        <div class="col-md-4"><label class="form-label">Kota</label><input type="text" name="city" class="form-control" value="<%= employee.city || '' %>"></div>
        <div class="col-md-4"><label class="form-label">Provinsi</label><input type="text" name="province" class="form-control" value="<%= employee.province || '' %>"></div>
        <div class="col-md-4"><label class="form-label">Kode Pos</label><input type="text" name="postal_code" class="form-control" value="<%= employee.postal_code || '' %>"></div>
        <div class="col-md-4"><label class="form-label">Divisi</label><input type="text" name="division" class="form-control" value="<%= employee.division || '' %>" required></div>
        <div class="col-md-4"><label class="form-label">Jabatan</label><input type="text" name="position" class="form-control" value="<%= employee.position || '' %>"></div>
        <div class="col-md-4"><label class="form-label">Gaji</label><input type="number" step="0.01" name="salary" class="form-control" value="<%= employee.salary || '' %>"></div>
        <div class="col-md-4"><label class="form-label">Tanggal Masuk</label><input type="date" name="join_date" class="form-control" value="<%= employee.join_date ? employee.join_date.toISOString().split('T')[0] : '' %>"></div>
        <div class="col-md-4"><label class="form-label">Status</label><select name="employment_status" class="form-select"><option <%= employee.employment_status === 'Active' ? 'selected' : '' %>>Active</option><option <%= employee.employment_status === 'Inactive' ? 'selected' : '' %>>Inactive</option><option <%= employee.employment_status === 'Resigned' ? 'selected' : '' %>>Resigned</option></select></div>
        <div class="col-md-4"><label class="form-label">Foto Profil</label><input type="file" name="profile_photo" class="form-control"><% if (employee.profile_photo) { %><small class="text-muted">File: <%= employee.profile_photo %></small><% } %></div>
        <div class="col-md-6"><label class="form-label">Kontak Darurat</label><input type="text" name="emergency_contact" class="form-control" value="<%= employee.emergency_contact || '' %>"></div>
        <div class="col-md-6"><label class="form-label">Telp Darurat</label><input type="text" name="emergency_phone" class="form-control" value="<%= employee.emergency_phone || '' %>"></div>
      </div>
      <div class="mt-3">
        <button type="submit" class="btn btn-primary"><i class="ti ti-save me-1"></i>Update</button>
        <a href="/employees" class="btn btn-secondary">Batal</a>
      </div>
    </form>
  </div>
</div>
<%- include('../partials/scripts') %>
```

- [ ] **Step 4: Write employees detail.ejs**

Write `D:\web_uts_fullstack\views\employees\detail.ejs`:
```html
<%- include('../partials/header', { currentPage: 'employees', title: 'Detail Karyawan' }) %>
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h5 class="card-title mb-0">Detail Karyawan: <%= employee.full_name %></h5>
    <div>
      <a href="/employees/<%= employee.id %>/edit" class="btn btn-warning btn-sm"><i class="ti ti-edit me-1"></i>Edit</a>
      <a href="/employees" class="btn btn-secondary btn-sm"><i class="ti ti-arrow-left me-1"></i>Kembali</a>
    </div>
  </div>
  <div class="card-body">
    <div class="row g-3">
      <div class="col-md-3 text-center">
        <img src="<%= employee.profile_photo || '/assets/images/default-avatar.png' %>" class="img-thumbnail mb-2" style="width:150px;height:150px;object-fit:cover" alt="Foto">
        <h6><%= employee.full_name %></h6>
        <span class="badge bg-primary"><%= employee.employee_code %></span>
      </div>
      <div class="col-md-9">
        <table class="table table-bordered">
          <tr><td width="200"><strong>Jenis Kelamin</strong></td><td><%= employee.gender %></td></tr>
          <tr><td><strong>Tanggal Lahir</strong></td><td><%= employee.birth_date ? employee.birth_date.toISOString().split('T')[0] : '-' %></td></tr>
          <tr><td><strong>Email</strong></td><td><%= employee.email || '-' %></td></tr>
          <tr><td><strong>No HP</strong></td><td><%= employee.phone_number || '-' %></td></tr>
          <tr><td><strong>Alamat</strong></td><td><%= employee.address || '-' %>, <%= employee.city || '' %> <%= employee.province || '' %> <%= employee.postal_code || '' %></td></tr>
          <tr><td><strong>Divisi</strong></td><td><%= employee.division %></td></tr>
          <tr><td><strong>Jabatan</strong></td><td><%= employee.position || '-' %></td></tr>
          <tr><td><strong>Gaji</strong></td><td><%= employee.salary ? 'Rp ' + Number(employee.salary).toLocaleString('id-ID') : '-' %></td></tr>
          <tr><td><strong>Tanggal Masuk</strong></td><td><%= employee.join_date ? employee.join_date.toISOString().split('T')[0] : '-' %></td></tr>
          <tr><td><strong>Status</strong></td><td><span class="badge bg-<%= employee.employment_status === 'Active' ? 'success' : employee.employment_status === 'Inactive' ? 'warning' : 'danger' %>"><%= employee.employment_status %></span></td></tr>
          <tr><td><strong>Pendidikan</strong></td><td><%= employee.education || '-' %></td></tr>
          <tr><td><strong>Status Nikah</strong></td><td><%= employee.marital_status || '-' %></td></tr>
          <tr><td><strong>Kontak Darurat</strong></td><td><%= employee.emergency_contact || '-' %> (<%= employee.emergency_phone || '-' %>)</td></tr>
        </table>
      </div>
    </div>
  </div>
</div>
<%- include('../partials/scripts') %>
```

---

## Phase 8: User Management

### Task 18: Create User Controller, Routes & Views

**Files:**
- Create: `controllers/userController.js`
- Create: `routes/userRoutes.js`
- Create: `views/users/index.ejs`
- Create: `views/users/edit.ejs`

- [ ] **Step 1: Write user controller**

Write `D:\web_uts_fullstack\controllers\userController.js`:
```javascript
const bcrypt = require('bcrypt');
const User = require('../models/User');

const userController = {
  async index(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const data = await User.findAll({ search, page, limit });
      res.render('users/index', {
        title: 'Data User',
        currentPage: 'users',
        users: data.rows,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        search: search || '',
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  async showEdit(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        req.session.error = 'User tidak ditemukan.';
        return res.redirect('/users');
      }
      res.render('users/edit', { title: 'Edit User', currentPage: 'users', user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  async update(req, res) {
    try {
      const data = { ...req.body };
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      } else {
        delete data.password;
      }
      await User.update(req.params.id, data);
      req.session.success = 'Data user berhasil diupdate.';
      res.redirect('/users');
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal mengupdate user.';
      res.redirect('/users/' + req.params.id + '/edit');
    }
  },

  async delete(req, res) {
    try {
      await User.delete(req.params.id);
      req.session.success = 'User berhasil dihapus.';
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal menghapus user.';
    }
    res.redirect('/users');
  },
};

module.exports = userController;
```

- [ ] **Step 2: Write user routes**

Write `D:\web_uts_fullstack\routes\userRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

router.get('/', isAuthenticated, isAdmin, userController.index);
router.get('/:id/edit', isAuthenticated, isAdmin, userController.showEdit);
router.post('/:id', isAuthenticated, isAdmin, userController.update);
router.post('/:id/delete', isAuthenticated, isAdmin, userController.delete);

module.exports = router;
```

- [ ] **Step 3: Write users index.ejs**

Write `D:\web_uts_fullstack\views\users\index.ejs`:
```html
<%- include('../partials/header', { currentPage: 'users', title: 'Data User' }) %>
<div class="d-flex justify-content-between align-items-center mb-3">
  <h5 class="mb-0">Data User</h5>
  <a href="/auth/register" class="btn btn-primary btn-sm"><i class="ti ti-plus me-1"></i>Tambah User</a>
</div>
<form method="GET" action="/users" class="row g-2 mb-3">
  <div class="col-md-4">
    <input type="text" name="search" class="form-control" placeholder="Cari username, email..." value="<%= search %>">
  </div>
  <div class="col-auto">
    <button type="submit" class="btn btn-primary"><i class="ti ti-search me-1"></i>Cari</button>
    <a href="/users" class="btn btn-secondary">Reset</a>
  </div>
</form>
<div class="card">
  <div class="table-responsive">
    <table class="table table-hover mb-0">
      <thead class="table-light">
        <tr><th>#</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Karyawan</th><th>Last Login</th><th>Aksi</th></tr>
      </thead>
      <tbody>
        <% if (users.length === 0) { %><tr><td colspan="8" class="text-center">Tidak ada data</td></tr><% } %>
        <% users.forEach((u, i) => { %>
        <tr>
          <td><% var offset = (page-1)*10; %><%= offset + i + 1 %></td>
          <td><%= u.username %></td>
          <td><%= u.email %></td>
          <td><span class="badge <%= u.role === 'Admin' ? 'bg-danger' : 'bg-primary' %>"><%= u.role %></span></td>
          <td><span class="badge <%= u.status === 'Active' ? 'bg-success' : 'bg-warning' %>"><%= u.status %></span></td>
          <td><%= u.employee_name || '-' %></td>
          <td><%= u.last_login ? new Date(u.last_login).toLocaleString('id-ID') : '-' %></td>
          <td>
            <div class="btn-group btn-group-sm">
              <a href="/users/<%= u.id %>/edit" class="btn btn-warning"><i class="ti ti-edit"></i></a>
              <form method="POST" action="/users/<%= u.id %>/delete" style="display:inline" onsubmit="return confirm('Hapus user ini?')">
                <button class="btn btn-danger"><i class="ti ti-trash"></i></button>
              </form>
            </div>
          </td>
        </tr>
        <% }) %>
      </tbody>
    </table>
  </div>
  <% if (totalPages > 1) { %>
  <div class="card-footer">
    <nav><ul class="pagination justify-content-center mb-0">
      <% for (let p = 1; p <= totalPages; p++) { %>
      <li class="page-item <%= p === page ? 'active' : '' %>"><a class="page-link" href="?search=<%= search %>&page=<%= p %>"><%= p %></a></li>
      <% } %>
    </ul></nav>
  </div>
  <% } %>
</div>
<%- include('../partials/scripts') %>
```

- [ ] **Step 4: Write users edit.ejs**

Write `D:\web_uts_fullstack\views\users\edit.ejs`:
```html
<%- include('../partials/header', { currentPage: 'users', title: 'Edit User' }) %>
<div class="card">
  <div class="card-header"><h5 class="card-title mb-0">Edit User: <%= user.username %></h5></div>
  <div class="card-body">
    <form method="POST" action="/users/<%= user.id %>">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label">Role</label><select name="role" class="form-select"><option <%= user.role === 'Admin' ? 'selected' : '' %>>Admin</option><option <%= user.role === 'Employee' ? 'selected' : '' %>>Employee</option></select></div>
        <div class="col-md-6"><label class="form-label">Status</label><select name="status" class="form-select"><option <%= user.status === 'Active' ? 'selected' : '' %>>Active</option><option <%= user.status === 'Inactive' ? 'selected' : '' %>>Inactive</option></select></div>
        <div class="col-md-6"><label class="form-label">Password Baru (kosongkan jika tidak diganti)</label><input type="password" name="password" class="form-control" minlength="6"></div>
      </div>
      <div class="mt-3">
        <button type="submit" class="btn btn-primary"><i class="ti ti-save me-1"></i>Update</button>
        <a href="/users" class="btn btn-secondary">Batal</a>
      </div>
    </form>
  </div>
</div>
<%- include('../partials/scripts') %>
```

- [ ] **Step 5: Wire user routes in app.js**

Edit `D:\web_uts_fullstack\app.js` — add:
```javascript
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);
```

---

## Phase 9: Upload Excel/CSV + Delete File

### Task 19: Create Upload Controller, Routes & View

**Files:**
- Create: `controllers/uploadController.js`
- Create: `routes/uploadRoutes.js`
- Create: `views/upload/index.ejs`

- [ ] **Step 1: Write upload controller**

Write `D:\web_uts_fullstack\controllers\uploadController.js`:
```javascript
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Employee = require('../models/Employee');

const uploadController = {
  showUpload(req, res) {
    const excelDir = path.join(__dirname, '..', 'uploads', 'excels');
    let files = [];
    try {
      files = fs.readdirSync(excelDir).map(f => ({
        name: f,
        size: fs.statSync(path.join(excelDir, f)).size,
        date: fs.statSync(path.join(excelDir, f)).mtime,
      }));
    } catch {}
    res.render('upload/index', { title: 'Upload Excel', currentPage: 'upload', files });
  },

  async uploadExcel(req, res) {
    try {
      if (!req.file) {
        req.session.error = 'Pilih file terlebih dahulu.';
        return res.redirect('/upload');
      }

      const filePath = req.file.path;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (rows.length === 0) {
        req.session.error = 'File kosong atau tidak bisa dibaca.';
        return res.redirect('/upload');
      }

      const employees = rows.map(r => ({
        employee_code: r.employee_code || r['Kode Karyawan'] || '',
        full_name: r.full_name || r['Nama Lengkap'] || '',
        gender: r.gender || r['Jenis Kelamin'] || 'Male',
        birth_date: r.birth_date || r['Tanggal Lahir'] || null,
        email: r.email || r['Email'] || null,
        phone_number: r.phone_number || r['No HP'] || null,
        address: r.address || r['Alamat'] || null,
        city: r.city || r['Kota'] || null,
        province: r.province || r['Provinsi'] || null,
        postal_code: r.postal_code || r['Kode Pos'] || null,
        division: r.division || r['Divisi'] || '',
        position: r.position || r['Jabatan'] || null,
        salary: r.salary || r['Gaji'] || null,
        join_date: r.join_date || r['Tanggal Masuk'] || null,
        employment_status: r.employment_status || r['Status'] || 'Active',
        education: r.education || r['Pendidikan'] || null,
        marital_status: r.marital_status || r['Status Pernikahan'] || 'Single',
        emergency_contact: r.emergency_contact || r['Kontak Darurat'] || null,
        emergency_phone: r.emergency_phone || r['Telp Darurat'] || null,
      }));

      const inserted = await Employee.bulkCreate(employees);
      req.session.success = `Berhasil mengimport ${inserted} dari ${employees.length} data.`;
      res.redirect('/upload');
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal mengimport file: ' + err.message;
      res.redirect('/upload');
    }
  },

  deleteFile(req, res) {
    try {
      const filePath = path.join(__dirname, '..', 'uploads', 'excels', req.params.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        req.session.success = 'File berhasil dihapus.';
      }
    } catch (err) {
      req.session.error = 'Gagal menghapus file.';
    }
    res.redirect('/upload');
  },
};

module.exports = uploadController;
```

- [ ] **Step 2: Write upload routes**

Write `D:\web_uts_fullstack\routes\uploadRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const { excelUpload } = require('../middleware/upload');

router.get('/', isAuthenticated, isAdmin, uploadController.showUpload);
router.post('/excel', isAuthenticated, isAdmin, excelUpload.single('excelfile'), uploadController.uploadExcel);
router.post('/file/:filename/delete', isAuthenticated, isAdmin, uploadController.deleteFile);

module.exports = router;
```

- [ ] **Step 3: Wire upload routes in app.js**

Edit `D:\web_uts_fullstack\app.js` — add:
```javascript
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/upload', uploadRoutes);
```

- [ ] **Step 4: Write upload view**

Write `D:\web_uts_fullstack\views\upload\index.ejs`:
```html
<%- include('../partials/header', { currentPage: 'upload', title: 'Upload Excel' }) %>
<div class="row">
  <div class="col-md-6">
    <div class="card mb-4">
      <div class="card-header"><h5 class="card-title mb-0">Upload File Excel/CSV</h5></div>
      <div class="card-body">
        <form method="POST" action="/upload/excel" enctype="multipart/form-data">
          <div class="mb-3">
            <label class="form-label">Pilih File (.xlsx, .xls, .csv)</label>
            <input type="file" name="excelfile" class="form-control" accept=".xlsx,.xls,.csv" required>
          </div>
          <button type="submit" class="btn btn-primary"><i class="ti ti-upload me-1"></i>Upload & Import</button>
        </form>
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card">
      <div class="card-header"><h5 class="card-title mb-0">File Terupload</h5></div>
      <div class="card-body">
        <% if (files.length === 0) { %><p class="text-muted">Belum ada file.</p><% } %>
        <table class="table table-sm">
          <% files.forEach(f => { %>
          <tr>
            <td><%= f.name %></td>
            <td><small><%= (f.size / 1024).toFixed(1) %> KB</small></td>
            <td>
              <form method="POST" action="/upload/file/<%= f.name %>/delete" style="display:inline" onsubmit="return confirm('Hapus file ini?')">
                <button class="btn btn-danger btn-sm"><i class="ti ti-trash"></i></button>
              </form>
            </td>
          </tr>
          <% }) %>
        </table>
      </div>
    </div>
  </div>
</div>
<%- include('../partials/scripts') %>
```

---

## Phase 10: Export PDF & Excel

### Task 20: Create Export Utilities & Routes

**Files:**
- Create: `utils/excelGenerator.js`
- Create: `utils/pdfGenerator.js`

- [ ] **Step 1: Write Excel export utility**

Write `D:\web_uts_fullstack\utils\excelGenerator.js`:
```javascript
const ExcelJS = require('exceljs');

async function generateExcel(employees) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Karyawan');

  sheet.columns = [
    { header: 'Kode Karyawan', key: 'employee_code', width: 15 },
    { header: 'Nama Lengkap', key: 'full_name', width: 30 },
    { header: 'Jenis Kelamin', key: 'gender', width: 12 },
    { header: 'Tanggal Lahir', key: 'birth_date', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'No HP', key: 'phone_number', width: 15 },
    { header: 'Alamat', key: 'address', width: 40 },
    { header: 'Kota', key: 'city', width: 15 },
    { header: 'Provinsi', key: 'province', width: 15 },
    { header: 'Kode Pos', key: 'postal_code', width: 10 },
    { header: 'Divisi', key: 'division', width: 20 },
    { header: 'Jabatan', key: 'position', width: 20 },
    { header: 'Gaji', key: 'salary', width: 15 },
    { header: 'Tanggal Masuk', key: 'join_date', width: 15 },
    { header: 'Status', key: 'employment_status', width: 12 },
    { header: 'Pendidikan', key: 'education', width: 15 },
    { header: 'Status Nikah', key: 'marital_status', width: 12 },
    { header: 'Kontak Darurat', key: 'emergency_contact', width: 20 },
    { header: 'Telp Darurat', key: 'emergency_phone', width: 15 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D6EFD' } };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  employees.forEach(e => sheet.addRow(e));
  return workbook;
}

module.exports = { generateExcel };
```

- [ ] **Step 2: Write PDF export utility**

Write `D:\web_uts_fullstack\utils\pdfGenerator.js`:
```javascript
const puppeteer = require('puppeteer');

async function generatePDF(htmlContent) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generatePDF };
```

- [ ] **Step 3: Add export routes to employee routes**

Edit `D:\web_uts_fullstack\routes\employeeRoutes.js` — add after existing routes before `module.exports`:
```javascript
const Employee = require('../models/Employee');
const { generateExcel } = require('../utils/excelGenerator');
const { generatePDF } = require('../utils/pdfGenerator');

router.get('/export/excel', isAuthenticated, async (req, res) => {
  try {
    const employees = await Employee.getAllForExport();
    const workbook = await generateExcel(employees);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees_data.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    req.session.error = 'Gagal export Excel.';
    res.redirect('/employees');
  }
});

router.get('/export/pdf', isAuthenticated, async (req, res) => {
  try {
    const employees = await Employee.getAllForExport();
    const htmlRows = employees.map((e, i) => `
      <tr>
        <td>${i + 1}</td><td>${e.employee_code}</td><td>${e.full_name}</td>
        <td>${e.division || ''}</td><td>${e.position || ''}</td>
        <td>${e.employment_status}</td><td>${e.email || ''}</td><td>${e.phone_number || ''}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif;font-size:11px;margin:10px}
      h2{text-align:center;margin-bottom:5px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #ddd;padding:6px;text-align:left}
      th{background:#0d6efd;color:white}
      tr:nth-child(even){background:#f9f9f9}
    </style></head><body>
      <h2>Laporan Data Karyawan - PT Digital Nusantara</h2>
      <p>Total: ${employees.length} karyawan | Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
      <table><thead><tr><th>#</th><th>Kode</th><th>Nama</th><th>Divisi</th><th>Jabatan</th><th>Status</th><th>Email</th><th>No HP</th></tr></thead>
      <tbody>${htmlRows}</tbody></table>
    </body></html>`;

    const pdfBuffer = await generatePDF(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=employees_report.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    req.session.error = 'Gagal export PDF.';
    res.redirect('/employees');
  }
});
```

---

## Phase 11: Final Assembly & Testing

### Task 21: Finalize app.js with all routes

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Verify app.js has all wired routes**

Ensure `D:\web_uts_fullstack\app.js` contains all these lines before `module.exports`:
```javascript
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');

const app = express();

const sessionStore = new MySQLStore({}, pool);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  key: 'connect.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000, httpOnly: true },
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;
  delete req.session.error;
  delete req.session.success;
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/employees', employeeRoutes);
app.use('/users', userRoutes);
app.use('/upload', uploadRoutes);

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.redirect('/auth/login');
});

module.exports = app;
```

---

### Task 22: Create Sample Data & Run

**Files:**
- Modify: `411231139_muhamad_aditya_saputra.sql`

- [ ] **Step 1: Update SQL dump with sample data**

Update the SQL dump to include:
```sql
-- Add sample employee data
INSERT INTO employees (employee_code, full_name, gender, birth_date, email, phone_number, address, city, province, postal_code, division, position, salary, join_date, employment_status, education, marital_status) VALUES
('EMP001', 'Muhamad Aditya Saputra', 'Male', '2000-01-15', 'aditya@uts.com', '081234567890', 'Jl. Merdeka No.1', 'Jakarta', 'DKI Jakarta', '12345', 'IT', 'Software Engineer', 8000000.00, '2023-01-10', 'Active', 'S1 Teknik Informatika', 'Single'),
('EMP002', 'Siti Nurhaliza', 'Female', '1998-05-20', 'siti@uts.com', '081234567891', 'Jl. Sudirman No.2', 'Bandung', 'Jawa Barat', '40111', 'Finance', 'Accountant', 7000000.00, '2022-06-15', 'Active', 'S1 Akuntansi', 'Married'),
('EMP003', 'Budi Santoso', 'Male', '1995-11-08', 'budi@uts.com', '081234567892', 'Jl. Malioboro No.3', 'Yogyakarta', 'DIY', '55111', 'HR', 'HR Manager', 9000000.00, '2021-03-20', 'Active', 'S1 Psikologi', 'Married'),
('EMP004', 'Anisa Rahma', 'Female', '1999-07-12', 'anisa@uts.com', '081234567893', 'Jl. Diponegoro No.4', 'Surabaya', 'Jawa Timur', '60111', 'Marketing', 'Marketing Specialist', 6500000.00, '2023-08-01', 'Active', 'S1 Manajemen', 'Single'),
('EMP005', 'Dimas Ardian', 'Male', '1997-03-25', 'dimas@uts.com', '081234567894', 'Jl. Thamrin No.5', 'Medan', 'Sumatera Utara', '20111', 'IT', 'System Admin', 7500000.00, '2022-01-05', 'Inactive', 'S1 Teknik Komputer', 'Single');
```

- [ ] **Step 2: Run the server**

```bash
cd D:\web_uts_fullstack && node server.js
```

- [ ] **Step 3: Test all routes**

Test the following:
1. `GET /auth/login` — Login page with CAPTCHA
2. `POST /auth/login` — Login with valid credentials
3. `GET /dashboard` — Dashboard with stats + charts
4. `GET /employees` — Employee list with search + pagination
5. `GET /employees/create` — Add employee form
6. `POST /employees` — Create employee
7. `GET /employees/:id` — Employee detail
8. `GET /employees/:id/edit` — Edit employee form
9. `POST /employees/:id` — Update employee
10. `POST /employees/:id/delete` — Delete employee
11. `GET /users` — User list
12. `GET /upload` — Upload page
13. `GET /employees/export/excel` — Download Excel
14. `GET /employees/export/pdf` — Download PDF

---

## Post-Implementation Checklist

- [ ] Dark mode toggles and persists via localStorage
- [ ] CAPTCHA validates on login
- [ ] Forgot password flow works (token generation + reset)
- [ ] JWT generated at login, stored in session
- [ ] Protected routes redirect to login if not authenticated
- [ ] Role permission restricts Employee access
- [ ] Search works across full_name, email, division, employment_status
- [ ] Pagination displays correct page numbers
- [ ] Upload Excel/CSV parses and imports data
- [ ] Delete file button removes file from server
- [ ] Export Excel generates valid .xlsx
- [ ] Export PDF generates valid .pdf
- [ ] Responsive layout (Bootstrap 5)
- [ ] All forms validate required fields
- [ ] Password hashed with bcrypt (10 rounds)
- [ ] Session stored in MySQL
