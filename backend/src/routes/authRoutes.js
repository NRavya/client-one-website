const express = require('express');
const { register, login, adminLogin, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
// Customer login (CUSTOMER only — admins get 403 here).
router.post('/login', login);
// Admin login (ADMIN / SUPER_ADMIN only — used exclusively by /admin).
router.post('/admin/login', adminLogin);
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
