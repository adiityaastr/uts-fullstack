const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

router.get('/', isAuthenticated, isAdmin, userController.index);
router.get('/:id/edit', isAuthenticated, isAdmin, userController.showEdit);
router.post('/:id', isAuthenticated, isAdmin, userController.update);
router.post('/:id/delete', isAuthenticated, isAdmin, userController.delete);

module.exports = router;
