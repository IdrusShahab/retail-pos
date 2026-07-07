const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return sendError(res, `${field} sudah digunakan`, 409);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Data tidak ditemukan', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan server';

  return sendError(res, message, statusCode);
};

module.exports = { errorHandler };