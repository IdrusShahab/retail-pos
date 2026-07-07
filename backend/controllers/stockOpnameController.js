const stockOpnameService = require('../services/stockOpnameService');
const { sendSuccess } = require('../utils/response');

const getHistory = async (req, res, next) => {
  try {
    const history = await stockOpnameService.getOpnameHistory(req.query.storeId);
    return sendSuccess(res, history, 'Riwayat stock opname berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getProductStock = async (req, res, next) => {
  try {
    const data = await stockOpnameService.getProductStockForOpname(
      req.query.storeId,
      req.query.productId
    );
    return sendSuccess(res, data, 'Data stok sistem berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const adjustment = await stockOpnameService.createStockOpname(req.body);
    return sendSuccess(res, adjustment, 'Stock opname berhasil disimpan', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = { getHistory, getProductStock, create };