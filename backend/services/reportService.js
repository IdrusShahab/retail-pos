const prisma = require('../config/database');
const { parseDateRange } = require('../utils/dateRange');

const LOW_STOCK_THRESHOLD = 10;

const getDailySales = async (startDate, endDate, storeId) => {
  const { start, end } = parseDateRange(startDate, endDate);

  const where = {
    createdAt: { gte: start, lte: end },
    ...(storeId && { storeId: Number(storeId) }),
  };

  const sales = await prisma.sale.findMany({
    where,
    select: { createdAt: true, total: true },
    orderBy: { createdAt: 'asc' },
  });

  const grouped = {};
  sales.forEach((sale) => {
    const dateKey = sale.createdAt.toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = { date: dateKey, transactions: 0, revenue: 0 };
    }
    grouped[dateKey].transactions += 1;
    grouped[dateKey].revenue += Number(sale.total);
  });

  return Object.values(grouped).map((row) => ({
    ...row,
    label: new Date(row.date).toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short',
    }),
  }));
};

const getMonthlySales = async (startDate, endDate, storeId) => {
  const { start, end } = parseDateRange(startDate, endDate);

  const where = {
    createdAt: { gte: start, lte: end },
    ...(storeId && { storeId: Number(storeId) }),
  };

  const sales = await prisma.sale.findMany({
    where,
    select: { createdAt: true, total: true },
    orderBy: { createdAt: 'asc' },
  });

  const grouped = {};
  sales.forEach((sale) => {
    const monthKey = sale.createdAt.toISOString().slice(0, 7);
    if (!grouped[monthKey]) {
      grouped[monthKey] = { month: monthKey, transactions: 0, revenue: 0 };
    }
    grouped[monthKey].transactions += 1;
    grouped[monthKey].revenue += Number(sale.total);
  });

  return Object.values(grouped).map((row) => ({
    ...row,
    label: new Date(`${row.month}-01`).toLocaleDateString('id-ID', {
      month: 'long', year: 'numeric',
    }),
  }));
};

const getBestProducts = async (startDate, endDate, storeId, limit = 10) => {
  const { start, end } = parseDateRange(startDate, endDate);

  const details = await prisma.salesDetail.findMany({
    where: {
      sale: {
        createdAt: { gte: start, lte: end },
        ...(storeId && { storeId: Number(storeId) }),
      },
    },
    include: {
      product: { select: { id: true, barcode: true, name: true, category: true } },
    },
  });

  const grouped = {};
  details.forEach((d) => {
    const id = d.productId;
    if (!grouped[id]) {
      grouped[id] = {
        product: d.product,
        totalQty: 0,
        totalRevenue: 0,
      };
    }
    grouped[id].totalQty += d.quantity;
    grouped[id].totalRevenue += Number(d.subtotal);
  });

  return Object.values(grouped)
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, Number(limit));
};

const getSalesByStore = async (startDate, endDate) => {
  const { start, end } = parseDateRange(startDate, endDate);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { store: { select: { id: true, name: true } } },
  });

  const grouped = {};
  sales.forEach((sale) => {
    const id = sale.storeId;
    if (!grouped[id]) {
      grouped[id] = {
        store: sale.store,
        transactions: 0,
        revenue: 0,
      };
    }
    grouped[id].transactions += 1;
    grouped[id].revenue += Number(sale.total);
  });

  return Object.values(grouped).sort((a, b) => b.revenue - a.revenue);
};

const getStockReport = async (storeId) => {
  const where = storeId ? { storeId: Number(storeId) } : {};

  return prisma.storeStock.findMany({
    where,
    include: {
      product: {
        select: { id: true, barcode: true, name: true, category: true, sellPrice: true },
      },
      store: { select: { id: true, name: true } },
    },
    orderBy: [{ store: { name: 'asc' } }, { product: { name: 'asc' } }],
  });
};

const getLowStockReport = async (storeId) => {
  const where = {
    quantity: { lte: LOW_STOCK_THRESHOLD },
    ...(storeId && { storeId: Number(storeId) }),
  };

  return prisma.storeStock.findMany({
    where,
    include: {
      product: { select: { id: true, barcode: true, name: true } },
      store: { select: { id: true, name: true } },
    },
    orderBy: { quantity: 'asc' },
  });
};

const getSalesChart = async (startDate, endDate, storeId) => {
  return getDailySales(startDate, endDate, storeId);
};

module.exports = {
  getDailySales,
  getMonthlySales,
  getBestProducts,
  getSalesByStore,
  getStockReport,
  getLowStockReport,
  getSalesChart,
};