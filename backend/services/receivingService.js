const prisma = require('../config/database');
const { incrementStock } = require('./stockService');

const receivingInclude = {
  store: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  receivingDetails: {
    include: {
      product: {
        select: { id: true, barcode: true, name: true },
      },
    },
  },
};

const getAllReceivings = async () => {
  return prisma.receiving.findMany({
    include: receivingInclude,
    orderBy: { createdAt: 'desc' },
  });
};

const getReceivingById = async (id) => {
  const receiving = await prisma.receiving.findUnique({
    where: { id: Number(id) },
    include: receivingInclude,
  });

  if (!receiving) {
    const error = new Error('Receiving tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return receiving;
};

const createReceiving = async (data) => {
  const { storeId, supplierId, notes, items } = data;

  if (!storeId || !supplierId || !items || items.length === 0) {
    const error = new Error('Gerai, supplier, dan minimal 1 item wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
  if (!store) {
    const error = new Error('Gerai tidak ditemukan');
    error.statusCode = 400;
    throw error;
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: Number(supplierId) } });
  if (!supplier) {
    const error = new Error('Supplier tidak ditemukan');
    error.statusCode = 400;
    throw error;
  }

  for (const item of items) {
    if (!item.productId || !item.quantity || item.price === undefined) {
      const error = new Error('Setiap item harus memiliki produk, qty, dan harga');
      error.statusCode = 400;
      throw error;
    }
    if (Number(item.quantity) < 1) {
      const error = new Error('Qty minimal 1');
      error.statusCode = 400;
      throw error;
    }
    if (Number(item.price) < 0) {
      const error = new Error('Harga tidak boleh negatif');
      error.statusCode = 400;
      throw error;
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(item.productId) },
    });
    if (!product) {
      const error = new Error(`Produk ID ${item.productId} tidak ditemukan`);
      error.statusCode = 400;
      throw error;
    }
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price),
    0
  );

  const receiving = await prisma.$transaction(async (tx) => {
    const newReceiving = await tx.receiving.create({
      data: {
        storeId: Number(storeId),
        supplierId: Number(supplierId),
        total,
        notes: notes?.trim() || null,
        receivingDetails: {
          create: items.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      },
      include: receivingInclude,
    });

    for (const item of items) {
      await incrementStock(
        tx,
        Number(storeId),
        Number(item.productId),
        Number(item.quantity)
      );
    }

    return newReceiving;
  });

  return receiving;
};

module.exports = {
  getAllReceivings,
  getReceivingById,
  createReceiving,
};