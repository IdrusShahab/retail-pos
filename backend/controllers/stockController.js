const stockService = require('../services/stockService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const stock = await stockService.getAllStock(storeId);
    return sendSuccess(res, stock, 'Data stok berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getMatrix = async (req, res, next) => {
  try {
    const matrix = await stockService.getStockMatrix();
    return sendSuccess(res, matrix, 'Data stok matrix berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getByStore = async (req, res, next) => {
  try {
    const stock = await stockService.getStockByStore(req.params.storeId);
    return sendSuccess(res, stock, 'Data stok gerai berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getMyStore = async (req, res, next) => {
  try {
    if (!req.user.storeId) {
      const error = new Error('Kasir tidak memiliki gerai');
      error.statusCode = 400;
      throw error;
    }
    const stock = await stockService.getStockByStoreForKasir(req.user.storeId);
    return sendSuccess(res, stock, 'Data stok berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getMatrix, getByStore, getMyStore };