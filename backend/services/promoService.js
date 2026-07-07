const prisma = require('../config/database');

const promoInclude = {
  product: { select: { id: true, name: true, barcode: true } },
  store: { select: { id: true, name: true } },
};

const getAllPromos = async () => {
  return prisma.promo.findMany({
    include: promoInclude,
    orderBy: { createdAt: 'desc' },
  });
};

const getPromoById = async (id) => {
  const promo = await prisma.promo.findUnique({
    where: { id: Number(id) },
    include: promoInclude,
  });

  if (!promo) {
    const error = new Error('Promo tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return promo;
};

const validatePromoData = async (data, excludeId) => {
  const {
    name, code, discountType, discountValue, minPurchase,
    applyType, category, productId, storeId, startDate, endDate,
  } = data;

  if (!name || !code || !discountType || discountValue === undefined || !startDate || !endDate) {
    const error = new Error('Nama, kode, tipe diskon, nilai, tanggal mulai & akhir wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  if (!['PERCENT', 'FIXED'].includes(discountType)) {
    const error = new Error('Tipe diskon harus PERCENT atau FIXED');
    error.statusCode = 400;
    throw error;
  }

  if (Number(discountValue) < 0) {
    const error = new Error('Nilai diskon tidak boleh negatif');
    error.statusCode = 400;
    throw error;
  }

  if (discountType === 'PERCENT' && Number(discountValue) > 100) {
    const error = new Error('Diskon persen maksimal 100%');
    error.statusCode = 400;
    throw error;
  }

  if (new Date(startDate) > new Date(endDate)) {
    const error = new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
    error.statusCode = 400;
    throw error;
  }

  if (applyType === 'PRODUCT' && !productId) {
    const error = new Error('Produk wajib dipilih untuk promo produk');
    error.statusCode = 400;
    throw error;
  }

  if (applyType === 'CATEGORY' && !category) {
    const error = new Error('Kategori wajib dipilih untuk promo kategori');
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

  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) {
      const error = new Error('Produk tidak ditemukan');
      error.statusCode = 400;
      throw error;
    }
  }

  const existingCode = await prisma.promo.findFirst({
    where: {
      code: code.trim().toUpperCase(),
      ...(excludeId && { id: { not: Number(excludeId) } }),
    },
  });

  if (existingCode) {
    const error = new Error('Kode promo sudah digunakan');
    error.statusCode = 409;
    throw error;
  }
};

const buildPromoData = (data) => {
  const {
    name, code, discountType, discountValue, minPurchase,
    applyType, category, productId, storeId, startDate, endDate, isActive,
  } = data;

  return {
    name: name.trim(),
    code: code.trim().toUpperCase(),
    discountType,
    discountValue: Number(discountValue),
    minPurchase: minPurchase !== undefined ? Number(minPurchase) : 0,
    applyType: applyType || 'ALL',
    category: applyType === 'CATEGORY' ? category?.trim() : null,
    productId: applyType === 'PRODUCT' ? Number(productId) : null,
    storeId: storeId ? Number(storeId) : null,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    isActive: isActive !== undefined ? isActive : true,
  };
};

const createPromo = async (data) => {
  await validatePromoData(data);
  return prisma.promo.create({
    data: buildPromoData(data),
    include: promoInclude,
  });
};

const updatePromo = async (id, data) => {
  await getPromoById(id);
  await validatePromoData(data, id);

  return prisma.promo.update({
    where: { id: Number(id) },
    data: buildPromoData(data),
    include: promoInclude,
  });
};

const deletePromo = async (id) => {
  await getPromoById(id);

  const usedCount = await prisma.sale.count({ where: { promoId: Number(id) } });
  if (usedCount > 0) {
    const error = new Error('Promo tidak dapat dihapus karena sudah digunakan');
    error.statusCode = 400;
    throw error;
  }

  return prisma.promo.delete({ where: { id: Number(id) } });
};

const getApplicableSubtotal = async (promo, items) => {
  const productIds = items.map((i) => Number(i.productId));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, category: true },
  });

  const productMap = {};
  products.forEach((p) => { productMap[p.id] = p; });

  let applicable = 0;

  items.forEach((item) => {
    const product = productMap[Number(item.productId)];
    if (!product) return;

    const itemSubtotal = Number(item.quantity) * Number(item.price);
    let match = false;

    if (promo.applyType === 'ALL') match = true;
    else if (promo.applyType === 'CATEGORY' && product.category === promo.category) match = true;
    else if (promo.applyType === 'PRODUCT' && product.id === promo.productId) match = true;

    if (match) applicable += itemSubtotal;
  });

  return applicable;
};

const calculateDiscount = (promo, applicableSubtotal) => {
  if (applicableSubtotal <= 0) return 0;

  if (promo.discountType === 'PERCENT') {
    return Math.round(applicableSubtotal * (Number(promo.discountValue) / 100));
  }

  return Math.min(Number(promo.discountValue), applicableSubtotal);
};

const validatePromoCode = async (code, storeId, items) => {
  const promo = await prisma.promo.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: promoInclude,
  });

  if (!promo) {
    const error = new Error('Kode promo tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (!promo.isActive) {
    const error = new Error('Promo tidak aktif');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  if (now < promo.startDate || now > promo.endDate) {
    const error = new Error('Promo sudah tidak berlaku');
    error.statusCode = 400;
    throw error;
  }

  if (promo.storeId && promo.storeId !== Number(storeId)) {
    const error = new Error('Promo tidak berlaku di gerai ini');
    error.statusCode = 400;
    throw error;
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price), 0
  );

  if (subtotal < Number(promo.minPurchase)) {
    const error = new Error(`Minimal belanja ${Number(promo.minPurchase).toLocaleString('id-ID')}`);
    error.statusCode = 400;
    throw error;
  }

  const applicableSubtotal = await getApplicableSubtotal(promo, items);
  const discountAmount = calculateDiscount(promo, applicableSubtotal);

  if (discountAmount <= 0) {
    const error = new Error('Promo tidak berlaku untuk item di keranjang');
    error.statusCode = 400;
    throw error;
  }

  return {
    promo: {
      id: promo.id,
      name: promo.name,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
    },
    subtotal,
    discountAmount,
    total: subtotal - discountAmount,
  };
};

const resolvePromoForCheckout = async (promoCode, storeId, items) => {
  if (!promoCode) {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.price), 0
    );
    return { promoId: null, subtotal, discountAmount: 0, total: subtotal };
  }

  const result = await validatePromoCode(promoCode, storeId, items);
  return {
    promoId: result.promo.id,
    subtotal: result.subtotal,
    discountAmount: result.discountAmount,
    total: result.total,
    promo: result.promo,
  };
};

module.exports = {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  validatePromoCode,
  resolvePromoForCheckout,
};