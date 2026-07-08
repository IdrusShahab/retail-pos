const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const stores = await Promise.all([
    prisma.store.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Gerai A', address: 'Jl. Merdeka No. 1', phone: '0811111111' },
    }),
    prisma.store.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Gerai B', address: 'Jl. Sudirman No. 2', phone: '0812222222' },
    }),
    prisma.store.upsert({
      where: { id: 3 },
      update: {},
      create: { name: 'Gerai C', address: 'Jl. Gatot Subroto No. 3', phone: '0813333333' },
    }),
    prisma.store.upsert({
      where: { id: 4 },
      update: {},
      create: { name: 'Gerai D', address: 'Jl. Diponegoro No. 4', phone: '0814444444' },
    }),
    prisma.store.upsert({
      where: { id: 5 },
      update: {},
      create: { name: 'Gerai E', address: 'Jl. Ahmad Yani No. 5', phone: '0815555555' },
    }),
  ]);

  console.log(`Created ${stores.length} stores`);

  const adminPassword = await bcrypt.hash('idrus123', 10);
  const kasirPassword = await bcrypt.hash('kasir123', 10);

  await prisma.user.deleteMany({ where: { username: 'admin' } });

  const admin = await prisma.user.upsert({
    where: { username: 'adminidrus' },
    update: { password: adminPassword },
    create: {
      username: 'adminidrus',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  const kasir = await prisma.user.upsert({
    where: { username: 'kasir1' },
    update: {},
    create: {
      username: 'kasir1',
      password: kasirPassword,
      name: 'Kasir Gerai A',
      role: 'KASIR',
      storeId: 1,
    },
  });

  console.log('Created users:', { admin: admin.username, kasir: kasir.username });

  const supplierData = [
    { name: 'PT Indofood Sukses Makmur', contact: 'Budi', phone: '021-1234567', email: 'budi@indofood.com' },
    { name: 'PT Wings Surya', contact: 'Siti', phone: '021-7654321', email: 'siti@wings.com' },
    { name: 'PT Unilever Indonesia', contact: 'Andi', phone: '021-9876543', email: 'andi@unilever.com' },
  ];

  const suppliers = [];
  for (const s of supplierData) {
    const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!existing) {
      suppliers.push(await prisma.supplier.create({ data: s }));
    } else {
      suppliers.push(existing);
    }
  }
  console.log(`Suppliers: ${suppliers.length}`);

  const productData = [
    { barcode: '8991002130010', name: 'Indomie Goreng', category: 'Makanan', buyPrice: 2500, sellPrice: 3500, supplierId: suppliers[0].id },
    { barcode: '8996001614010', name: 'Aqua 600ml', category: 'Minuman', buyPrice: 2000, sellPrice: 3000, supplierId: suppliers[1].id },
    { barcode: '8999999012345', name: 'Chitato Sapi Panggang', category: 'Snack', buyPrice: 8000, sellPrice: 10000, supplierId: suppliers[1].id },
    { barcode: '8999908100010', name: 'Lifebuoy Sabun', category: 'Perawatan', buyPrice: 3500, sellPrice: 5000, supplierId: suppliers[2].id },
    { barcode: '8996001601010', name: 'Teh Botol Sosro', category: 'Minuman', buyPrice: 3000, sellPrice: 4500, supplierId: suppliers[0].id },
  ];

  let productCount = 0;
  for (const p of productData) {
    await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: {},
      create: p,
    });
    productCount++;
  }
  console.log(`Products: ${productCount}`);

  const indomie = await prisma.product.findUnique({ where: { barcode: '8991002130010' } });
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 6);

  const promoData = [
    {
      name: 'Diskon 10% Semua',
      code: 'DISKON10',
      discountType: 'PERCENT',
      discountValue: 10,
      minPurchase: 20000,
      applyType: 'ALL',
      startDate,
      endDate,
    },
    {
      name: 'Potongan Minuman 5rb',
      code: 'MINUM5K',
      discountType: 'FIXED',
      discountValue: 5000,
      minPurchase: 15000,
      applyType: 'CATEGORY',
      category: 'Minuman',
      startDate,
      endDate,
    },
    {
      name: 'Promo Indomie',
      code: 'INDOMIE1K',
      discountType: 'FIXED',
      discountValue: 1000,
      minPurchase: 0,
      applyType: 'PRODUCT',
      productId: indomie?.id,
      startDate,
      endDate,
    },
  ];

  for (const p of promoData) {
    if (p.applyType === 'PRODUCT' && !p.productId) continue;
    await prisma.promo.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }
  console.log(`Promos: ${promoData.length}`);

  console.log('Seed completed!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin: adminidrus / idrus123');
  console.log('  Kasir: kasir1 / kasir123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });