const productService = require('../services/productService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    return sendSuccess(res, products, 'Data produk berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, product, 'Data produk berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, product, 'Produk berhasil ditambahkan', 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, product, 'Produk berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return sendSuccess(res, null, 'Produk berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };