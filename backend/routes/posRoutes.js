const express = require('express');
const posController = require('../controllers/posController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

const router = express.Router();

router.use(authenticate, authorize('KASIR'));

router.get('/scan/:barcode', posController.scanBarcode);
router.post('/validate-promo', posController.validatePromo);
router.post('/checkout', posController.checkout);
router.get('/sales/:id', posController.getSale);

module.exports = router;