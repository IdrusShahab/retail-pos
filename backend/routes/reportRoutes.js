const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/daily-sales', reportController.getDailySales);
router.get('/monthly-sales', reportController.getMonthlySales);
router.get('/best-products', reportController.getBestProducts);
router.get('/by-store', reportController.getSalesByStore);
router.get('/stock', reportController.getStockReport);
router.get('/low-stock', reportController.getLowStock);
router.get('/sales-chart', reportController.getSalesChart);

module.exports = router;