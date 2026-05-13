const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const Employee = require('../models/Employee');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const { photoUpload } = require('../middleware/upload');
const { generateExcel } = require('../utils/excelGenerator');
const { generatePDFStream } = require('../utils/pdfGenerator');

router.get('/', isAuthenticated, employeeController.index);
router.get('/create', isAuthenticated, isAdmin, employeeController.showCreate);
router.post('/', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), employeeController.create);

// Export routes MUST be before /:id
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
    await generatePDFStream(employees, res);
  } catch (err) {
    console.error('PDF Export Error:', err);
    if (!res.headersSent) {
      req.session.error = 'Gagal export PDF.';
      res.redirect('/employees');
    }
  }
});

router.get('/:id', isAuthenticated, employeeController.show);
router.get('/:id/edit', isAuthenticated, isAdmin, employeeController.showEdit);
router.post('/:id', isAuthenticated, isAdmin, photoUpload.single('profile_photo'), employeeController.update);
router.post('/:id/delete', isAuthenticated, isAdmin, employeeController.delete);

module.exports = router;
