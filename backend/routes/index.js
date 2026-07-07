const express = require('express');
const authRoutes = require('./authRoutes');
const storeRoutes = require('./storeRoutes');
const userRoutes = require('./userRoutes');
const supplierRoutes = require('./supplierRoutes');
const productRoutes = require('./productRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const stockRoutes = require('./stockRoutes');
const receivingRoutes = require('./receivingRoutes');
const posRoutes = require('./posRoutes');
const stockOpnameRoutes = require('./stockOpnameRoutes');
const reportRoutes = require('./reportRoutes');
const promoRoutes = require('./promoRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/users', userRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/products', productRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/stock', stockRoutes);
router.use('/receivings', receivingRoutes);
router.use('/pos', posRoutes);
router.use('/stock-opname', stockOpnameRoutes);
router.use('/reports', reportRoutes);
router.use('/promos', promoRoutes);

module.exports = router;