const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');

const login = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      store: {
        select: { id: true, name: true, address: true },
      },
    },
  });

  if (!user || !user.isActive) {
    const error = new Error('Username atau password salah');
    error.statusCode = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const error = new Error('Username atau password salah');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
    storeId: user.storeId,
  });

  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};

module.exports = { login };