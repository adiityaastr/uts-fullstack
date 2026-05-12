const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { generateCaptcha } = require('../utils/captcha');
require('dotenv').config();

const authController = {
  showLogin(req, res) {
    const captcha = generateCaptcha();
    req.session.captchaAnswer = captcha.answer;
    res.render('auth/login', { captcha, title: 'Login' });
  },

  async login(req, res) {
    try {
      const { username, password, captcha } = req.body;

      if (parseInt(captcha) !== req.session.captchaAnswer) {
        req.session.error = 'CAPTCHA salah. Silakan coba lagi.';
        return res.redirect('/auth/login');
      }

      const user = await User.findByUsername(username);
      if (!user) {
        req.session.error = 'Username atau password salah.';
        return res.redirect('/auth/login');
      }

      if (user.status === 'Inactive') {
        req.session.error = 'Akun Anda tidak aktif. Hubungi admin.';
        return res.redirect('/auth/login');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.session.error = 'Username atau password salah.';
        return res.redirect('/auth/login');
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      req.session.token = token;

      await User.updateLastLogin(user.id);

      if (req.body.remember) {
        const rememberToken = crypto.randomBytes(32).toString('hex');
        await User.update(user.id, { remember_token: rememberToken });
        res.cookie('remember_token', rememberToken, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'lax',
        });
      }

      delete req.session.captchaAnswer;
      return res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      req.session.error = 'Terjadi kesalahan server.';
      res.redirect('/auth/login');
    }
  },

  showRegister(req, res) {
    User.getEmployeesWithoutUser().then(employees => {
      res.render('auth/register', { employees, title: 'Register User' });
    });
  },

  async register(req, res) {
    try {
      const { username, email, password, employee_id, role } = req.body;

      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        req.session.error = 'Username sudah digunakan.';
        return res.redirect('/auth/register');
      }

      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        req.session.error = 'Email sudah digunakan.';
        return res.redirect('/auth/register');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        username,
        email,
        password: hashedPassword,
        employee_id: employee_id || null,
        role: role || 'Employee',
      });

      req.session.success = 'User berhasil didaftarkan.';
      res.redirect('/users');
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal mendaftarkan user.';
      res.redirect('/auth/register');
    }
  },

  logout(req, res) {
    res.clearCookie('remember_token');
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  },

  showForgotPassword(req, res) {
    res.render('auth/forgot-password', { title: 'Lupa Password' });
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        req.session.error = 'Email tidak ditemukan.';
        return res.redirect('/auth/forgot-password');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000);

      await User.update(user.id, {
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires,
      });

      const resetLink = `/auth/reset/${resetToken}`;
      res.render('auth/forgot-password', {
        title: 'Lupa Password',
        resetLink,
        resetSent: true,
      });
    } catch (err) {
      console.error(err);
      req.session.error = 'Terjadi kesalahan.';
      res.redirect('/auth/forgot-password');
    }
  },

  showResetPassword(req, res) {
    User.findByResetToken(req.params.token).then(user => {
      if (!user) {
        req.session.error = 'Token tidak valid atau sudah kadaluarsa.';
        return res.redirect('/auth/forgot-password');
      }
      res.render('auth/reset-password', { title: 'Reset Password', token: req.params.token });
    });
  },

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findByResetToken(token);
      if (!user) {
        req.session.error = 'Token tidak valid atau sudah kadaluarsa.';
        return res.redirect('/auth/forgot-password');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.update(user.id, {
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      });

      req.session.success = 'Password berhasil direset. Silakan login.';
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      req.session.error = 'Gagal mereset password.';
      res.redirect('/auth/forgot-password');
    }
  },
};

module.exports = authController;
