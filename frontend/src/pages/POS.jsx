import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAuth } from '../hooks/useAuth';
import { scanBarcode, checkout, validatePromo } from '../services/posService';
import { formatCurrency } from '../utils/format';
import Receipt, { printReceipt } from '../components/Receipt';

const PAYMENT_METHODS = [
  { id: 'TUNAI', label: 'Tunai', icon: 'bi-cash', color: 'success' },
  { id: 'QRIS', label: 'QRIS', icon: 'bi-qr-code', color: 'primary' },
  { id: 'DEBIT', label: 'Debit', icon: 'bi-credit-card', color: 'info' },
];

const POS = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const barcodeRef = useRef(null);

  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('TUNAI');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, [cart]);

  useEffect(() => {
    if (appliedPromo && cart.length > 0) {
      validatePromo(appliedPromo.code, cartItems())
        .then((res) => setDiscountAmount(res.data.discountAmount))
        .catch(() => clearPromo());
    }
  }, [cart]);

  const cartItems = () => cart.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    price: i.price,
  }));

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const total = subtotal - discountAmount;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const change = paymentMethod === 'TUNAI' ? Math.max(0, Number(paymentAmount || 0) - total) : 0;

  const clearPromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCode('');
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || cart.length === 0) {
      toast.warning('Masukkan kode promo dan tambahkan barang');
      return;
    }

    setApplyingPromo(true);
    try {
      const res = await validatePromo(promoCode.trim(), cartItems());
      setAppliedPromo(res.data.promo);
      setDiscountAmount(res.data.discountAmount);
      toast.success(`Promo ${res.data.promo.code} diterapkan!`);
    } catch (error) {
      clearPromo();
      toast.error(error.response?.data?.message || 'Kode promo tidak valid');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode.trim() || scanning) return;

    setScanning(true);
    try {
      const res = await scanBarcode(barcode.trim());
      const product = res.data;

      setCart((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing) {
          if (existing.quantity >= product.stock) {
            toast.warning(`Stok ${product.name} hanya ${product.stock}`);
            return prev;
          }
          return prev.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            barcode: product.barcode,
            name: product.name,
            price: Number(product.sellPrice),
            quantity: 1,
            stock: product.stock,
          },
        ];
      });

      setBarcode('');
      toast.success(`${product.name} ditambahkan`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Produk tidak ditemukan');
      setBarcode('');
    } finally {
      setScanning(false);
      barcodeRef.current?.focus();
    }
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty > item.stock) {
            toast.warning(`Stok maksimal ${item.stock}`);
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleCancel = async () => {
    if (cart.length === 0) return;

    const result = await Swal.fire({
      title: 'Batalkan Transaksi?',
      text: 'Semua item di keranjang akan dihapus',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonText: 'Tidak',
      confirmButtonText: 'Ya, Batal',
    });

    if (result.isConfirmed) {
      setCart([]);
      setPaymentAmount('');
      setLastSale(null);
      clearPromo();
      toast.info('Transaksi dibatalkan');
      barcodeRef.current?.focus();
    }
  };

  const openPayment = () => {
    if (cart.length === 0) {
      toast.warning('Keranjang masih kosong');
      return;
    }
    setPaymentAmount(paymentMethod === 'TUNAI' ? '' : String(total));
    setShowPayment(true);
  };

  const handlePay = async () => {
    const payAmount = paymentMethod === 'TUNAI'
      ? Number(paymentAmount)
      : total;

    if (paymentMethod === 'TUNAI' && payAmount < total) {
      toast.error('Jumlah pembayaran kurang dari total');
      return;
    }

    setProcessing(true);
    try {
      const res = await checkout({
        items: cartItems(),
        paymentMethod,
        paymentAmount: payAmount,
        promoCode: appliedPromo?.code || null,
      });

      const sale = res.data;
      setLastSale(sale);
      setCart([]);
      clearPromo();
      setShowPayment(false);
      setPaymentAmount('');
      toast.success('Transaksi berhasil!');

      setTimeout(() => printReceipt(), 300);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setProcessing(false);
      barcodeRef.current?.focus();
    }
  };

  const handlePrint = () => {
    if (!lastSale) {
      toast.warning('Belum ada transaksi untuk dicetak');
      return;
    }
    printReceipt();
  };

  return (
    <div className="pos-page">
      <nav className="navbar navbar-dark bg-success px-3 shadow-sm">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-cart4 me-2"></i>Retail POS
        </span>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white d-none d-md-inline">
            <i className="bi bi-shop me-1"></i>{user?.store?.name}
          </span>
          <span className="text-white-50">
            <i className="bi bi-person-circle me-1"></i>{user?.name}
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </nav>

      <div className="pos-container">
        <div className="pos-left">
          <div className="card shadow-sm mb-3">
            <div className="card-body py-3">
              <form onSubmit={handleScan}>
                <label className="form-label fw-semibold mb-2">
                  <i className="bi bi-upc-scan me-1"></i>Scan Barcode
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-success text-white">
                    <i className="bi bi-upc"></i>
                  </span>
                  <input
                    ref={barcodeRef}
                    type="text"
                    className="form-control"
                    placeholder="Scan atau ketik barcode lalu Enter..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={scanning}
                    autoFocus
                  />
                  <button className="btn btn-success" type="submit" disabled={scanning}>
                    {scanning ? '...' : 'Cari'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm pos-cart-card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-cart3 me-2"></i>Keranjang
                {totalItems > 0 && (
                  <span className="badge bg-success ms-2">{totalItems} item</span>
                )}
              </h6>
            </div>
            <div className="card-body p-0">
              {cart.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-cart-x" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2 mb-0">Scan barcode untuk menambah barang</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Barang</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Harga</th>
                        <th className="text-end">Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.productId}>
                          <td className="ps-3">
                            <div className="fw-semibold">{item.name}</div>
                            <small className="text-muted">{item.barcode}</small>
                          </td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => updateQty(item.productId, -1)}
                              >−</button>
                              <span className="btn btn-light disabled px-3">{item.quantity}</span>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => updateQty(item.productId, 1)}
                              >+</button>
                            </div>
                          </td>
                          <td className="text-end">{formatCurrency(item.price)}</td>
                          <td className="text-end fw-semibold">
                            {formatCurrency(item.quantity * item.price)}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(item.productId)}
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pos-right">
          <div className="card shadow-sm pos-summary-card">
            <div className="card-body">
              <h5 className="text-center mb-3">Pembayaran</h5>

              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  <i className="bi bi-tag me-1"></i>Kode Promo
                </label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    placeholder="Kode promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={!!appliedPromo}
                  />
                  {appliedPromo ? (
                    <button className="btn btn-outline-danger" type="button" onClick={clearPromo}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning"
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={applyingPromo || cart.length === 0}
                    >
                      {applyingPromo ? '...' : 'Pakai'}
                    </button>
                  )}
                </div>
                {appliedPromo && (
                  <small className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    {appliedPromo.name} (-{formatCurrency(discountAmount)})
                  </small>
                )}
              </div>

              <div className="pos-total-display text-center mb-4">
                {discountAmount > 0 && (
                  <>
                    <small className="text-muted text-decoration-line-through d-block">
                      {formatCurrency(subtotal)}
                    </small>
                  </>
                )}
                <small className="text-muted">TOTAL</small>
                <h2 className="fw-bold text-success mb-0">{formatCurrency(total)}</h2>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Metode Pembayaran</label>
                <div className="d-grid gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`btn btn-outline-${method.color} ${paymentMethod === method.id ? `active btn-${method.color} text-white` : ''}`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <i className={`bi ${method.icon} me-2`}></i>{method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-success btn-lg"
                  onClick={openPayment}
                  disabled={cart.length === 0}
                >
                  <i className="bi bi-check-circle me-2"></i>Bayar
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleCancel}
                  disabled={cart.length === 0}
                >
                  <i className="bi bi-x-circle me-2"></i>Batal
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handlePrint}
                  disabled={!lastSale}
                >
                  <i className="bi bi-printer me-2"></i>Cetak Struk
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-cash me-2"></i>Konfirmasi Pembayaran
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPayment(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <small className="text-muted">Total Belanja</small>
                  <h3 className="fw-bold text-success">{formatCurrency(total)}</h3>
                  <span className="badge bg-secondary">{paymentMethod}</span>
                </div>

                {paymentMethod === 'TUNAI' ? (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Jumlah Uang</label>
                    <input
                      type="number"
                      className="form-control form-control-lg text-end"
                      min={total}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0"
                      autoFocus
                    />
                    {Number(paymentAmount) >= total && (
                      <div className="alert alert-info mt-3 mb-0 text-center">
                        <small>Kembalian</small>
                        <h4 className="fw-bold mb-0">{formatCurrency(change)}</h4>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-info text-center">
                    Pembayaran {paymentMethod}: <strong>{formatCurrency(total)}</strong>
                  </div>
                )}

                <div className="d-flex gap-2 quick-cash mb-3">
                  {[total, 10000, 20000, 50000, 100000].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4).map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="btn btn-outline-success btn-sm flex-fill"
                      onClick={() => setPaymentAmount(String(amount))}
                    >
                      {amount === total ? 'Pas' : `${amount / 1000}rb`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPayment(false)}>Batal</button>
                <button
                  className="btn btn-success btn-lg"
                  onClick={handlePay}
                  disabled={processing || (paymentMethod === 'TUNAI' && Number(paymentAmount) < total)}
                >
                  {processing ? 'Memproses...' : 'Konfirmasi Bayar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Receipt sale={lastSale} />
    </div>
  );
};

export default POS;