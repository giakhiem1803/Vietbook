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
  async update(id, payload) {
    try {
      const response = await axiosClient.put(`/books/${id}`, payload, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update book');
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
  async uploadImage(id, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosClient.post(`/books/${id}/image`, formData, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to upload image');
      throw error;
    }
  },
  async restock(id, payload) {
    try {
      const response = await axiosClient.post(`/books/${id}/restock`, payload, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to restock');
      throw error;
    }
  },
  async getStockLogs(id) {
    try {
      const response = await axiosClient.get(`/books/${id}/stock-logs`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch stock logs');
      throw error;
    }
  },
};
