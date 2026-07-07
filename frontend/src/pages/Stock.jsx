import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getStockMatrix, getStockByStore } from '../services/stockService';
import { getStores } from '../services/storeService';
import LoadingSpinner from '../components/LoadingSpinner';

const Stock = () => {
  const [stores, setStores] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [storeStocks, setStoreStocks] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('matrix');

  const fetchStores = async () => {
    try {
      const res = await getStores();
      setStores(res.data || []);
    } catch {
      toast.error('Gagal memuat data gerai');
    }
  };

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await getStockMatrix();
      setMatrix(res.data?.matrix || []);
      if (!stores.length) setStores(res.data?.stores || []);
    } catch {
      toast.error('Gagal memuat data stok');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreStock = async (storeId) => {
    setLoading(true);
    try {
      const res = await getStockByStore(storeId);
      setStoreStocks(res.data || []);
    } catch {
      toast.error('Gagal memuat data stok gerai');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchMatrix();
  }, []);

  const handleStoreChange = (storeId) => {
    setSelectedStore(storeId);
    if (storeId) {
      setViewMode('store');
      fetchStoreStock(storeId);
    } else {
      setViewMode('matrix');
      fetchMatrix();
    }
  };

  const filteredMatrix = matrix.filter((row) =>
    row.product.name.toLowerCase().includes(search.toLowerCase()) ||
    row.product.barcode.includes(search)
  );

  const filteredStoreStock = storeStocks.filter((s) =>
    s.product.name.toLowerCase().includes(search.toLowerCase()) ||
    s.product.barcode.includes(search)
  );

  if (loading && matrix.length === 0 && storeStocks.length === 0) {
    return <LoadingSpinner />;
  }

  const activeStores = stores.length ? stores : [];

  return (
    <div>
      <div className="page-header">
        <h4 className="mb-0">
          <i className="bi bi-boxes me-2"></i>Manajemen Stok
        </h4>
        <p className="text-muted mb-0">Pantau stok produk per gerai</p>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Filter Gerai</label>
              <select
                className="form-select"
                value={selectedStore}
                onChange={(e) => handleStoreChange(e.target.value)}
              >
                <option value="">Semua Gerai (Matrix)</option>
                {activeStores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">Cari Produk</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cari nama atau barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3 sticky-col">Barcode</th>
                    <th className="sticky-col-2">Nama Produk</th>
                    <th>Kategori</th>
                    {activeStores.map((store) => (
                      <th key={store.id} className="text-center">{store.name}</th>
                    ))}
                    <th className="text-center bg-primary bg-opacity-10">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={activeStores.length + 4} className="text-center text-muted py-4">
                        {search ? 'Produk tidak ditemukan' : 'Belum ada data stok'}
                      </td>
                    </tr>
                  ) : (
                    filteredMatrix.map((row) => (
                      <tr key={row.product.id}>
                        <td className="ps-3"><code>{row.product.barcode}</code></td>
                        <td className="fw-semibold">{row.product.name}</td>
                        <td>{row.product.category}</td>
                        {row.stocks.map((s) => (
                          <td key={s.storeId} className="text-center">
                            <span className={`badge ${s.quantity <= 10 ? 'bg-danger' : s.quantity <= 30 ? 'bg-warning text-dark' : 'bg-success'}`}>
                              {s.quantity}
                            </span>
                          </td>
                        ))}
                        <td className="text-center fw-bold">{row.totalStock}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">#</th>
                    <th>Barcode</th>
                    <th>Nama Produk</th>
                    <th>Kategori</th>
                    <th>Supplier</th>
                    <th className="text-center">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary"></div>
                      </td>
                    </tr>
                  ) : filteredStoreStock.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        {search ? 'Produk tidak ditemukan' : 'Belum ada stok di gerai ini'}
                      </td>
                    </tr>
                  ) : (
                    filteredStoreStock.map((item, index) => (
                      <tr key={item.id}>
                        <td className="ps-3">{index + 1}</td>
                        <td><code>{item.product.barcode}</code></td>
                        <td className="fw-semibold">{item.product.name}</td>
                        <td>{item.product.category}</td>
                        <td>{item.product.supplier?.name || '-'}</td>
                        <td className="text-center">
                          <span className={`badge fs-6 ${item.quantity <= 10 ? 'bg-danger' : item.quantity <= 30 ? 'bg-warning text-dark' : 'bg-success'}`}>
                            {item.quantity}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 d-flex gap-3">
        <small className="text-muted"><span className="badge bg-success">Hijau</span> Stok aman (&gt;30)</small>
        <small className="text-muted"><span className="badge bg-warning text-dark">Kuning</span> Stok menipis (11-30)</small>
        <small className="text-muted"><span className="badge bg-danger">Merah</span> Hampir habis (≤10)</small>
      </div>
    </div>
  );
};

export default Stock;