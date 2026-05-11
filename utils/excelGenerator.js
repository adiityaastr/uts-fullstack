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
