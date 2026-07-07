const express = require('express');
const storeController = require('../controllers/storeController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', storeController.getAll);
router.get('/:id', storeController.getById);
router.post('/', storeController.create);
router.put('/:id', storeController.update);
router.delete('/:id', storeController.remove);

module.exports = router;