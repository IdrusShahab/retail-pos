const posService = require('../services/posService');
const { sendSuccess, sendError } = require('../utils/response');

const scanBarcode = async (req, res, next) => {
  try {
    if (!req.user.storeId) {
      return sendError(res, 'Kasir tidak memiliki gerai', 400);
    }

    const product = await posService.scanBarcode(
      req.params.barcode,
      req.user.storeId
    );
    return sendSuccess(res, product, 'Produk ditemukan');
  } catch (error) {
    next(error);
  }
};

const checkout = async (req, res, next) => {
  try {
    const sale = await posService.createSale(req.body, req.user);
    return sendSuccess(res, sale, 'Transaksi berhasil', 201);
  } catch (error) {
    next(error);
  }
};

const getSale = async (req, res, next) => {
  try {
    const sale = await posService.getSaleById(req.params.id, req.user);
    return sendSuccess(res, sale, 'Data transaksi berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const validatePromo = async (req, res, next) => {
  try {
    if (!req.user.storeId) {
      return sendError(res, 'Kasir tidak memiliki gerai', 400);
    }
    const promoService = require('../services/promoService');
    const result = await promoService.validatePromoCode(
      req.body.code,
      req.user.storeId,
      req.body.items
    );
    return sendSuccess(res, result, 'Promo valid');
  } catch (error) {
    next(error);
  }
};

module.exports = { scanBarcode, checkout, getSale, validatePromo };