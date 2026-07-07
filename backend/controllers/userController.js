const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return sendSuccess(res, users, 'Data user berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user, 'Data user berhasil diambil');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, user, 'User berhasil ditambahkan', 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, user, 'User berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return sendSuccess(res, null, 'User berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };