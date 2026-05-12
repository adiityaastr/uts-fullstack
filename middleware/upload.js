const multer = require('multer');
const path = require('path');
const fs = require('fs');

const photoDir = path.join(__dirname, '..', 'uploads', 'photos');
const excelDir = path.join(__dirname, '..', 'uploads', 'excels');

if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });
if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, photoDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, excelDir),
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
