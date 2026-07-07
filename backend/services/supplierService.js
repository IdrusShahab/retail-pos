const prisma = require('../config/database');

const getAllSuppliers = async () => {
  return prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });
};

const getSupplierById = async (id) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: Number(id) },
    include: {
      _count: { select: { products: true } },
    },
  });

  if (!supplier) {
    const error = new Error('Supplier tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return supplier;
};

const createSupplier = async (data) => {
  const { name, contact, phone, email, address, isActive } = data;

  if (!name || name.trim() === '') {
    const error = new Error('Nama supplier wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  return prisma.supplier.create({
    data: {
      name: name.trim(),
      contact: contact?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      isActive: isActive !== undefined ? isActive : true,
    },
  });
};

const updateSupplier = async (id, data) => {
  await getSupplierById(id);

  const { name, contact, phone, email, address, isActive } = data;

  if (name !== undefined && name.trim() === '') {
    const error = new Error('Nama supplier wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  return prisma.supplier.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(contact !== undefined && { contact: contact?.trim() || null }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(email !== undefined && { email: email?.trim() || null }),
      ...(address !== undefined && { address: address?.trim() || null }),
      ...(isActive !== undefined && { isActive }),
    },
  });
};

const deleteSupplier = async (id) => {
  await getSupplierById(id);

  const productCount = await prisma.product.count({
    where: { supplierId: Number(id) },
  });

  if (productCount > 0) {
    const error = new Error('Supplier tidak dapat dihapus karena masih memiliki produk');
    error.statusCode = 400;
    throw error;
  }

  return prisma.supplier.delete({ where: { id: Number(id) } });
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};