const Employee = require('../models/Employee');
const User = require('../models/User');

function sanitize(data) {
  if (typeof data === 'string') return data.replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
  if (Array.isArray(data)) return data.map(sanitize);
  if (data && typeof data === 'object') {
    const out = {};
    for (const k of Object.keys(data)) out[k] = sanitize(data[k]);
    return out;
  }
  return data;
}

const dashboardController = {
  async index(req, res) {
    try {
      const totalKaryawan = await Employee.countAll();
      const totalDivisi = await Employee.countDivisions();
      const totalUser = await User.countAll();
      const totalAktif = await Employee.countByStatus('Active');
      const byDivision = sanitize(await Employee.getByDivision());
      const byStatus = sanitize(await Employee.getByStatus());

      res.render('dashboard/index', {
        title: 'Dashboard',
        currentPage: 'dashboard',
        totalKaryawan,
        totalDivisi,
        totalUser,
        totalAktif,
        byDivision,
        byStatus,
      });
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal memuat dashboard.';
      res.status(500).send('Server error');
    }
  },
};

module.exports = dashboardController;
