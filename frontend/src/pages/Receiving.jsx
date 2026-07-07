import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getReceivings, createReceiving } from '../services/receivingService';
import { getStores } from '../services/storeService';
import { getSuppliers } from '../services/supplierService';
import { getProducts } from '../services/productService';
import { formatCurrency, formatDate } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

const Receiving = () => {
  const [receivings, setReceivings] = useState([]);
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);

  const [form, setForm] = useState({
    storeId: '',
    supplierId: '',
    notes: '',
  });
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState({
    productId: '',
    quantity: '',
    price: '',
  });

  const fetchData = async () => {
    try {
      const [recvRes, storesRes, suppliersRes, productsRes] = await Promise.all([
        getReceivings(),
        getStores(),
        getSuppliers(),
        getProducts(),
      ]);
      setReceivings(recvRes.data || []);
      setStores(storesRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setProducts(productsRes.data || []);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = form.supplierId
    ? products.filter((p) => p.supplierId === Number(form.supplierId) && p.status === 'ACTIVE')
    : products.filter((p) => p.status === 'ACTIVE');

  const addItem = () => {
    if (!itemForm.productId || !itemForm.quantity || itemForm.price === '') {
      toast.error('Produk, qty, dan harga wajib diisi');
      return;
    }
    if (Number(itemForm.quantity) < 1) {
      toast.error('Qty minimal 1');
      return;
    }
    if (Number(itemForm.price) < 0) {
      toast.error('Harga tidak boleh negatif');
      return;
    }

    const product = products.find((p) => p.id === Number(itemForm.productId));
    const existing = items.findIndex((i) => i.productId === Number(itemForm.productId));

    if (existing >= 0) {
      const updated = [...items];
      updated[existing] = {
        ...updated[existing],
        quantity: updated[existing].quantity + Number(itemForm.quantity),
        price: Number(itemForm.price),
      };
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: Number(itemForm.productId),
          productName: product.name,
          barcode: product.barcode,
          quantity: Number(itemForm.quantity),
          price: Number(itemForm.price),
        },
      ]);
    }

    setItemForm({ productId: '', quantity: '', price: '' });
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const itemTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const handleProductSelect = (productId) => {
    const product = products.find((p) => p.id === Number(productId));
    setItemForm({
      productId,
      quantity: itemForm.quantity,
      price: product ? product.buyPrice : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.storeId || !form.supplierId) {
      toast.error('Gerai dan supplier wajib dipilih');
      return;
    }
    if (items.length === 0) {
      toast.error('Tambahkan minimal 1 produk');
      return;
    }

    setSaving(true);
    try {
      await createReceiving({
        storeId: Number(form.storeId),
        supplierId: Number(form.supplierId),
        notes: form.notes,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      });
      toast.success('Receiving berhasil disimpan, stok telah diperbarui');
      setShowForm(false);
      setForm({ storeId: '', supplierId: '', notes: '' });
      setItems([]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan receiving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 className="mb-0">
            <i className="bi bi-inbox me-2"></i>Receiving Barang
          </h4>
          <p className="text-muted mb-0">Penerimaan barang dari supplier</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="bi bi-plus-lg me-1"></i>Receiving Baru
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h6 className="mb-0"><i className="bi bi-clock-history me-2"></i>Riwayat Receiving</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">#</th>
                  <th>Tanggal</th>
                  <th>Gerai</th>
                  <th>Supplier</th>
                  <th>Total Item</th>
                  <th>Total Nilai</th>
                  <th className="text-end pe-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {receivings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      Belum ada data receiving
                    </td>
                  </tr>
                ) : (
                  receivings.map((recv, index) => (
                    <tr key={recv.id}>
                      <td className="ps-3">{index + 1}</td>
                      <td>{formatDate(recv.createdAt)}</td>
                      <td>{recv.store?.name}</td>
                      <td>{recv.supplier?.name}</td>
                      <td>
                        <span className="badge bg-info">
                          {recv.receivingDetails?.length || 0} produk
                        </span>
                      </td>
                      <td className="fw-semibold">{formatCurrency(recv.total)}</td>
                      <td className="text-end pe-3">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setShowDetail(recv)}
                        >
                          <i className="bi bi-eye"></i> Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-inbox me-2"></i>Receiving Baru
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Gerai *</label>
                      <select
                        className="form-select"
                        value={form.storeId}
                        onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                        required
                      >
                        <option value="">Pilih Gerai</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Supplier *</label>
                      <select
                        className="form-select"
                        value={form.supplierId}
                        onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                        required
                      >
                        <option value="">Pilih Supplier</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Catatan</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Opsional"
                      />
                    </div>
                  </div>

                  <div className="card bg-light mb-3">
                    <div className="card-body">
                      <h6 className="card-title">Tambah Produk</h6>
                      <div className="row g-2 align-items-end">
                        <div className="col-md-5">
                          <label className="form-label">Produk</label>
                          <select
                            className="form-select"
                            value={itemForm.productId}
                            onChange={(e) => handleProductSelect(e.target.value)}
                          >
                            <option value="">Pilih Produk</option>
                            {filteredProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.barcode} - {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Qty</label>
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={itemForm.quantity}
                            onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Harga Beli</label>
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            value={itemForm.price}
                            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                          />
                        </div>
                        <div className="col-md-2">
                          <button type="button" className="btn btn-success w-100" onClick={addItem}>
                            <i className="bi bi-plus-lg"></i> Tambah
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Barcode</th>
                            <th>Produk</th>
                            <th className="text-center">Qty</th>
                            <th className="text-end">Harga</th>
                            <th className="text-end">Subtotal</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={index}>
                              <td><code>{item.barcode}</code></td>
                              <td>{item.productName}</td>
                              <td className="text-center">{item.quantity}</td>
                              <td className="text-end">{formatCurrency(item.price)}</td>
                              <td className="text-end">{formatCurrency(item.quantity * item.price)}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeItem(index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="table-primary">
                            <td colSpan="4" className="text-end fw-bold">Total</td>
                            <td className="text-end fw-bold">{formatCurrency(itemTotal)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving || items.length === 0}>
                    {saving ? 'Menyimpan...' : 'Simpan & Update Stok'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Receiving #{showDetail.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetail(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <small className="text-muted">Gerai</small>
                    <p className="fw-semibold mb-0">{showDetail.store?.name}</p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Supplier</small>
                    <p className="fw-semibold mb-0">{showDetail.supplier?.name}</p>
                  </div>
                  <div className="col-md-6 mt-2">
                    <small className="text-muted">Tanggal</small>
                    <p className="mb-0">{formatDate(showDetail.createdAt)}</p>
                  </div>
                  <div className="col-md-6 mt-2">
                    <small className="text-muted">Total</small>
                    <p className="fw-bold text-primary mb-0">{formatCurrency(showDetail.total)}</p>
                  </div>
                </div>
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Produk</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Harga</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showDetail.receivingDetails?.map((d) => (
                      <tr key={d.id}>
                        <td>{d.product?.name}</td>
                        <td className="text-center">{d.quantity}</td>
                        <td className="text-end">{formatCurrency(d.price)}</td>
                        <td className="text-end">{formatCurrency(d.quantity * d.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDetail(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receiving;