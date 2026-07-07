const receivingService = require('../services/receivingService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const receivings = await receivingService.getAllReceivings();
    return sendSuccess(res, receivings, 'Data receiving berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const receiving = await receivingService.getReceivingById(req.params.id);
    return sendSuccess(res, receiving, 'Data receiving berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const receiving = await receivingService.createReceiving(req.body);
    return sendSuccess(res, receiving, 'Receiving berhasil disimpan, stok telah diperbarui', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create };