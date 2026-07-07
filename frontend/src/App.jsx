import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stores from './pages/Stores';
import Users from './pages/Users';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Receiving from './pages/Receiving';
import StockOpname from './pages/StockOpname';
import Reports from './pages/Reports';
import Promo from './pages/Promo';
import POS from './pages/POS';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stores" element={<Stores />} />
            <Route path="users" element={<Users />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="products" element={<Products />} />
            <Route path="stock" element={<Stock />} />
            <Route path="receiving" element={<Receiving />} />
            <Route path="stock-opname" element={<StockOpname />} />
            <Route path="reports" element={<Reports />} />
            <Route path="promo" element={<Promo />} />
          </Route>

          <Route
            path="/pos"
            element={
              <ProtectedRoute allowedRoles={['KASIR']}>
                <POS />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  );
}

export default App;