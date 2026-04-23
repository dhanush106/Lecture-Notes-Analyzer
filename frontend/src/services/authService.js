import apiClient from './apiClient';

export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response;
};

export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response;
};

export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response;
};

export default { register, login, getMe };