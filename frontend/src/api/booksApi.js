import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const booksApi = {
  async getAll(params = {}) {
    try {
      const response = await axiosClient.get('/books', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch books');
      throw error;
    }
  },
  async getById(id) {
    try {
      const response = await axiosClient.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch book details');
      throw error;
    }
  },
  async create(payload) {
    try {
      const response = await axiosClient.post('/books', payload, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create book');
      throw error;
    }
  },
  async delete(id) {
    try {
      await axiosClient.delete(`/books/${id}`, { headers: authHeader() });
    } catch (error) {
      handleApiError(error, 'Failed to delete book');
      throw error;
    }
  },
};
