const express = require('express');
const receivingController = require('../controllers/receivingController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', receivingController.getAll);
router.get('/:id', receivingController.getById);
router.post('/', receivingController.create);

module.exports = router;