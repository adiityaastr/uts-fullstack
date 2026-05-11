const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const Employee = require('../models/Employee');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const { photoUpload } = require('../middleware/upload');
const { generateExcel } = require('../utils/excelGenerator');
const { generatePDF } = require('../utils/pdfGenerator');

router.get('/', isAuthenticated, employeeController.index);
router.get('/create', isAuthenticated, isAdmin, employeeController.showCreate);
router.post('/', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), employeeController.create);
router.get('/:id', isAuthenticated, employeeController.show);
router.get('/:id/edit', isAuthenticated, isAdmin, employeeController.showEdit);
router.post('/:id', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), employeeController.update);
router.post('/:id/delete', isAuthenticated, isAdmin, employeeController.delete);

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

module.exports = router;
