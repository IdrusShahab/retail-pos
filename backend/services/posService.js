const prisma = require('../config/database');
const { decrementStock } = require('./stockService');
const { resolvePromoForCheckout } = require('./promoService');

const VALID_PAYMENT_METHODS = ['TUNAI', 'QRIS', 'DEBIT'];

const generateInvoiceNumber = async (tx, storeId) => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  const count = await tx.sale.count({
    where: {
      storeId,
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  return `INV-${storeId}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

const scanBarcode = async (barcode, storeId) => {
  const product = await prisma.product.findUnique({
    where: { barcode: barcode.trim() },
    select: {
      id: true,
      barcode: true,
      name: true,
      category: true,
      sellPrice: true,
      status: true,
    },
  });

  if (!product) {
    const error = new Error('Produk tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (product.status !== 'ACTIVE') {
    const error = new Error('Produk tidak aktif');
    error.statusCode = 400;
    throw error;
  }

  const stock = await prisma.storeStock.findUnique({
    where: {
      storeId_productId: { storeId: Number(storeId), productId: product.id },
    },
  });

  const stockQty = stock?.quantity || 0;

  if (stockQty <= 0) {
    const error = new Error(`Stok ${product.name} habis`);
    error.statusCode = 400;
    throw error;
  }

  return { ...product, stock: stockQty };
};

const createSale = async (data, user) => {
  const { items, paymentMethod, paymentAmount, promoCode } = data;
  const storeId = user.storeId;

  if (!storeId) {
    const error = new Error('Kasir tidak memiliki gerai');
    error.statusCode = 400;
    throw error;
  }

  if (!items || items.length === 0) {
    const error = new Error('Keranjang kosong');
    error.statusCode = 400;
    throw error;
  }

  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    const error = new Error('Metode pembayaran tidak valid');
    error.statusCode = 400;
    throw error;
  }

  if (paymentAmount === undefined || Number(paymentAmount) < 0) {
    const error = new Error('Jumlah pembayaran tidak valid');
    error.statusCode = 400;
    throw error;
  }

  for (const item of items) {
    if (!item.productId || !item.quantity || item.price === undefined) {
      const error = new Error('Data item tidak lengkap');
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
  }

  const promoResult = await resolvePromoForCheckout(promoCode, storeId, items);
  const { promoId, subtotal, discountAmount, total, promo } = promoResult;

  const payAmount = Number(paymentAmount);

  if (paymentMethod === 'TUNAI' && payAmount < total) {
    const error = new Error('Jumlah pembayaran kurang dari total');
    error.statusCode = 400;
    throw error;
  }

  if (paymentMethod !== 'TUNAI' && payAmount < total) {
    const error = new Error('Jumlah pembayaran harus sama dengan total');
    error.statusCode = 400;
    throw error;
  }

  const changeAmount = paymentMethod === 'TUNAI' ? payAmount - total : 0;

  const sale = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: Number(item.productId) },
      });
      if (!product || product.status !== 'ACTIVE') {
        const error = new Error('Produk tidak ditemukan atau tidak aktif');
        error.statusCode = 400;
        throw error;
      }
      await decrementStock(tx, storeId, Number(item.productId), Number(item.quantity));
    }

    const invoiceNumber = await generateInvoiceNumber(tx, storeId);

    return tx.sale.create({
      data: {
        invoiceNumber,
        storeId,
        userId: user.id,
        subtotal,
        discountAmount,
        promoId,
        total,
        paymentMethod,
        paymentAmount: payAmount,
        changeAmount,
        salesDetails: {
          create: items.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price),
            subtotal: Number(item.quantity) * Number(item.price),
          })),
        },
      },
      include: {
        store: { select: { id: true, name: true, address: true, phone: true } },
        user: { select: { id: true, name: true } },
        promo: { select: { id: true, name: true, code: true } },
        salesDetails: {
          include: {
            product: { select: { id: true, barcode: true, name: true } },
          },
        },
      },
    });
  });

  return { ...sale, appliedPromo: promo || null };
};

const getSaleById = async (id, user) => {
  const sale = await prisma.sale.findUnique({
    where: { id: Number(id) },
    include: {
      store: { select: { id: true, name: true, address: true, phone: true } },
      user: { select: { id: true, name: true } },
      promo: { select: { id: true, name: true, code: true } },
      salesDetails: {
        include: {
          product: { select: { id: true, barcode: true, name: true } },
        },
      },
    },
  });

  if (!sale) {
    const error = new Error('Transaksi tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'KASIR' && sale.storeId !== user.storeId) {
    const error = new Error('Akses ditolak');
    error.statusCode = 403;
    throw error;
  }

  return sale;
};

module.exports = {
  scanBarcode,
  createSale,
  getSaleById,
};