import apiClient from './apiClient';

export const getNotes = async (params = {}) => {
  const response = await apiClient.get('/notes', { params });
  return response;
};

export const getNoteById = async (id) => {
  const response = await apiClient.get(`/notes/${id}`);
  return response;
};

export const searchNote = async (id, query) => {
  const response = await apiClient.get(`/notes/${id}/search`, {
    params: { q: query }
  });
  return response;
};

export const uploadNote = async (formData) => {
  const response = await apiClient.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response;
};

export const analyzeNote = async (id) => {
  const response = await apiClient.post(`/notes/${id}/analyze`);
  return response;
};

export const deleteNote = async (id) => {
  await apiClient.delete(`/notes/${id}`);
};

export default { getNotes, getNoteById, searchNote, uploadNote, analyzeNote, deleteNote };