const prisma = require('../config/database');

const LOW_STOCK_THRESHOLD = 10;

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getEndOfToday = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

const getDashboardStats = async () => {
  const startOfToday = getStartOfToday();
  const endOfToday = getEndOfToday();

  const [
    totalProducts,
    totalSuppliers,
    totalStores,
    totalUsers,
    todaySales,
    lowStockItems,
    recentTransactions,
  ] = await Promise.all([
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.supplier.count({ where: { isActive: true } }),
    prisma.store.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.sale.findMany({
      where: {
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
      select: { total: true },
    }),
    prisma.storeStock.findMany({
      where: { quantity: { lte: LOW_STOCK_THRESHOLD } },
      include: {
        product: { select: { id: true, name: true, barcode: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { quantity: 'asc' },
      take: 10,
    }),
    prisma.sale.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        store: { select: { name: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  const todaySalesCount = todaySales.length;
  const todayRevenue = todaySales.reduce((sum, sale) => sum + Number(sale.total), 0);

  const salesChart = await getSalesChart(7);

  return {
    totalProducts,
    totalSuppliers,
    totalStores,
    totalUsers,
    todaySalesCount,
    todayRevenue,
    lowStockItems,
    salesChart,
    recentTransactions,
  };
};

const getSalesChart = async (days = 7) => {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: date, lt: nextDate },
      },
      select: { total: true },
    });

    const revenue = sales.reduce((sum, s) => sum + Number(s.total), 0);

    result.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
      transactions: sales.length,
      revenue,
    });
  }

  return result;
};

module.exports = { getDashboardStats };