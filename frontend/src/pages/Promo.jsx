import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getPromos, createPromo, updatePromo, deletePromo } from '../services/promoService';
import { getStores } from '../services/storeService';
import { getProducts } from '../services/productService';
import { formatCurrency, formatDate } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = {
  name: '',
  code: '',
  discountType: 'PERCENT',
  discountValue: '',
  minPurchase: '0',
  applyType: 'ALL',
  category: '',
  productId: '',
  storeId: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const Promo = () => {
  const [promos, setPromos] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [promosRes, storesRes, productsRes] = await Promise.all([
        getPromos(),
        getStores(),
        getProducts(),
      ]);
      setPromos(promosRes.data || []);
      setStores(storesRes.data || []);
      const prods = productsRes.data || [];
      setProducts(prods);
      const cats = [...new Set(prods.map((p) => p.category))].sort();
      setCategories(cats);
    } catch {
      toast.error('Gagal memuat data promo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isActivePromo = (promo) => {
    const now = new Date();
    return promo.isActive && now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
  };

  const openCreate = () => {
    setEditId(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setForm({
      ...emptyForm,
      startDate: today,
      endDate: nextMonth.toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEdit = (promo) => {
    setEditId(promo.id);
    setForm({
      name: promo.name,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minPurchase: promo.minPurchase,
      applyType: promo.applyType,
      category: promo.category || '',
      productId: promo.productId || '',
      storeId: promo.storeId || '',
      startDate: promo.startDate.split('T')[0],
      endDate: promo.endDate.split('T')[0],
      isActive: promo.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minPurchase: Number(form.minPurchase),
        storeId: form.storeId || null,
        productId: form.applyType === 'PRODUCT' ? Number(form.productId) : null,
        category: form.applyType === 'CATEGORY' ? form.category : null,
      };

      if (editId) {
        await updatePromo(editId, payload);
        toast.success('Promo berhasil diperbarui');
      } else {
        await createPromo(payload);
        toast.success('Promo berhasil ditambahkan');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan promo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promo) => {
    const result = await Swal.fire({
      title: 'Hapus Promo?',
      text: `Yakin ingin menghapus "${promo.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await deletePromo(promo.id);
        toast.success('Promo berhasil dihapus');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menghapus promo');
      }
    }
  };

  const formatDiscount = (promo) => {
    if (promo.discountType === 'PERCENT') return `${promo.discountValue}%`;
    return formatCurrency(promo.discountValue);
  };

  const formatApply = (promo) => {
    if (promo.applyType === 'ALL') return 'Semua Produk';
    if (promo.applyType === 'CATEGORY') return `Kategori: ${promo.category}`;
    return promo.product?.name || 'Produk';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 className="mb-0"><i className="bi bi-tag me-2"></i>Manajemen Promo</h4>
          <p className="text-muted mb-0">Kelola diskon dan kode promo</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i>Tambah Promo
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Nama</th>
                  <th>Kode</th>
                  <th>Diskon</th>
                  <th>Berlaku Untuk</th>
                  <th>Gerai</th>
                  <th>Periode</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {promos.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">Belum ada promo</td>
                  </tr>
                ) : (
                  promos.map((promo) => (
                    <tr key={promo.id}>
                      <td className="ps-3 fw-semibold">{promo.name}</td>
                      <td><code>{promo.code}</code></td>
                      <td>{formatDiscount(promo)}</td>
                      <td>{formatApply(promo)}</td>
                      <td>{promo.store?.name || 'Semua Gerai'}</td>
                      <td>
                        <small>{formatDate(promo.startDate).split(',')[0]} — {formatDate(promo.endDate).split(',')[0]}</small>
                      </td>
                      <td>
                        <span className={`badge ${isActivePromo(promo) ? 'bg-success' : 'bg-secondary'}`}>
                          {isActivePromo(promo) ? 'Aktif' : promo.isActive ? 'Expired' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(promo)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(promo)}>
                          <i className="bi bi-trash"></i>
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

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editId ? 'Edit Promo' : 'Tambah Promo'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nama Promo *</label>
                      <input type="text" className="form-control" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Kode Promo *</label>
                      <input type="text" className="form-control text-uppercase" value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Tipe Diskon *</label>
                      <select className="form-select" value={form.discountType}
                        onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                        <option value="PERCENT">Persen (%)</option>
                        <option value="FIXED">Nominal (Rp)</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Nilai Diskon *</label>
                      <input type="number" className="form-control" min="0"
                        max={form.discountType === 'PERCENT' ? 100 : undefined}
                        value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Min. Belanja</label>
                      <input type="number" className="form-control" min="0" value={form.minPurchase}
                        onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Berlaku Untuk *</label>
                      <select className="form-select" value={form.applyType}
                        onChange={(e) => setForm({ ...form, applyType: e.target.value, category: '', productId: '' })}>
                        <option value="ALL">Semua Produk</option>
                        <option value="CATEGORY">Per Kategori</option>
                        <option value="PRODUCT">Per Produk</option>
                      </select>
                    </div>
                    {form.applyType === 'CATEGORY' && (
                      <div className="col-md-4">
                        <label className="form-label">Kategori *</label>
                        <select className="form-select" value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                          <option value="">Pilih Kategori</option>
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    )}
                    {form.applyType === 'PRODUCT' && (
                      <div className="col-md-4">
                        <label className="form-label">Produk *</label>
                        <select className="form-select" value={form.productId}
                          onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
                          <option value="">Pilih Produk</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.barcode} - {p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="col-md-4">
                      <label className="form-label">Gerai</label>
                      <select className="form-select" value={form.storeId}
                        onChange={(e) => setForm({ ...form, storeId: e.target.value })}>
                        <option value="">Semua Gerai</option>
                        {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tanggal Mulai *</label>
                      <input type="date" className="form-control" value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tanggal Akhir *</label>
                      <input type="date" className="form-control" value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="promoActive"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                        <label className="form-check-label" htmlFor="promoActive">Aktif</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promo;