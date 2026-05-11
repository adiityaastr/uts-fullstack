const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/register', isAuthenticated, isAdmin, authController.showRegister);
router.post('/register', isAuthenticated, isAdmin, authController.register);
router.get('/logout', isAuthenticated, authController.logout);
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset/:token', authController.showResetPassword);
router.post('/reset/:token', authController.resetPassword);

module.exports = router;
