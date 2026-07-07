const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 'Username dan password wajib diisi', 400);
    }

    const result = await authService.login(username, password);
    return sendSuccess(res, result, 'Login berhasil');
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  return sendSuccess(res, req.user, 'Profile berhasil diambil');
};

module.exports = { login, getProfile };