const bcrypt = require('bcrypt');
const prisma = require('../config/database');

const SALT_ROUNDS = 10;

const userSelect = {
  id: true,
  username: true,
  name: true,
  role: true,
  storeId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  store: {
    select: { id: true, name: true },
  },
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { name: 'asc' },
  });
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: userSelect,
  });

  if (!user) {
    const error = new Error('User tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const createUser = async (data) => {
  const { username, password, name, role, storeId, isActive } = data;

  if (!username || !password || !name || !role) {
    const error = new Error('Username, password, nama, dan role wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  if (!['ADMIN', 'KASIR'].includes(role)) {
    const error = new Error('Role harus ADMIN atau KASIR');
    error.statusCode = 400;
    throw error;
  }

  if (role === 'KASIR' && !storeId) {
    const error = new Error('Kasir wajib memiliki gerai');
    error.statusCode = 400;
    throw error;
  }

  if (storeId) {
    const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
    if (!store) {
      const error = new Error('Gerai tidak ditemukan');
      error.statusCode = 400;
      throw error;
    }
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      username: username.trim(),
      password: hashedPassword,
      name: name.trim(),
      role,
      storeId: storeId ? Number(storeId) : null,
      isActive: isActive !== undefined ? isActive : true,
    },
    select: userSelect,
  });
};

const updateUser = async (id, data) => {
  await getUserById(id);

  const { username, password, name, role, storeId, isActive } = data;

  if (role && !['ADMIN', 'KASIR'].includes(role)) {
    const error = new Error('Role harus ADMIN atau KASIR');
    error.statusCode = 400;
    throw error;
  }

  if (role === 'KASIR' && storeId === null) {
    const error = new Error('Kasir wajib memiliki gerai');
    error.statusCode = 400;
    throw error;
  }

  if (storeId) {
    const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
    if (!store) {
      const error = new Error('Gerai tidak ditemukan');
      error.statusCode = 400;
      throw error;
    }
  }

  const updateData = {
    ...(username !== undefined && { username: username.trim() }),
    ...(name !== undefined && { name: name.trim() }),
    ...(role !== undefined && { role }),
    ...(storeId !== undefined && { storeId: storeId ? Number(storeId) : null }),
    ...(isActive !== undefined && { isActive }),
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
    select: userSelect,
  });
};

const deleteUser = async (id) => {
  const user = await getUserById(id);

  if (user.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN', isActive: true },
    });
    if (adminCount <= 1) {
      const error = new Error('Tidak dapat menghapus admin terakhir');
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.user.delete({ where: { id: Number(id) } });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};