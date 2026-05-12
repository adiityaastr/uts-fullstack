-- =============================================================
-- PT Digital Nusantara - Employee Management System
-- NIM: 411231139 | Nama: Muhamad Aditya Saputra
-- UTS Fullstack Web Development
-- =============================================================
-- Database: uts_employee_db
-- Engine: InnoDB (MySQL 8.0+ / MariaDB 10.4+)
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- =============================================================

CREATE DATABASE IF NOT EXISTS uts_employee_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE uts_employee_db;

-- =============================================================
-- TABLE: employees
-- Deskripsi: Menyimpan seluruh data karyawan PT Digital Nusantara
-- Total: 23 kolom
-- =============================================================
CREATE TABLE IF NOT EXISTS employees (

  -- ===========================================================
  -- 1. IDENTITAS & KODE UNIK
  -- ===========================================================
  id            INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key internal, auto-increment',
  employee_code VARCHAR(20)  NOT NULL UNIQUE COMMENT 'Kode unik eksternal (NIK/Nomor Induk Karyawan)',

  -- ===========================================================
  -- 2. INFORMASI PRIBADI & DEMOGRAFI
  -- ===========================================================
  full_name     VARCHAR(100) NOT NULL        COMMENT 'Nama lengkap karyawan',
  gender        ENUM('Male','Female') NOT NULL COMMENT 'Jenis kelamin (L/P)',
  birth_date    DATE         NULL            COMMENT 'Tanggal lahir (untuk hitung usia & pensiun)',
  marital_status ENUM('Single','Married') NULL COMMENT 'Status pernikahan (untuk tunjangan & pajak)',

  -- ===========================================================
  -- 3. KONTAK & DOMISILI
  -- ===========================================================
  email         VARCHAR(100) NULL UNIQUE     COMMENT 'Alamat email (notifikasi slip gaji, dll)',
  phone_number  VARCHAR(20)  NULL            COMMENT 'Nomor HP/telepon',
  address       TEXT         NULL            COMMENT 'Alamat lengkap',
  city          VARCHAR(100) NULL            COMMENT 'Kota domisili',
  province      VARCHAR(100) NULL            COMMENT 'Provinsi domisili',
  postal_code   VARCHAR(10)  NULL            COMMENT 'Kode pos',

  -- ===========================================================
  -- 4. KEPEGAWAIAN & FINANSIAL
  -- ===========================================================
  division      VARCHAR(100) NULL            COMMENT 'Divisi/bagian (contoh: IT, Marketing, Finance)',
  position      VARCHAR(100) NULL            COMMENT 'Jabatan (contoh: Senior Developer, Manager)',
  salary        DECIMAL(12,2) NULL           COMMENT 'Gaji (DECIMAL untuk presisi nilai uang, max 999.999.999.999,99)',
  join_date     DATE         NULL            COMMENT 'Tanggal mulai bekerja (untuk hitung masa kerja & cuti)',
  employment_status ENUM('Active','Inactive','Resigned') DEFAULT 'Active' COMMENT 'Status kepegawaian',

  -- ===========================================================
  -- 5. KEAMANAN & PENDUKUNG
  -- ===========================================================
  emergency_contact VARCHAR(100) NULL        COMMENT 'Nama kontak darurat (K3)',
  emergency_phone   VARCHAR(20)  NULL        COMMENT 'Nomor telepon kontak darurat',
  profile_photo     VARCHAR(255) NULL        COMMENT 'Path file foto profil (disimpan di uploads/photos/)',
  education         VARCHAR(100) NULL        COMMENT 'Pendidikan terakhir',

  -- ===========================================================
  -- 6. AUDIT TRAIL (JEJAK AUDIT)
  -- ===========================================================
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diubah',

  -- ===========================================================
  -- INDEXES (untuk mempercepat query pencarian & filter)
  -- ===========================================================
  INDEX idx_full_name (full_name),
  INDEX idx_division  (division)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- TABLE: users
-- Deskripsi: Akun login sistem dengan role-based access
-- Total: 14 kolom
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  employee_id   INT          NULL            COMMENT 'FK ke employees.id (1 employee = 1 user)',
  username      VARCHAR(100) NOT NULL UNIQUE COMMENT 'Username untuk login',
  email         VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email untuk login & reset password',
  password      VARCHAR(255) NOT NULL        COMMENT 'Password hash (bcrypt, 10 rounds)',
  role          ENUM('Admin','Employee') DEFAULT 'Employee' COMMENT 'Role akses: Admin (full) / Employee (terbatas)',
  status        ENUM('Active','Inactive') DEFAULT 'Active' COMMENT 'Status akun (bisa dinonaktifkan)',
  remember_token VARCHAR(255) NULL           COMMENT 'Token untuk fitur Remember Me (auto-login)',
  last_login    DATETIME     NULL            COMMENT 'Timestamp login terakhir',
  reset_token   VARCHAR(255) NULL            COMMENT 'Token untuk reset password (forgot password)',
  reset_token_expires DATETIME NULL          COMMENT 'Waktu kadaluarsa reset token',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- TABLE: sessions
-- Deskripsi: Session store untuk express-mysql-session
-- Auto-managed oleh library, tidak perlu insert/update manual
-- =============================================================
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  expires    INT  NOT NULL,
  data       TEXT
);


-- =============================================================
-- DEFAULT DATA: Admin Account
-- =============================================================
INSERT INTO users (username, email, password, role, status) VALUES
('admin', 'admin@uts.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Active');
-- Password: password
-- ⚠️ GANTI password setelah login pertama kali!
