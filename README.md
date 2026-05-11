# PT Digital Nusantara - Employee Management System

Sistem Manajemen Karyawan berbasis web untuk **Ujian Tengah Semester (UTS) Fullstack Web Development**.

**NIM:** 411231139  
**Nama:** Muhamad Aditya Saputra

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|------------------------------------------------|
| Backend   | Node.js, Express.js                            |
| Frontend  | EJS Template Engine, Bootstrap 5 (Dasher Admin) |
| Database  | MySQL (mysql2)                                 |
| Session   | express-session + express-mysql-session        |
| Auth      | bcrypt, JWT                                    |
| Export    | ExcelJS (Excel), Puppeteer (PDF)               |
| Upload    | Multer                                         |

## Features

- **Authentication**: Login, Register, Logout, Forgot/Reset Password, Custom Math CAPTCHA
- **Dashboard**: Statistics cards, charts overview
- **Employee CRUD**: 23 fields including photo upload, search & pagination
- **User Management**: Admin creates user accounts linked to employees
- **Role-Based Access**: Admin & Employee roles
- **Excel Import/Export**: Upload Excel/CSV to bulk import, export employee data
- **PDF Export**: Generate employee reports via Puppeteer

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm

## Installation

```bash
git clone https://github.com/adiityaastr/uts-fullstack.git
cd uts-fullstack
npm install
```

## Configuration

1. Create a MySQL database:
```sql
CREATE DATABASE uts_employee_db;
```

2. Copy `.env.example` to `.env` and configure:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=uts_employee_db
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
PORT=3000
```

3. Import the SQL schema:
```bash
mysql -u root -p uts_employee_db < 411231139_muhamad_aditya_saputra.sql
```

## Running

```bash
npm start
```

Server runs at `http://localhost:3000`

## Project Structure

```
web_uts_fullstack/
├── server.js              # Entry point
├── app.js                 # Express configuration
├── config/database.js     # MySQL connection pool
├── controllers/           # Route handlers
├── middleware/            # Auth, role, session, upload
├── models/                # Database queries
├── routes/                # Express routes
├── views/                 # EJS templates
│   ├── auth/              # Login, register, forgot/reset password
│   ├── dashboard/         # Dashboard with stats
│   ├── employees/         # CRUD + search + pagination
│   ├── users/             # User management
│   └── upload/            # Excel/CSV import
├── public/                # Static assets (Dasher Admin Template)
├── uploads/               # Uploaded photos & excels
└── utils/                 # CAPTCHA, PDF & Excel generators
```

## Database Schema

- **employees** - 23 columns (employee data, photos, status)
- **users** - User accounts with role-based access
- **sessions** - MySQL session store

## License

ISC — UTS Fullstack Web Development 2026
