const express = require('express');
const stockOpnameController = require('../controllers/stockOpnameController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/history', stockOpnameController.getHistory);
router.get('/check', stockOpnameController.getProductStock);
router.post('/', stockOpnameController.create);

module.exports = router;