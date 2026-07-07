const prisma = require('../config/database');

const getAllStores = async () => {
  return prisma.store.findMany({
    orderBy: { name: 'asc' },
  });
};

const getStoreById = async (id) => {
  const store = await prisma.store.findUnique({ where: { id: Number(id) } });
  if (!store) {
    const error = new Error('Gerai tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }
  return store;
};

const createStore = async (data) => {
  const { name, address, phone, isActive } = data;

  if (!name || name.trim() === '') {
    const error = new Error('Nama gerai wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  return prisma.store.create({
    data: {
      name: name.trim(),
      address: address?.trim() || null,
      phone: phone?.trim() || null,
      isActive: isActive !== undefined ? isActive : true,
    },
  });
};

const updateStore = async (id, data) => {
  await getStoreById(id);

  const { name, address, phone, isActive } = data;

  if (name !== undefined && name.trim() === '') {
    const error = new Error('Nama gerai wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  return prisma.store.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(address !== undefined && { address: address?.trim() || null }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(isActive !== undefined && { isActive }),
    },
  });
};

const deleteStore = async (id) => {
  await getStoreById(id);

  const userCount = await prisma.user.count({ where: { storeId: Number(id) } });
  if (userCount > 0) {
    const error = new Error('Gerai tidak dapat dihapus karena masih memiliki user');
    error.statusCode = 400;
    throw error;
  }

  return prisma.store.delete({ where: { id: Number(id) } });
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
};