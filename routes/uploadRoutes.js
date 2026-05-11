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
