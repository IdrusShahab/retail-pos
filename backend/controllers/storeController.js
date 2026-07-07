const storeService = require('../services/storeService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const stores = await storeService.getAllStores();
    return sendSuccess(res, stores, 'Data gerai berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const store = await storeService.getStoreById(req.params.id);
    return sendSuccess(res, store, 'Data gerai berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const store = await storeService.createStore(req.body);
    return sendSuccess(res, store, 'Gerai berhasil ditambahkan', 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const store = await storeService.updateStore(req.params.id, req.body);
    return sendSuccess(res, store, 'Gerai berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await storeService.deleteStore(req.params.id);
    return sendSuccess(res, null, 'Gerai berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };