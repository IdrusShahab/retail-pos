import api from './api';

export const getPromos = async () => {
  const response = await api.get('/promos');
  return response.data;
};

export const createPromo = async (data) => {
  const response = await api.post('/promos', data);
  return response.data;
};

export const updatePromo = async (id, data) => {
  const response = await api.put(`/promos/${id}`, data);
  return response.data;
};

export const deletePromo = async (id) => {
  const response = await api.delete(`/promos/${id}`);
  return response.data;
};

export const validatePromo = async (code, items) => {
  const response = await api.post('/pos/validate-promo', { code, items });
  return response.data;
};