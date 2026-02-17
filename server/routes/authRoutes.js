const express = require('express');
const router = express.Router();
const {
    sendOTP,
    verifyOTPAndSetPassword,
    resendOTP,
    login,
    createAdmin,
    getMe,
    updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
    sendOTPValidation,
    verifyOTPValidation,
    resendOTPValidation,
    loginValidation,
    createAdminValidation,
    validate
} = require('../middleware/validation');

// Public routes - User Registration Flow
router.post('/send-otp', sendOTPValidation, validate, sendOTP);
router.post('/verify-otp', verifyOTPValidation, validate, verifyOTPAndSetPassword);
router.post('/resend-otp', resendOTPValidation, validate, resendOTP);
router.post('/login', loginValidation, validate, login);

// Admin creation route (Developer only)
router.post('/create-admin', createAdminValidation, validate, createAdmin);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;