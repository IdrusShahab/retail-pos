import api from './api';

export const scanBarcode = async (barcode) => {
  const response = await api.get(`/pos/scan/${encodeURIComponent(barcode)}`);
  return response.data;
};

export const checkout = async (data) => {
  const response = await api.post('/pos/checkout', data);
  return response.data;
};

export { validatePromo } from './promoService';

export const getSale = async (id) => {
  const response = await api.get(`/pos/sales/${id}`);
  return response.data;
};