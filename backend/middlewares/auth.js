const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Token tidak ditemukan', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        storeId: true,
        isActive: true,
        store: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'User tidak ditemukan atau tidak aktif', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Token tidak valid', 401);
  }
};

module.exports = { authenticate };