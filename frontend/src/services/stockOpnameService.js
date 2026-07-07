import api from './api';

export const getOpnameHistory = async (storeId) => {
  const params = storeId ? { storeId } : {};
  const response = await api.get('/stock-opname/history', { params });
  return response.data;
};

export const checkProductStock = async (storeId, productId) => {
  const response = await api.get('/stock-opname/check', {
    params: { storeId, productId },
  });
  return response.data;
};

export const createStockOpname = async (data) => {
  const response = await api.post('/stock-opname', data);
  return response.data;
};