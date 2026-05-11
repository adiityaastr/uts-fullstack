const multer = require('multer');
const path = require('path');

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/photos/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/excels/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) cb(null, true);
    else cb(new Error('Hanya file JPG dan PNG yang diizinkan'));
  },
});

const excelUpload = multer({
  storage: excelStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls', '.csv'].includes(ext)) cb(null, true);
    else cb(new Error('Hanya file Excel/CSV yang diizinkan'));
  },
});

module.exports = { photoUpload, excelUpload };
