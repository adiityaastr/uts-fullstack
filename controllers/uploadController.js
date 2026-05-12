const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Employee = require('../models/Employee');

function readCSVRows(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const row = {};
    headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

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
      const ext = path.extname(filePath).toLowerCase();
      let rows;
      if (ext === '.csv') {
        rows = readCSVRows(filePath);
      } else {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      }

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

      const result = await Employee.bulkCreate(employees);
      let msg = `Berhasil mengimport ${result.inserted} dari ${result.total} data.`;
      if (result.skipped.length > 0) {
        msg += ` Kode duplikat/error: ${result.skipped.join(', ')}`;
      }
      req.session.success = msg;
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
