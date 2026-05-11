-- NIM: 411231139
-- Nama: Muhamad Aditya Saputra
-- UTS Employee Management System - PT Digital Nusantara

CREATE DATABASE IF NOT EXISTS uts_employee_db;
USE uts_employee_db;

CREATE TABLE IF NOT EXISTS employees (
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

CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  expires INT NOT NULL,
  data TEXT
);

INSERT INTO users (username, email, password, role, status) VALUES
('admin', 'admin@uts.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Active');
-- password: password
