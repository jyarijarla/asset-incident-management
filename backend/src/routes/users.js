const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { getAllUsers, getUserById, getMe, updateUser, deleteUser } = require('../controllers/usersController');

router.get('/me', auth, getMe);
router.get('/', auth, requireRole('admin'), getAllUsers);
router.get('/:id', auth, requireRole('admin'), getUserById);
router.put('/:id', auth, requireRole('admin'), updateUser);
router.delete('/:id', auth, requireRole('admin'), deleteUser);

module.exports = router;