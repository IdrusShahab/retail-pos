import { formatCurrency, formatDate } from '../utils/format';

const Receipt = ({ sale }) => {
  if (!sale) return null;

  return (
    <div id="receipt-print" className="receipt-print">
      <div className="receipt-content">
        <div className="text-center mb-3">
          <h5 className="fw-bold mb-1">{sale.store?.name}</h5>
          <small>{sale.store?.address}</small>
          {sale.store?.phone && <small className="d-block">{sale.store.phone}</small>}
        </div>

        <hr className="my-2" />

        <div className="mb-2">
          <div className="d-flex justify-content-between">
            <small>No. Invoice</small>
            <small className="fw-semibold">{sale.invoiceNumber}</small>
          </div>
          <div className="d-flex justify-content-between">
            <small>Tanggal</small>
            <small>{formatDate(sale.createdAt)}</small>
          </div>
          <div className="d-flex justify-content-between">
            <small>Kasir</small>
            <small>{sale.user?.name}</small>
          </div>
        </div>

        <hr className="my-2" />

        <table className="receipt-table w-100 mb-2">
          <thead>
            <tr>
              <th className="text-start">Barang</th>
              <th className="text-center">Qty</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.salesDetails?.map((item) => (
              <tr key={item.id}>
                <td>
                  <div>{item.product?.name}</div>
                  <small>{formatCurrency(item.price)}</small>
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-end">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="my-2" />

        {Number(sale.discountAmount) > 0 && (
          <>
            <div className="d-flex justify-content-between mb-1">
              <small>Subtotal</small>
              <small>{formatCurrency(sale.subtotal)}</small>
            </div>
            <div className="d-flex justify-content-between mb-1 text-danger">
              <small>Diskon {sale.promo?.code && `(${sale.promo.code})`}</small>
              <small>-{formatCurrency(sale.discountAmount)}</small>
            </div>
          </>
        )}
        <div className="d-flex justify-content-between fw-bold mb-1">
          <span>TOTAL</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
        <div className="d-flex justify-content-between mb-1">
          <small>Bayar ({sale.paymentMethod})</small>
          <small>{formatCurrency(sale.paymentAmount)}</small>
        </div>
        {sale.paymentMethod === 'TUNAI' && (
          <div className="d-flex justify-content-between mb-2">
            <small>Kembalian</small>
            <small className="fw-semibold">{formatCurrency(sale.changeAmount)}</small>
          </div>
        )}

        <hr className="my-2" />

        <p className="text-center mb-0 mt-3">
          <strong>Terima Kasih</strong>
          <br />
          <small>Semoga puas berbelanja</small>
        </p>
      </div>
    </div>
  );
};

export const printReceipt = () => {
  window.print();
};

export default Receipt;