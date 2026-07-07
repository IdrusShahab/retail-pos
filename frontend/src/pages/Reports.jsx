import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import {
  getDailySales,
  getMonthlySales,
  getBestProducts,
  getSalesByStore,
  getStockReport,
  getLowStockReport,
  getSalesChart,
} from '../services/reportService';
import { getStores } from '../services/storeService';
import { formatCurrency } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend
);

const TABS = [
  { id: 'daily', label: 'Penjualan Harian', icon: 'bi-calendar-day' },
  { id: 'monthly', label: 'Penjualan Bulanan', icon: 'bi-calendar-month' },
  { id: 'best', label: 'Produk Terlaris', icon: 'bi-trophy' },
  { id: 'store', label: 'Per Gerai', icon: 'bi-shop' },
  { id: 'stock', label: 'Laporan Stok', icon: 'bi-boxes' },
  { id: 'lowstock', label: 'Hampir Habis', icon: 'bi-exclamation-triangle' },
];

const getDefaultDates = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ ...getDefaultDates(), storeId: '' });
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStores().then((res) => setStores(res.data || [])).catch(() => {});
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      let chartRes;

      switch (activeTab) {
        case 'daily':
          [res, chartRes] = await Promise.all([
            getDailySales(filters),
            getSalesChart(filters),
          ]);
          break;
        case 'monthly':
          res = await getMonthlySales(filters);
          chartRes = res;
          break;
        case 'best':
          res = await getBestProducts(filters);
          break;
        case 'store':
          res = await getSalesByStore(filters);
          break;
        case 'stock':
          res = await getStockReport(filters.storeId);
          break;
        case 'lowstock':
          res = await getLowStockReport(filters.storeId);
          break;
        default:
          res = { data: [] };
      }

      setData(res.data || []);
      setChartData(chartRes?.data || res.data || []);
    } catch {
      toast.error('Gagal memuat laporan');
      setData([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handleFilter = () => fetchReport();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  const dailyChartData = {
    labels: chartData.map((d) => d.label),
    datasets: [
      {
        label: 'Omzet (Rp)',
        data: chartData.map((d) => d.revenue),
        borderColor: 'rgb(13, 110, 253)',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Transaksi',
        data: chartData.map((d) => d.transactions),
        borderColor: 'rgb(25, 135, 84)',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        fill: false,
        tension: 0.3,
        yAxisID: 'y',
      },
    ],
  };

  const monthlyChartData = {
    labels: chartData.map((d) => d.label),
    datasets: [{
      label: 'Omzet (Rp)',
      data: chartData.map((d) => d.revenue),
      backgroundColor: 'rgba(13, 110, 253, 0.7)',
      borderRadius: 6,
    }],
  };

  const bestChartData = {
    labels: data.slice(0, 10).map((d) => d.product?.name),
    datasets: [{
      label: 'Qty Terjual',
      data: data.slice(0, 10).map((d) => d.totalQty),
      backgroundColor: 'rgba(255, 193, 7, 0.8)',
      borderRadius: 6,
    }],
  };

  const storeChartData = {
    labels: data.map((d) => d.store?.name),
    datasets: [{
      label: 'Omzet (Rp)',
      data: data.map((d) => d.revenue),
      backgroundColor: [
        'rgba(13, 110, 253, 0.7)',
        'rgba(25, 135, 84, 0.7)',
        'rgba(255, 193, 7, 0.7)',
        'rgba(220, 53, 69, 0.7)',
        'rgba(13, 202, 240, 0.7)',
      ],
      borderRadius: 6,
    }],
  };

  const showDateFilter = ['daily', 'monthly', 'best', 'store'].includes(activeTab);

  return (
    <div>
      <div className="page-header">
        <h4 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>Laporan
        </h4>
        <p className="text-muted mb-0">Analisis penjualan dan stok</p>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body py-2">
          <ul className="nav nav-pills flex-wrap gap-1">
            {TABS.map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`bi ${tab.icon} me-1`}></i>{tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {showDateFilter && (
              <>
                <div className="col-md-3">
                  <label className="form-label">Dari Tanggal</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Sampai Tanggal</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </>
            )}
            {activeTab !== 'store' && (
              <div className="col-md-3">
                <label className="form-label">Gerai</label>
                <select
                  className="form-select"
                  value={filters.storeId}
                  onChange={(e) => setFilters({ ...filters, storeId: e.target.value })}
                >
                  <option value="">Semua Gerai</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={handleFilter}>
                <i className="bi bi-funnel me-1"></i>Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {activeTab === 'daily' && (
            <>
              <div className="card shadow-sm mb-3">
                <div className="card-header bg-white">
                  <h6 className="mb-0">Grafik Penjualan Harian</h6>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    {chartData.length > 0 ? (
                      <Line data={dailyChartData} options={chartOptions} />
                    ) : (
                      <p className="text-muted text-center py-5">Tidak ada data</p>
                    )}
                  </div>
                </div>
              </div>
              <ReportTable
                headers={['Tanggal', 'Transaksi', 'Omzet']}
                rows={data.map((r) => [r.label, r.transactions, formatCurrency(r.revenue)])}
              />
            </>
          )}

          {activeTab === 'monthly' && (
            <>
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    {chartData.length > 0 ? (
                      <Bar data={monthlyChartData} options={chartOptions} />
                    ) : (
                      <p className="text-muted text-center py-5">Tidak ada data</p>
                    )}
                  </div>
                </div>
              </div>
              <ReportTable
                headers={['Bulan', 'Transaksi', 'Omzet']}
                rows={data.map((r) => [r.label, r.transactions, formatCurrency(r.revenue)])}
              />
            </>
          )}

          {activeTab === 'best' && (
            <>
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    {data.length > 0 ? (
                      <Bar data={bestChartData} options={chartOptions} />
                    ) : (
                      <p className="text-muted text-center py-5">Tidak ada data</p>
                    )}
                  </div>
                </div>
              </div>
              <ReportTable
                headers={['Produk', 'Kategori', 'Qty Terjual', 'Total Omzet']}
                rows={data.map((r) => [
                  r.product?.name, r.product?.category, r.totalQty, formatCurrency(r.totalRevenue),
                ])}
              />
            </>
          )}

          {activeTab === 'store' && (
            <>
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    {data.length > 0 ? (
                      <Bar data={storeChartData} options={chartOptions} />
                    ) : (
                      <p className="text-muted text-center py-5">Tidak ada data</p>
                    )}
                  </div>
                </div>
              </div>
              <ReportTable
                headers={['Gerai', 'Transaksi', 'Omzet']}
                rows={data.map((r) => [r.store?.name, r.transactions, formatCurrency(r.revenue)])}
              />
            </>
          )}

          {activeTab === 'stock' && (
            <ReportTable
              headers={['Gerai', 'Barcode', 'Produk', 'Kategori', 'Stok', 'Harga Jual']}
              rows={data.map((r) => [
                r.store?.name, r.product?.barcode, r.product?.name,
                r.product?.category, r.quantity, formatCurrency(r.product?.sellPrice),
              ])}
            />
          )}

          {activeTab === 'lowstock' && (
            <ReportTable
              headers={['Gerai', 'Produk', 'Barcode', 'Stok']}
              rows={data.map((r) => [
                r.store?.name, r.product?.name, r.product?.barcode,
                <span key={r.id} className="badge bg-danger">{r.quantity}</span>,
              ])}
              emptyMessage="Semua stok aman"
            />
          )}
        </>
      )}
    </div>
  );
};

const ReportTable = ({ headers, rows, emptyMessage = 'Tidak ada data' }) => (
  <div className="card shadow-sm">
    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              {headers.map((h) => (
                <th key={h} className="ps-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center text-muted py-4">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className={j === 0 ? 'ps-3' : ''}>{cell}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Reports;