const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', dashboardController.getStats);

module.exports = router;