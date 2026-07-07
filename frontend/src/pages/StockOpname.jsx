import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getOpnameHistory,
  checkProductStock,
  createStockOpname,
} from '../services/stockOpnameService';
import { getStores } from '../services/storeService';
import { getProducts } from '../services/productService';
import { formatDate } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

const StockOpname = () => {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  const [form, setForm] = useState({
    storeId: '',
    productId: '',
    physicalQty: '',
    notes: '',
  });
  const [systemQty, setSystemQty] = useState(null);

  const fetchData = async () => {
    try {
      const [storesRes, productsRes, historyRes] = await Promise.all([
        getStores(),
        getProducts(),
        getOpnameHistory(),
      ]);
      setStores(storesRes.data || []);
      setProducts(productsRes.data || []);
      setHistory(historyRes.data || []);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckStock = async () => {
    if (!form.storeId || !form.productId) {
      toast.warning('Pilih gerai dan produk terlebih dahulu');
      return;
    }

    setChecking(true);
    try {
      const res = await checkProductStock(form.storeId, form.productId);
      setSystemQty(res.data.systemQty);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal cek stok');
      setSystemQty(null);
    } finally {
      setChecking(false);
    }
  };

  const difference = systemQty !== null && form.physicalQty !== ''
    ? Number(form.physicalQty) - systemQty
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.storeId || !form.productId || form.physicalQty === '') {
      toast.error('Gerai, produk, dan jumlah fisik wajib diisi');
      return;
    }

    if (Number(form.physicalQty) < 0) {
      toast.error('Jumlah fisik tidak boleh negatif');
      return;
    }

    setSaving(true);
    try {
      await createStockOpname({
        storeId: Number(form.storeId),
        productId: Number(form.productId),
        physicalQty: Number(form.physicalQty),
        notes: form.notes,
      });
      toast.success('Stock opname berhasil disimpan');
      setForm({ storeId: '', productId: '', physicalQty: '', notes: '' });
      setSystemQty(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan stock opname');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h4 className="mb-0">
          <i className="bi bi-clipboard-check me-2"></i>Stock Opname
        </h4>
        <p className="text-muted mb-0">Koreksi stok berdasarkan jumlah fisik</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Form Stock Opname</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Gerai *</label>
                  <select
                    className="form-select"
                    value={form.storeId}
                    onChange={(e) => {
                      setForm({ ...form, storeId: e.target.value, productId: '' });
                      setSystemQty(null);
                    }}
                    required
                  >
                    <option value="">Pilih Gerai</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Produk *</label>
                  <select
                    className="form-select"
                    value={form.productId}
                    onChange={(e) => {
                      setForm({ ...form, productId: e.target.value });
                      setSystemQty(null);
                    }}
                    required
                  >
                    <option value="">Pilih Produk</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.barcode} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={handleCheckStock}
                    disabled={checking || !form.storeId || !form.productId}
                  >
                    {checking ? 'Mengecek...' : 'Cek Stok Sistem'}
                  </button>
                </div>

                {systemQty !== null && (
                  <div className="alert alert-secondary text-center mb-3">
                    <small>Stok Sistem</small>
                    <h4 className="fw-bold mb-0">{systemQty}</h4>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Jumlah Fisik *</label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    min="0"
                    value={form.physicalQty}
                    onChange={(e) => setForm({ ...form, physicalQty: e.target.value })}
                    required
                  />
                </div>

                {difference !== null && (
                  <div className={`alert text-center ${difference === 0 ? 'alert-success' : difference > 0 ? 'alert-info' : 'alert-warning'}`}>
                    <small>Selisih</small>
                    <h5 className="fw-bold mb-0">
                      {difference > 0 ? '+' : ''}{difference}
                      {difference === 0 && ' (Sesuai)'}
                    </h5>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Catatan</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Opsional"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Stock Opname'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>Riwayat Stock Opname
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Tanggal</th>
                      <th>Gerai</th>
                      <th>Produk</th>
                      <th className="text-center">Sistem</th>
                      <th className="text-center">Fisik</th>
                      <th className="text-center">Selisih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          Belum ada riwayat stock opname
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr key={item.id}>
                          <td className="ps-3">{formatDate(item.createdAt)}</td>
                          <td>{item.store?.name}</td>
                          <td>{item.product?.name}</td>
                          <td className="text-center">{item.previousQty}</td>
                          <td className="text-center">{item.physicalQty}</td>
                          <td className="text-center">
                            <span className={`badge ${item.difference === 0 ? 'bg-success' : item.difference > 0 ? 'bg-info' : 'bg-warning text-dark'}`}>
                              {item.difference > 0 ? '+' : ''}{item.difference}
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
        </div>
      </div>
    </div>
  );
};

export default StockOpname;