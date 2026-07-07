import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getDashboardStats } from '../services/dashboardService';
import { formatCurrency, formatDate } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const summaryCards = [
    { label: 'Total Produk', value: stats?.totalProducts || 0, icon: 'bi-box-seam', color: 'primary' },
    { label: 'Total Supplier', value: stats?.totalSuppliers || 0, icon: 'bi-truck', color: 'warning' },
    { label: 'Total Gerai', value: stats?.totalStores || 0, icon: 'bi-shop', color: 'info' },
    { label: 'Total User', value: stats?.totalUsers || 0, icon: 'bi-people', color: 'success' },
  ];

  const salesCards = [
    { label: 'Penjualan Hari Ini', value: stats?.todaySalesCount || 0, icon: 'bi-receipt', color: 'primary', suffix: ' transaksi' },
    { label: 'Omzet Hari Ini', value: formatCurrency(stats?.todayRevenue || 0), icon: 'bi-cash-stack', color: 'success', isCurrency: true },
  ];

  const chartData = {
    labels: stats?.salesChart?.map((d) => d.label) || [],
    datasets: [
      {
        label: 'Omzet (Rp)',
        data: stats?.salesChart?.map((d) => d.revenue) || [],
        backgroundColor: 'rgba(13, 110, 253, 0.7)',
        borderRadius: 6,
      },
      {
        label: 'Transaksi',
        data: stats?.salesChart?.map((d) => d.transactions) || [],
        backgroundColor: 'rgba(25, 135, 84, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div>
      <div className="page-header">
        <h4 className="mb-0">
          <i className="bi bi-speedometer2 me-2"></i>Dashboard
        </h4>
        <p className="text-muted mb-0">Ringkasan bisnis Retail POS</p>
      </div>

      <div className="row g-4 mb-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="col-sm-6 col-lg-3">
            <div className={`stat-card border-${card.color}`}>
              <div className={`stat-icon bg-${card.color} bg-opacity-10 text-${card.color}`}>
                <i className={`bi ${card.icon}`}></i>
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{card.value}</h3>
                <small className="text-muted">{card.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {salesCards.map((card) => (
          <div key={card.label} className="col-sm-6">
            <div className={`stat-card border-${card.color}`}>
              <div className={`stat-icon bg-${card.color} bg-opacity-10 text-${card.color}`}>
                <i className={`bi ${card.icon}`}></i>
              </div>
              <div>
                <h3 className="mb-0 fw-bold">
                  {card.isCurrency ? card.value : `${card.value}${card.suffix || ''}`}
                </h3>
                <small className="text-muted">{card.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>Grafik Penjualan (7 Hari Terakhir)
              </h6>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2 text-warning"></i>Produk Hampir Habis
              </h6>
            </div>
            <div className="card-body p-0">
              {stats?.lowStockItems?.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">
                  <i className="bi bi-check-circle text-success me-1"></i>
                  Semua stok aman
                </p>
              ) : (
                <ul className="list-group list-group-flush">
                  {stats?.lowStockItems?.map((item) => (
                    <li key={`${item.storeId}-${item.productId}`} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <small className="fw-semibold d-block">{item.product.name}</small>
                        <small className="text-muted">{item.store.name}</small>
                      </div>
                      <span className="badge bg-danger">{item.quantity} unit</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h6 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>Transaksi Terbaru
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Invoice</th>
                  <th>Gerai</th>
                  <th>Kasir</th>
                  <th>Total</th>
                  <th>Pembayaran</th>
                  <th className="pe-3">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentTransactions?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      Belum ada transaksi
                    </td>
                  </tr>
                ) : (
                  stats?.recentTransactions?.map((tx) => (
                    <tr key={tx.id}>
                      <td className="ps-3"><code>{tx.invoiceNumber}</code></td>
                      <td>{tx.store?.name}</td>
                      <td>{tx.user?.name}</td>
                      <td className="fw-semibold">{formatCurrency(tx.total)}</td>
                      <td>
                        <span className="badge bg-secondary">{tx.paymentMethod}</span>
                      </td>
                      <td className="pe-3">{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;