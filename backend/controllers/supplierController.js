const supplierService = require('../services/supplierService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    return sendSuccess(res, suppliers, 'Data supplier berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);
    return sendSuccess(res, supplier, 'Data supplier berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    return sendSuccess(res, supplier, 'Supplier berhasil ditambahkan', 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    return sendSuccess(res, supplier, 'Supplier berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await supplierService.deleteSupplier(req.params.id);
    return sendSuccess(res, null, 'Supplier berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };