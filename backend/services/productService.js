const prisma = require('../config/database');

const productInclude = {
  supplier: {
    select: { id: true, name: true },
  },
};

const validatePrices = (buyPrice, sellPrice) => {
  if (buyPrice !== undefined && Number(buyPrice) < 0) {
    const error = new Error('Harga beli tidak boleh negatif');
    error.statusCode = 400;
    throw error;
  }
  if (sellPrice !== undefined && Number(sellPrice) < 0) {
    const error = new Error('Harga jual tidak boleh negatif');
    error.statusCode = 400;
    throw error;
  }
};

const getAllProducts = async () => {
  return prisma.product.findMany({
    include: productInclude,
    orderBy: { name: 'asc' },
  });
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: productInclude,
  });

  if (!product) {
    const error = new Error('Produk tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return product;
};

const createProduct = async (data) => {
  const { barcode, name, category, buyPrice, sellPrice, supplierId, status } = data;

  if (!barcode || !name || !category || buyPrice === undefined || sellPrice === undefined || !supplierId) {
    const error = new Error('Barcode, nama, kategori, harga beli, harga jual, dan supplier wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  validatePrices(buyPrice, sellPrice);

  const supplier = await prisma.supplier.findUnique({ where: { id: Number(supplierId) } });
  if (!supplier) {
    const error = new Error('Supplier tidak ditemukan');
    error.statusCode = 400;
    throw error;
  }

  return prisma.product.create({
    data: {
      barcode: barcode.trim(),
      name: name.trim(),
      category: category.trim(),
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      supplierId: Number(supplierId),
      status: status || 'ACTIVE',
    },
    include: productInclude,
  });
};

const updateProduct = async (id, data) => {
  await getProductById(id);

  const { barcode, name, category, buyPrice, sellPrice, supplierId, status } = data;

  if (name !== undefined && name.trim() === '') {
    const error = new Error('Nama produk wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  validatePrices(buyPrice, sellPrice);

  if (supplierId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: Number(supplierId) } });
    if (!supplier) {
      const error = new Error('Supplier tidak ditemukan');
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(barcode !== undefined && { barcode: barcode.trim() }),
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category: category.trim() }),
      ...(buyPrice !== undefined && { buyPrice: Number(buyPrice) }),
      ...(sellPrice !== undefined && { sellPrice: Number(sellPrice) }),
      ...(supplierId !== undefined && { supplierId: Number(supplierId) }),
      ...(status !== undefined && { status }),
    },
    include: productInclude,
  });
};

const deleteProduct = async (id) => {
  await getProductById(id);

  const [stockCount, salesCount] = await Promise.all([
    prisma.storeStock.count({ where: { productId: Number(id) } }),
    prisma.salesDetail.count({ where: { productId: Number(id) } }),
  ]);

  if (stockCount > 0 || salesCount > 0) {
    const error = new Error('Produk tidak dapat dihapus karena sudah memiliki stok atau transaksi');
    error.statusCode = 400;
    throw error;
  }

  return prisma.product.delete({ where: { id: Number(id) } });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};