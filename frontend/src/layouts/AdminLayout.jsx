import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/admin/stores', label: 'Gerai', icon: 'bi-shop' },
  { path: '/admin/users', label: 'User', icon: 'bi-people' },
  { path: '/admin/products', label: 'Produk', icon: 'bi-box-seam' },
  { path: '/admin/suppliers', label: 'Supplier', icon: 'bi-truck' },
  { path: '/admin/stock', label: 'Stok', icon: 'bi-boxes' },
  { path: '/admin/stock-opname', label: 'Stock Opname', icon: 'bi-clipboard-check' },
  { path: '/admin/receiving', label: 'Receiving', icon: 'bi-inbox' },
  { path: '/admin/reports', label: 'Laporan', icon: 'bi-graph-up' },
  { path: '/admin/promo', label: 'Promo', icon: 'bi-tag' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <nav className="navbar navbar-dark bg-primary px-3 shadow-sm">
        <button
          className="btn btn-link text-white p-0 me-3"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <i className="bi bi-list fs-4"></i>
        </button>
        <Link to="/admin/dashboard" className="navbar-brand fw-bold">
          <i className="bi bi-cart4 me-2"></i>Retail POS
        </Link>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="text-white-50 d-none d-md-inline">
            <i className="bi bi-person-circle me-1"></i>
            {user?.name}
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>Logout
          </button>
        </div>
      </nav>

      <div className="d-flex">
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              item.disabled ? (
                <span key={item.path} className="sidebar-link disabled" title="Tahap berikutnya">
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                  <small className="badge bg-secondary ms-auto">Soon</small>
                </span>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </NavLink>
              )
            ))}
          </nav>
        </aside>

        <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;