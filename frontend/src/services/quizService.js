import apiClient from './apiClient';

export const submitQuiz = async (noteId, answers) => {
  const response = await apiClient.post(`/quizzes/notes/${noteId}/submit`, { answers });
  return response;
};

export const getQuizHistory = async (params = {}) => {
  const response = await apiClient.get('/quizzes/history', { params });
  return response;
};

export const getQuizByNote = async (noteId) => {
  const response = await apiClient.get(`/quizzes/notes/${noteId}`);
  return response;
};

export default { submitQuiz, getQuizHistory, getQuizByNote };