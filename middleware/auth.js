const jwt = require('jsonwebtoken');
require('dotenv').config();

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  req.session.error = 'Silakan login terlebih dahulu';
  res.redirect('/auth/login');
}

function isAuthenticatedAPI(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { isAuthenticated, isAuthenticatedAPI };
