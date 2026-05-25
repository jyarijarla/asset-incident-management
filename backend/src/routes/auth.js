const express = require('express');
const router = express.Router();
const { register, registerOrg, login, getIndustries, forgotPassword, resetPassword } = require('../controllers/authController');

router.get('/industries', getIndustries);
router.post('/register-org', registerOrg);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;