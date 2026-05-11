# Design Doc: PT Digital Nusantara - Employee Management System

**NIM:** 411231139  
**Nama:** Muhamad Aditya Saputra  
**Date:** 2026-05-10

---

## 1. Architecture & Project Structure

Monolithic Express.js + EJS application using Dasher Bootstrap 5 Admin Template.

```
web_uts_fullstack/
├── server.js                  # Entry point Express
├── app.js                     # Express app config (middleware, routes, session)
├── package.json
├── .env                       # Environment variables
├── .gitignore
├── 411231139_muhamad_aditya_saputra.sql  # SQL dump
│
├── config/
│   └── database.js            # MySQL connection pool
│
├── middleware/
│   ├── auth.js                # JWT verify + session check middleware
│   ├── role.js                # Role permission middleware
│   ├── session.js             # express-session + connect-mysql-session
│   └── upload.js              # Multer config (photos + excel files)
│
├── routes/
│   ├── authRoutes.js          # /auth/* (login, register, logout, forgot, reset)
│   ├── employeeRoutes.js      # /employees/* (CRUD, search, pagination, export)
│   ├── userRoutes.js          # /users/* (manage user accounts)
│   ├── dashboardRoutes.js     # /dashboard
│   └── uploadRoutes.js        # /upload/* (excel/csv import, delete file)
│
├── controllers/
│   ├── authController.js
│   ├── employeeController.js
│   ├── userController.js
│   ├── dashboardController.js
│   └── uploadController.js
│
├── models/
│   ├── Employee.js            # Manual SQL queries for employees table
│   └── User.js                # Manual SQL queries for users table
│
├── views/
│   ├── partials/
│   │   ├── header.ejs         # <head> with meta, CSS links
│   │   ├── scripts.ejs        # JS scripts at bottom
│   │   ├── sidebar.ejs        # Navigation sidebar (adapted from Dasher)
│   │   ├── topbar.ejs         # Top bar with user info, dark mode toggle, logout
│   │   ├── footer.ejs         # Closing tags
│   │   └── pagination.ejs     # Reusable pagination component
│   ├── auth/
│   │   ├── login.ejs          # Login form with CAPTCHA
│   │   ├── register.ejs       # Register form (admin only)
│   │   ├── forgot-password.ejs
│   │   └── reset-password.ejs
│   ├── dashboard/
│   │   └── index.ejs          # Dashboard with stats cards + charts
│   ├── employees/
│   │   ├── index.ejs          # List with search + pagination
│   │   ├── create.ejs         # Add employee form (23 fields)
│   │   ├── edit.ejs           # Edit employee form
│   │   └── detail.ejs         # Employee detail view
│   ├── users/
│   │   ├── index.ejs          # User list with search
│   │   ├── create.ejs         # Create user (link to employee)
│   │   └── edit.ejs           # Edit user
│   └── upload/
│       └── index.ejs          # Upload Excel/CSV + file list with delete
│
├── public/                    # Static assets from Dasher template
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   ├── fonts/
│   │   ├── images/
│   │   ├── libs/
│   │   └── scss/
│   └── node_modules/          # Copied libs
│
├── uploads/                   # Uploaded files storage
│   ├── photos/
│   └── excels/
│
└── utils/
    ├── captcha.js             # Custom math CAPTCHA generator
    ├── pdfGenerator.js        # Export PDF using puppeteer
    └── excelGenerator.js      # Export Excel using exceljs
```

---

## 2. Database Schema

### Tabel employees (23 columns)
```sql
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
```

### Tabel users (11 columns + 2 additional)
```sql
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
```

### Tabel sessions
```sql
CREATE TABLE sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  expires INT NOT NULL,
  data TEXT
);
```

**Total: 3 tables.** Relasi: `users.employee_id` → `employees.id` (one-to-one).

---

## 3. Authentication Flow

### Register
- Admin creates user account via form: username, email, password, employee_id (dropdown)
- Password hashed with bcrypt (10 salt rounds)
- `POST /auth/register` → INSERT into users → redirect to user list

### Login
- Form: username/email + password + CAPTCHA (custom math CAPTCHA)
- `POST /auth/login` → verify CAPTCHA → find user by username/email → bcrypt.compare → generate JWT (1 hour) → set session (`req.session.user = {id, username, role}`) → update last_login → redirect to /dashboard
- Failed: re-render login with error message, regenerate CAPTCHA

### CAPTCHA
- Custom math CAPTCHA: "What is X + Y?" stored in session
- Generated per login page load, validated on submit

### Logout
- `POST /auth/logout` → destroy session → clear cookie → redirect /auth/login

### Forgot Password
- Input email → generate crypto.randomBytes reset_token + 1-hour expiry → store in DB → display reset link in UI → user clicks link → `/auth/reset/:token` → enter new password → bcrypt hash → update password → clear reset_token

### JWT (for API)
- Generated at login, stored in session
- Middleware `auth.js` checks: `req.session.user` exists (for web routes) AND Authorization header Bearer token valid (for API routes)
- Token expiry: 1 hour

### Session
- `express-session` + `express-mysql-session` (stored in `sessions` table)
- Cookie: `connect.sid`, httpOnly, secure (production), maxAge: 1 hour

---

## 4. CRUD Employees & Search / Pagination

### Routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/employees` | List with search + pagination |
| GET | `/employees/create` | Add employee form |
| POST | `/employees` | Create employee |
| GET | `/employees/:id` | Employee detail |
| GET | `/employees/:id/edit` | Edit employee form |
| PUT | `/employees/:id` | Update employee (AJAX/API) |
| DELETE | `/employees/:id` | Delete employee (AJAX/API) |

### Search
- Query params: `?search=keyword&page=1&limit=10`
- Searches across: `full_name`, `email`, `division`, `employment_status`
- SQL: `WHERE full_name LIKE ? OR email LIKE ? OR division LIKE ? OR employment_status LIKE ?`

### Pagination
- Default 10 per page, configurable
- SQL: `LIMIT 10 OFFSET ((page-1)*10)`
- Total count query for page navigation
- EJS partial `pagination.ejs` renders page numbers

### Upload Excel/CSV
- `POST /upload/excel` → multer receive file → `xlsx` library parse → validate each row → batch INSERT INTO employees → redirect with success/error report
- File stored in `uploads/excels/`

### Delete Uploaded File
- `DELETE /upload/file/:filename` → `fs.unlink` from `uploads/excels/`
- Button on upload page next to each file

---

## 5. Dashboard

### Stats Cards (4 boxes)
- Total Karyawan: `SELECT COUNT(*) FROM employees`
- Total Divisi: `SELECT COUNT(DISTINCT division) FROM employees`
- Total User: `SELECT COUNT(*) FROM users`
- Total Data Aktif: `SELECT COUNT(*) FROM employees WHERE employment_status = 'Active'`

### Charts (ApexCharts from Dasher)
- Pie/Donut chart: Employees by division
- Bar chart: Employees by status (Active, Inactive, Resigned)

---

## 6. Security

- **Password hashing:** bcrypt with 10 salt rounds
- **JWT:** `jsonwebtoken`, secret from `.env`, 1 hour expiry, Bearer token in header
- **Session:** `express-session` + `express-mysql-session`, httpOnly cookie
- **Protected Routes:** `auth.js` middleware checks session for web routes, JWT for API routes — redirects to login if not authenticated
- **Role Permission:** `role.js` middleware checks `req.session.user.role` — Admin can access everything (CRUD users, manage all employees), Employee can view own data only
- **Input Validation:** Server-side validation for all forms, SQL injection prevention via parameterized queries
- **File Upload:** Only allow `.xlsx`, `.xls`, `.csv` for Excel; `.jpg`, `.png` for photos; size limits via multer

---

## 7. Additional Features

### Dark Mode
- Bootstrap 5 built-in `data-bs-theme="dark"` toggle
- Toggle switch in topbar, saved to localStorage
- Dasher template already supports dark mode via CSS variables

### CAPTCHA on Login
- Custom math CAPTCHA: random `a + b` stored in session, verified on login POST
- SVG or plain text display on login form

### Forgot Password
- Token-based reset flow (described in Auth section)

### Export PDF
- `GET /employees/export/pdf` → server-side PDF generation via puppeteer (render EJS → convert to PDF) or pdfkit
- Download file: `employees_report.pdf`

### Export Excel
- `GET /employees/export/excel` → `exceljs` generate .xlsx file
- Download file: `employees_data.xlsx`

### Role Permission
- **Admin:** Full access — CRUD employees, CRUD users, upload, export, dashboard
- **Employee:** View own profile, view own employee data only
- Middleware `role.js` checks `req.session.user.role` before each route handler

---

## 8. Route Design Summary

```
GET    /                          → Redirect to /dashboard (if logged in) or /auth/login
GET    /auth/login                → Login page (with CAPTCHA)
POST   /auth/login                → Process login
GET    /auth/register             → Register page (admin only)
POST   /auth/register             → Process register
GET    /auth/logout               → Logout
GET    /auth/forgot-password       → Forgot password form
POST   /auth/forgot-password       → Send reset link
GET    /auth/reset/:token          → Reset password form
POST   /auth/reset/:token          → Process reset

GET    /dashboard                 → Dashboard stats + charts

GET    /employees                 → Employee list (search + pagination)
GET    /employees/create          → Add employee form
POST   /employees                 → Create employee
GET    /employees/:id             → Employee detail
GET    /employees/:id/edit        → Edit employee form
PUT    /employees/:id             → Update employee (AJAX/API)
DELETE /employees/:id             → Delete employee (AJAX/API)
GET    /employees/export/excel     → Export to Excel
GET    /employees/export/pdf       → Export to PDF

GET    /users                     → User list
GET    /users/create              → Create user form
POST   /users                     → Create user
GET    /users/:id/edit            → Edit user form
PUT    /users/:id                  → Update user (AJAX/API)
DELETE /users/:id                  → Delete user (AJAX/API)

GET    /upload                    → Upload page (file list + delete buttons)
POST   /upload/excel              → Upload Excel/CSV file
DELETE /upload/file/:filename     → Delete uploaded file
```

---

## 9. Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Template Engine | EJS |
| Database | MySQL (manual queries, no ORM) |
| Authentication | JWT (jsonwebtoken) + Session (express-session) |
| Password Hash | bcrypt |
| Session Store | express-mysql-session |
| File Upload | multer |
| Excel Parsing | xlsx (SheetJS) |
| Excel Export | exceljs |
| PDF Export | puppeteer |
| CAPTCHA | Custom math CAPTCHA |
| Frontend Template | Dasher Bootstrap 5 Admin Template |
| Charts | ApexCharts (bundled with Dasher) |
| CSS Framework | Bootstrap 5.3 |
| Icons | Tabler Icons (bundled with Dasher) |
