const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/response');

const getDailySales = async (req, res, next) => {
  try {
    const { startDate, endDate, storeId } = req.query;
    const data = await reportService.getDailySales(startDate, endDate, storeId);
    return sendSuccess(res, data, 'Laporan penjualan harian berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getMonthlySales = async (req, res, next) => {
  try {
    const { startDate, endDate, storeId } = req.query;
    const data = await reportService.getMonthlySales(startDate, endDate, storeId);
    return sendSuccess(res, data, 'Laporan penjualan bulanan berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getBestProducts = async (req, res, next) => {
  try {
    const { startDate, endDate, storeId, limit } = req.query;
    const data = await reportService.getBestProducts(startDate, endDate, storeId, limit || 10);
    return sendSuccess(res, data, 'Laporan produk terlaris berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getSalesByStore = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await reportService.getSalesByStore(startDate, endDate);
    return sendSuccess(res, data, 'Laporan per gerai berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getStockReport = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const data = await reportService.getStockReport(storeId);
    return sendSuccess(res, data, 'Laporan stok berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const data = await reportService.getLowStockReport(storeId);
    return sendSuccess(res, data, 'Laporan barang hampir habis berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getSalesChart = async (req, res, next) => {
  try {
    const { startDate, endDate, storeId } = req.query;
    const data = await reportService.getSalesChart(startDate, endDate, storeId);
    return sendSuccess(res, data, 'Data grafik berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailySales,
  getMonthlySales,
  getBestProducts,
  getSalesByStore,
  getStockReport,
  getLowStock,
  getSalesChart,
};