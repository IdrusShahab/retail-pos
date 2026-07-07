const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', authController.login);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;