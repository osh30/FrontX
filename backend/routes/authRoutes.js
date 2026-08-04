const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin, getMe, logoutUser } = require('../controllers/authController');
const { requestOtp, verifyOtp, resetPassword } = require('../controllers/passwordResetController');
const { protect } = require('../middleware/auth');
const { verifyTurnstile } = require('../middleware/turnstile');

// Registration with logging
router.post('/register', verifyTurnstile, (req, res, next) => {
  console.log('📝 Registration request received:', req.body);
  next();
}, registerUser);

router.post('/login', verifyTurnstile, loginUser);
router.post('/admin/login', verifyTurnstile, loginAdmin);

// Password reset (student / alumni / recruiter only)
router.post('/forgot-password', verifyTurnstile, requestOtp);
router.post('/verify-otp', verifyTurnstile, verifyOtp);
router.post('/reset-password', verifyTurnstile, resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);

module.exports = router;