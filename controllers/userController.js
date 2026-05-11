const bcrypt = require('bcrypt');
const User = require('../models/User');

const userController = {
  async index(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const data = await User.findAll({ search, page, limit });
      res.render('users/index', {
        title: 'Data User',
        currentPage: 'users',
        users: data.rows,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        search: search || '',
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  async showEdit(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        req.session.error = 'User tidak ditemukan.';
        return res.redirect('/users');
      }
      res.render('users/edit', { title: 'Edit User', currentPage: 'users', user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  async update(req, res) {
    try {
      const data = { ...req.body };
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      } else {
        delete data.password;
      }
      await User.update(req.params.id, data);
      req.session.success = 'Data user berhasil diupdate.';
      res.redirect('/users');
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal mengupdate user.';
      res.redirect('/users/' + req.params.id + '/edit');
    }
  },

  async delete(req, res) {
    try {
      await User.delete(req.params.id);
      req.session.success = 'User berhasil dihapus.';
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal menghapus user.';
    }
    res.redirect('/users');
  },
};

module.exports = userController;
