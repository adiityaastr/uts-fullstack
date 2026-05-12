#!/bin/bash

# Employee Management System - Setup Script for Linux/Mac
# Usage: chmod +x setup.sh && ./setup.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_error()   { echo -e "${RED}[ERR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_step()    { echo -e "\n[$1] $2"; echo "------------------------------------------"; }

echo "=========================================="
echo "Employee Management System - Setup Wizard"
echo "=========================================="

print_step "1/6" "Mengecek prerequisites..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js terinstall: $NODE_VERSION"
else
    print_error "Node.js tidak ditemukan!"
    echo "Silakan install Node.js v18+ dari https://nodejs.org/"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm terinstall: $NPM_VERSION"
else
    print_error "npm tidak ditemukan!"
    exit 1
fi

MYSQL_FOUND=0
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version 2>/dev/null | head -1)
    print_success "MySQL terinstall: $MYSQL_VERSION"
    MYSQL_FOUND=1
else
    print_warning "MySQL client tidak ditemukan!"
fi

print_step "2/6" "Menginstall dependencies..."

if npm install; then
    print_success "Dependencies berhasil diinstall"
else
    print_error "Gagal menginstall dependencies!"
    exit 1
fi

print_step "3/6" "Setup environment variables..."

SKIP_ENV=0
if [ -f .env ]; then
    print_warning "File .env sudah ada."
    read -p "Apakah Anda ingin menggantinya? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        SKIP_ENV=1
    fi
fi

if [ $SKIP_ENV -eq 0 ]; then
    cp .env.example .env

    echo
    echo "Konfigurasi Database MySQL:"
    echo "(Tekan Enter untuk menggunakan default)"
    echo

    read -p "Host [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}

    read -p "Username [root]: " DB_USER
    DB_USER=${DB_USER:-root}

    read -sp "Password [kosong]: " DB_PASS
    echo

    read -p "Database Name [uts_employee_db]: " DB_NAME
    DB_NAME=${DB_NAME:-uts_employee_db}

    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

    cat > .env << EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
PORT=3000
EOF

    print_success "File .env berhasil dibuat"
fi

print_step "4/6" "Setup database..."

if [ $MYSQL_FOUND -eq 0 ]; then
    print_warning "MySQL client tidak tersedia."
else
    echo "Mencoba membuat database..."
    if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null; then
        print_success "Database berhasil dibuat"
    else
        print_warning "Tidak dapat membuat database otomatis."
    fi

    echo "Importing database schema..."
    if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < 411231139_muhamad_aditya_saputra.sql 2>/dev/null; then
        print_success "Database schema berhasil diimport"
    else
        print_error "Gagal mengimport schema database!"
    fi
fi

print_step "5/6" "Membuat folder uploads..."

mkdir -p uploads/photos uploads/excels
chmod -R 755 uploads
print_success "Folder uploads siap"

print_step "6/6" "Verifikasi setup..."

[ -d node_modules ] && print_success "node_modules/" || print_error "node_modules/ tidak ditemukan"
[ -f .env ] && print_success ".env" || print_error ".env tidak ditemukan"
[ -d uploads ] && print_success "uploads/" || print_error "uploads/ tidak ditemukan"

echo
echo "=========================================="
echo "Setup Selesai!"
echo "=========================================="
echo
echo "Untuk menjalankan aplikasi:"
echo "  npm start"
echo
echo "Aplikasi akan berjalan di:"
echo "  http://localhost:3000"
echo

read -p "Apakah Anda ingin menjalankan aplikasi sekarang? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm start
fi
