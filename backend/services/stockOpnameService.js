const prisma = require('../config/database');

const adjustmentInclude = {
  store: { select: { id: true, name: true } },
  product: { select: { id: true, barcode: true, name: true } },
};

const getOpnameHistory = async (storeId) => {
  const where = storeId ? { storeId: Number(storeId) } : {};

  return prisma.stockAdjustment.findMany({
    where,
    include: adjustmentInclude,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
};

const getProductStockForOpname = async (storeId, productId) => {
  const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
  if (!store) {
    const error = new Error('Gerai tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product) {
    const error = new Error('Produk tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  const stock = await prisma.storeStock.findUnique({
    where: {
      storeId_productId: { storeId: Number(storeId), productId: Number(productId) },
    },
  });

  return {
    store,
    product: {
      id: product.id,
      barcode: product.barcode,
      name: product.name,
    },
    systemQty: stock?.quantity || 0,
  };
};

const createStockOpname = async (data) => {
  const { storeId, productId, physicalQty, notes } = data;

  if (!storeId || !productId || physicalQty === undefined) {
    const error = new Error('Gerai, produk, dan jumlah fisik wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  if (Number(physicalQty) < 0) {
    const error = new Error('Jumlah fisik tidak boleh negatif');
    error.statusCode = 400;
    throw error;
  }

  const { systemQty } = await getProductStockForOpname(storeId, productId);
  const physical = Number(physicalQty);
  const difference = physical - systemQty;

  const result = await prisma.$transaction(async (tx) => {
    const adjustment = await tx.stockAdjustment.create({
      data: {
        storeId: Number(storeId),
        productId: Number(productId),
        previousQty: systemQty,
        physicalQty: physical,
        difference,
        notes: notes?.trim() || null,
      },
      include: adjustmentInclude,
    });

    if (difference !== 0) {
      const existing = await tx.storeStock.findUnique({
        where: {
          storeId_productId: { storeId: Number(storeId), productId: Number(productId) },
        },
      });

      if (existing) {
        await tx.storeStock.update({
          where: { id: existing.id },
          data: { quantity: physical },
        });
      } else if (physical > 0) {
        await tx.storeStock.create({
          data: {
            storeId: Number(storeId),
            productId: Number(productId),
            quantity: physical,
          },
        });
      }
    }

    return adjustment;
  });

  return result;
};

module.exports = {
  getOpnameHistory,
  getProductStockForOpname,
  createStockOpname,
};