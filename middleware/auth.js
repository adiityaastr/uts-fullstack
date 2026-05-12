const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

async function isAuthenticated(req, res, next) {
  if (req.session.user) return next();

  const rememberToken = req.cookies?.remember_token;
  if (rememberToken) {
    try {
      const user = await User.findByRememberToken(rememberToken);
      if (user) {
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role,
        };
        return next();
      }
    } catch {}
  }

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
