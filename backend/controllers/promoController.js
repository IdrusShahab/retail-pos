const promoService = require('../services/promoService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const promos = await promoService.getAllPromos();
    return sendSuccess(res, promos, 'Data promo berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const promo = await promoService.getPromoById(req.params.id);
    return sendSuccess(res, promo, 'Data promo berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const promo = await promoService.createPromo(req.body);
    return sendSuccess(res, promo, 'Promo berhasil ditambahkan', 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const promo = await promoService.updatePromo(req.params.id, req.body);
    return sendSuccess(res, promo, 'Promo berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await promoService.deletePromo(req.params.id);
    return sendSuccess(res, null, 'Promo berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };