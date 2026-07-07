import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) return <LoadingSpinner text="Memuat aplikasi..." />;

  if (user) {
    navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/pos', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Username dan password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const userData = await login(username, password);
      toast.success('Login berhasil!');
      navigate(userData.role === 'ADMIN' ? '/admin/dashboard' : '/pos');
    } catch (error) {
      if (!error.response) {
        toast.error('Tidak bisa terhubung ke server. Pastikan MySQL XAMPP & backend sudah berjalan.');
      } else {
        toast.error(error.response?.data?.message || 'Username atau password salah');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <div className="login-icon">
            <i className="bi bi-cart4"></i>
          </div>
          <h2 className="fw-bold text-primary">Retail POS</h2>
          <p className="text-muted">Sistem Point of Sale</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Memproses...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;