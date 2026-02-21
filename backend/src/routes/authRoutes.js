const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  verifyRegistration,
  loginUser, 
  verifyLogin,
  resendOTP,
  getUserProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/verify-registration', verifyRegistration);
router.post('/login', loginUser);
router.post('/verify-login', verifyLogin);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/profile', protect, getUserProfile);

module.exports = router;
