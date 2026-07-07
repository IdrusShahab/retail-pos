import api from './api';

export const getReceivings = async () => {
  const response = await api.get('/receivings');
  return response.data;
};

export const getReceiving = async (id) => {
  const response = await api.get(`/receivings/${id}`);
  return response.data;
};

export const createReceiving = async (data) => {
  const response = await api.post('/receivings', data);
  return response.data;
};