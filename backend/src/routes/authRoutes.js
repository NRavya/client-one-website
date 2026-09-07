const express = require('express');
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
