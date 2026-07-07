const express = require('express');
const stockController = require('../controllers/stockController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

const router = express.Router();

router.use(authenticate);

router.get('/my-store', authorize('KASIR'), stockController.getMyStore);

router.get('/matrix', authorize('ADMIN'), stockController.getMatrix);
router.get('/store/:storeId', authorize('ADMIN'), stockController.getByStore);
router.get('/', authorize('ADMIN'), stockController.getAll);

module.exports = router;