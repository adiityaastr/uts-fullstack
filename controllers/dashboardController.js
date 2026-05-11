const Employee = require('../models/Employee');
const User = require('../models/User');

const dashboardController = {
  async index(req, res) {
    try {
      const totalKaryawan = await Employee.countAll();
      const totalDivisi = await Employee.countDivisions();
      const totalUser = await User.countAll();
      const totalAktif = await Employee.countByStatus('Active');
      const byDivision = await Employee.getByDivision();
      const byStatus = await Employee.getByStatus();

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
      res.status(500).send('Server error');
    }
  },
};

module.exports = dashboardController;
