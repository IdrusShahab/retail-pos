import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/supplierService';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = {
  name: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  isActive: true,
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const fetchSuppliers = async () => {
    try {
      const res = await getSuppliers();
      setSuppliers(res.data || []);
    } catch {
      toast.error('Gagal memuat data supplier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact || '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (supplier) => {
    setEditId(supplier.id);
    setForm({
      name: supplier.name,
      contact: supplier.contact || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      isActive: supplier.isActive,
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
    if (!form.name.trim()) {
      toast.error('Nama supplier wajib diisi');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await updateSupplier(editId, form);
        toast.success('Supplier berhasil diperbarui');
      } else {
        await createSupplier(form);
        toast.success('Supplier berhasil ditambahkan');
      }
      closeModal();
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier) => {
    const result = await Swal.fire({
      title: 'Hapus Supplier?',
      text: `Yakin ingin menghapus "${supplier.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await deleteSupplier(supplier.id);
        toast.success('Supplier berhasil dihapus');
        fetchSuppliers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menghapus supplier');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 className="mb-0">
            <i className="bi bi-truck me-2"></i>Manajemen Supplier
          </h4>
          <p className="text-muted mb-0">Kelola data pemasok barang</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i>Tambah Supplier
        </button>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Cari supplier..."
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
                  <th>Nama</th>
                  <th>Kontak</th>
                  <th>Telepon</th>
                  <th>Email</th>
                  <th>Produk</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      {search ? 'Supplier tidak ditemukan' : 'Belum ada data supplier'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((supplier, index) => (
                    <tr key={supplier.id}>
                      <td className="ps-3">{index + 1}</td>
                      <td className="fw-semibold">{supplier.name}</td>
                      <td>{supplier.contact || '-'}</td>
                      <td>{supplier.phone || '-'}</td>
                      <td>{supplier.email || '-'}</td>
                      <td>
                        <span className="badge bg-info">{supplier._count?.products || 0}</span>
                      </td>
                      <td>
                        <span className={`badge ${supplier.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {supplier.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEdit(supplier)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(supplier)}
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
                    {editId ? 'Edit Supplier' : 'Tambah Supplier'}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nama Supplier *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nama Kontak</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Telepon</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Alamat</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="supplierActive"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="supplierActive">Aktif</label>
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

export default Suppliers;