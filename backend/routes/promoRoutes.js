const express = require('express');
const promoController = require('../controllers/promoController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', promoController.getAll);
router.get('/:id', promoController.getById);
router.post('/', promoController.create);
router.put('/:id', promoController.update);
router.delete('/:id', promoController.remove);

module.exports = router;