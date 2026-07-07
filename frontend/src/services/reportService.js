import api from './api';

const buildParams = (filters) => {
  const params = {};
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.storeId) params.storeId = filters.storeId;
  if (filters.limit) params.limit = filters.limit;
  return params;
};

export const getDailySales = async (filters = {}) => {
  const response = await api.get('/reports/daily-sales', { params: buildParams(filters) });
  return response.data;
};

export const getMonthlySales = async (filters = {}) => {
  const response = await api.get('/reports/monthly-sales', { params: buildParams(filters) });
  return response.data;
};

export const getBestProducts = async (filters = {}) => {
  const response = await api.get('/reports/best-products', { params: buildParams(filters) });
  return response.data;
};

export const getSalesByStore = async (filters = {}) => {
  const response = await api.get('/reports/by-store', { params: buildParams(filters) });
  return response.data;
};

export const getStockReport = async (storeId) => {
  const params = storeId ? { storeId } : {};
  const response = await api.get('/reports/stock', { params });
  return response.data;
};

export const getLowStockReport = async (storeId) => {
  const params = storeId ? { storeId } : {};
  const response = await api.get('/reports/low-stock', { params });
  return response.data;
};

export const getSalesChart = async (filters = {}) => {
  const response = await api.get('/reports/sales-chart', { params: buildParams(filters) });
  return response.data;
};