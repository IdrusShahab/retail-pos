import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';
import { getSuppliers } from '../services/supplierService';
import { formatCurrency } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = {
  barcode: '',
  name: '',
  category: '',
  buyPrice: '',
  sellPrice: '',
  supplierId: '',
  status: 'ACTIVE',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        getProducts(),
        getSuppliers(),
      ]);
      setProducts(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch {
      toast.error('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    if (suppliers.length === 0) {
      toast.warning('Tambahkan supplier terlebih dahulu');
      return;
    }
    setEditId(null);
    setForm({ ...emptyForm, supplierId: suppliers[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditId(product.id);
    setForm({
      barcode: product.barcode,
      name: product.name,
      category: product.category,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      supplierId: product.supplierId,
      status: product.status,
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

    if (!form.barcode || !form.name || !form.category || !form.supplierId) {
      toast.error('Semua field wajib diisi');
      return;
    }

    if (Number(form.buyPrice) < 0 || Number(form.sellPrice) < 0) {
      toast.error('Harga tidak boleh negatif');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        buyPrice: Number(form.buyPrice),
        sellPrice: Number(form.sellPrice),
        supplierId: Number(form.supplierId),
      };

      if (editId) {
        await updateProduct(editId, payload);
        toast.success('Produk berhasil diperbarui');
      } else {
        await createProduct(payload);
        toast.success('Produk berhasil ditambahkan');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      title: 'Hapus Produk?',
      text: `Yakin ingin menghapus "${product.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(product.id);
        toast.success('Produk berhasil dihapus');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menghapus produk');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 className="mb-0">
            <i className="bi bi-box-seam me-2"></i>Manajemen Produk
          </h4>
          <p className="text-muted mb-0">Kelola master data produk</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i>Tambah Produk
        </button>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Cari barcode, nama, atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">#</th>
                  <th>Barcode</th>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th>Harga Beli</th>
                  <th>Harga Jual</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      {search ? 'Produk tidak ditemukan' : 'Belum ada data produk'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((product, index) => (
                    <tr key={product.id}>
                      <td className="ps-3">{index + 1}</td>
                      <td><code>{product.barcode}</code></td>
                      <td className="fw-semibold">{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatCurrency(product.buyPrice)}</td>
                      <td>{formatCurrency(product.sellPrice)}</td>
                      <td>{product.supplier?.name || '-'}</td>
                      <td>
                        <span className={`badge ${product.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                          {product.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEdit(product)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(product)}
                        >
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editId ? 'Edit Produk' : 'Tambah Produk'}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Barcode *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.barcode}
                        onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nama Produk *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Kategori *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="Minuman, Makanan, Snack, dll"
                        required
                      />
                    </div>
                    <div className="col-md-6">
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
                    <div className="col-md-6">
                      <label className="form-label">Harga Beli *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={form.buyPrice}
                        onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Harga Jual *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={form.sellPrice}
                        onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="ACTIVE">Aktif</option>
                        <option value="INACTIVE">Nonaktif</option>
                      </select>
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

export default Products;