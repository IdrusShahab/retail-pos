import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  getStores,
  createStore,
  updateStore,
  deleteStore,
} from '../services/storeService';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = { name: '', address: '', phone: '', isActive: true };

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchStores = async () => {
    try {
      const res = await getStores();
      setStores(res.data || []);
    } catch (error) {
      toast.error('Gagal memuat data gerai');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (store) => {
    setEditId(store.id);
    setForm({
      name: store.name,
      address: store.address || '',
      phone: store.phone || '',
      isActive: store.isActive,
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
      toast.error('Nama gerai wajib diisi');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await updateStore(editId, form);
        toast.success('Gerai berhasil diperbarui');
      } else {
        await createStore(form);
        toast.success('Gerai berhasil ditambahkan');
      }
      closeModal();
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan gerai');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (store) => {
    const result = await Swal.fire({
      title: 'Hapus Gerai?',
      text: `Yakin ingin menghapus "${store.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await deleteStore(store.id);
        toast.success('Gerai berhasil dihapus');
        fetchStores();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menghapus gerai');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-0">
            <i className="bi bi-shop me-2"></i>Manajemen Gerai
          </h4>
          <p className="text-muted mb-0">Kelola data gerai/toko</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i>Tambah Gerai
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">#</th>
                  <th>Nama Gerai</th>
                  <th>Alamat</th>
                  <th>Telepon</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      Belum ada data gerai
                    </td>
                  </tr>
                ) : (
                  stores.map((store, index) => (
                    <tr key={store.id}>
                      <td className="ps-3">{index + 1}</td>
                      <td className="fw-semibold">{store.name}</td>
                      <td>{store.address || '-'}</td>
                      <td>{store.phone || '-'}</td>
                      <td>
                        <span className={`badge ${store.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {store.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEdit(store)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(store)}
                          title="Hapus"
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editId ? 'Edit Gerai' : 'Tambah Gerai'}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nama Gerai *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Alamat</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Telepon</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="storeActive"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="storeActive">Aktif</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Batal
                  </button>
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

export default Stores;