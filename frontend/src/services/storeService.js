import api from './api';

export const getStores = async () => {
  const response = await api.get('/stores');
  return response.data;
};

export const getStore = async (id) => {
  const response = await api.get(`/stores/${id}`);
  return response.data;
};

export const createStore = async (data) => {
  const response = await api.post('/stores', data);
  return response.data;
};

export const updateStore = async (id, data) => {
  const response = await api.put(`/stores/${id}`, data);
  return response.data;
};

export const deleteStore = async (id) => {
  const response = await api.delete(`/stores/${id}`);
  return response.data;
};