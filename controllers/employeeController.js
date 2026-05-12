const Employee = require('../models/Employee');

const employeeController = {
  async index(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const data = await Employee.findAll({ search, page, limit });
      res.render('employees/index', {
        title: 'Data Karyawan',
        currentPage: 'employees',
        employees: data.rows,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        search: search || '',
      });
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal memuat data karyawan.';
      res.redirect('/dashboard');
    }
  },

  showCreate(req, res) {
    res.render('employees/create', {
      title: 'Tambah Karyawan',
      currentPage: 'employees',
    });
  },

  async create(req, res) {
    try {
      const data = { ...req.body };
      if (req.file) data.profile_photo = '/uploads/photos/' + req.file.filename;

      const existing = await Employee.findByCode(data.employee_code);
      if (existing) {
        req.session.error = 'Kode karyawan sudah digunakan.';
        return res.redirect('/employees/create');
      }

      await Employee.create(data);
      req.session.success = 'Data karyawan berhasil ditambahkan.';
      res.redirect('/employees');
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('file')) {
        req.session.error = err.message;
      } else {
        req.session.error = 'Gagal menambahkan data karyawan.';
      }
      res.redirect('/employees/create');
    }
  },

  async show(req, res) {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
        req.session.error = 'Karyawan tidak ditemukan.';
        return res.redirect('/employees');
      }
      res.render('employees/detail', {
        title: 'Detail Karyawan',
        currentPage: 'employees',
        employee,
      });
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal memuat detail karyawan.';
      res.redirect('/employees');
    }
  },

  async showEdit(req, res) {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
        req.session.error = 'Karyawan tidak ditemukan.';
        return res.redirect('/employees');
      }
      res.render('employees/edit', {
        title: 'Edit Karyawan',
        currentPage: 'employees',
        employee,
      });
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal memuat form edit karyawan.';
      res.redirect('/employees');
    }
  },

  async update(req, res) {
    try {
      const data = { ...req.body };

      const existing = await Employee.findByCode(data.employee_code);
      if (existing && existing.id != req.params.id) {
        req.session.error = 'Kode karyawan sudah digunakan oleh karyawan lain.';
        return res.redirect('/employees/' + req.params.id + '/edit');
      }

      if (req.file) {
        const employee = await Employee.findById(req.params.id);
        if (employee && employee.profile_photo) {
          const fs = require('fs');
          const path = require('path');
          const oldPhotoPath = path.join(__dirname, '..', employee.profile_photo);
          try { if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath); } catch {}
        }
        data.profile_photo = '/uploads/photos/' + req.file.filename;
      }
      await Employee.update(req.params.id, data);
      req.session.success = 'Data karyawan berhasil diupdate.';
      res.redirect('/employees');
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('file')) {
        req.session.error = err.message;
      } else {
        req.session.error = 'Gagal mengupdate data karyawan.';
      }
      res.redirect('/employees/' + req.params.id + '/edit');
    }
  },

  async delete(req, res) {
    try {
      await Employee.delete(req.params.id);
      req.session.success = 'Data karyawan berhasil dihapus.';
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal menghapus data karyawan.';
    }
    res.redirect('/employees');
  },
};

module.exports = employeeController;
