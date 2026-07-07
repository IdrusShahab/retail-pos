const prisma = require('../config/database');

const stockInclude = {
  product: {
    select: {
      id: true,
      barcode: true,
      name: true,
      category: true,
      sellPrice: true,
      status: true,
      supplier: { select: { id: true, name: true } },
    },
  },
  store: {
    select: { id: true, name: true },
  },
};

const getStockByStore = async (storeId) => {
  const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
  if (!store) {
    const error = new Error('Gerai tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return prisma.storeStock.findMany({
    where: { storeId: Number(storeId) },
    include: stockInclude,
    orderBy: { product: { name: 'asc' } },
  });
};

const getAllStock = async (storeId) => {
  const where = storeId ? { storeId: Number(storeId) } : {};

  return prisma.storeStock.findMany({
    where,
    include: stockInclude,
    orderBy: [{ store: { name: 'asc' } }, { product: { name: 'asc' } }],
  });
};

const getStockMatrix = async () => {
  const [stores, products, stocks] = await Promise.all([
    prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        barcode: true,
        name: true,
        category: true,
        sellPrice: true,
        supplier: { select: { name: true } },
      },
    }),
    prisma.storeStock.findMany({
      select: { storeId: true, productId: true, quantity: true },
    }),
  ]);

  const stockMap = {};
  stocks.forEach((s) => {
    stockMap[`${s.storeId}-${s.productId}`] = s.quantity;
  });

  const matrix = products.map((product) => ({
    product,
    stocks: stores.map((store) => ({
      storeId: store.id,
      storeName: store.name,
      quantity: stockMap[`${store.id}-${product.id}`] || 0,
    })),
    totalStock: stores.reduce(
      (sum, store) => sum + (stockMap[`${store.id}-${product.id}`] || 0),
      0
    ),
  }));

  return { stores, matrix };
};

const getStockByStoreForKasir = async (storeId) => {
  return getStockByStore(storeId);
};

const incrementStock = async (tx, storeId, productId, quantity) => {
  const existing = await tx.storeStock.findUnique({
    where: { storeId_productId: { storeId, productId } },
  });

  if (existing) {
    return tx.storeStock.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  return tx.storeStock.create({
    data: { storeId, productId, quantity },
  });
};

const decrementStock = async (tx, storeId, productId, quantity) => {
  const stock = await tx.storeStock.findUnique({
    where: { storeId_productId: { storeId, productId } },
  });

  if (!stock || stock.quantity < quantity) {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });
    const error = new Error(`Stok ${product?.name || 'produk'} tidak mencukupi`);
    error.statusCode = 400;
    throw error;
  }

  return tx.storeStock.update({
    where: { id: stock.id },
    data: { quantity: stock.quantity - quantity },
  });
};

const getProductStock = async (storeId, productId) => {
  const stock = await prisma.storeStock.findUnique({
    where: { storeId_productId: { storeId, productId } },
  });
  return stock?.quantity || 0;
};

module.exports = {
  getStockByStore,
  getAllStock,
  getStockMatrix,
  getStockByStoreForKasir,
  incrementStock,
  decrementStock,
  getProductStock,
};