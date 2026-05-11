function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'Admin') return next();
  req.session.error = 'Akses ditolak. Hanya Admin yang dapat mengakses halaman ini.';
  res.redirect('/dashboard');
}

module.exports = { isAdmin };
