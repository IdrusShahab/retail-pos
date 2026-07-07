const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/response');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return sendSuccess(res, stats, 'Data dashboard berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };