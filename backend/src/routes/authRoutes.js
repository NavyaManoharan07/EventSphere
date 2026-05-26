const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getUserProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  startOAuth,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/oauth/:provider', startOAuth);
router.post('/oauth/:provider', startOAuth);
router.get('/me', protect, getMe);
router.get('/user/:userId', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
