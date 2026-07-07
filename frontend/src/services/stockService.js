import api from './api';

export const getStock = async (storeId) => {
  const params = storeId ? { storeId } : {};
  const response = await api.get('/stock', { params });
  return response.data;
};

export const getStockMatrix = async () => {
  const response = await api.get('/stock/matrix');
  return response.data;
};

export const getStockByStore = async (storeId) => {
  const response = await api.get(`/stock/store/${storeId}`);
  return response.data;
};