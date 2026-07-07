import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { getStores } from '../services/storeService';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = {
  username: '',
  password: '',
  name: '',
  role: 'KASIR',
  storeId: '',
  isActive: true,
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [usersRes, storesRes] = await Promise.all([getUsers(), getStores()]);
      setUsers(usersRes.data || []);
      setStores(storesRes.data || []);
    } catch (error) {
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditId(user.id);
    setForm({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
      storeId: user.storeId || '',
      isActive: user.isActive,
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

    if (!form.username || !form.name || !form.role) {
      toast.error('Username, nama, dan role wajib diisi');
      return;
    }

    if (!editId && !form.password) {
      toast.error('Password wajib diisi');
      return;
    }

    if (form.role === 'KASIR' && !form.storeId) {
      toast.error('Kasir wajib memiliki gerai');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        storeId: form.role === 'ADMIN' ? null : Number(form.storeId),
      };
      if (editId && !form.password) {
        delete payload.password;
      }

      if (editId) {
        await updateUser(editId, payload);
        toast.success('User berhasil diperbarui');
      } else {
        await createUser(payload);
        toast.success('User berhasil ditambahkan');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: 'Hapus User?',
      text: `Yakin ingin menghapus "${user.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(user.id);
        toast.success('User berhasil dihapus');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menghapus user');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-0">
            <i className="bi bi-people me-2"></i>Manajemen User
          </h4>
          <p className="text-muted mb-0">Kelola akun admin dan kasir</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i>Tambah User
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">#</th>
                  <th>Username</th>
                  <th>Nama</th>
                  <th>Role</th>
                  <th>Gerai</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      Belum ada data user
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td className="ps-3">{index + 1}</td>
                      <td className="fw-semibold">{user.username}</td>
                      <td>{user.name}</td>
                      <td>
                        <span className={`badge ${user.role === 'ADMIN' ? 'bg-primary' : 'bg-info'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.store?.name || '-'}</td>
                      <td>
                        <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {user.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEdit(user)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(user)}
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
                    {editId ? 'Edit User' : 'Tambah User'}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Password {editId ? '(kosongkan jika tidak diubah)' : '*'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required={!editId}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nama Lengkap *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-select"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value, storeId: '' })}
                      required
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="KASIR">Kasir</option>
                    </select>
                  </div>
                  {form.role === 'KASIR' && (
                    <div className="mb-3">
                      <label className="form-label">Gerai *</label>
                      <select
                        className="form-select"
                        value={form.storeId}
                        onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                        required
                      >
                        <option value="">Pilih Gerai</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="userActive"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="userActive">Aktif</label>
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

export default Users;