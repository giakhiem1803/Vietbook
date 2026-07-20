import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';

export const authApi = {
  async register(data) {
    try {
      const response = await axiosClient.post('/register', data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to register');
      throw error;
    }
  },
  async login(data) {
    try {
      const response = await axiosClient.post('/login', data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to login');
      throw error;
    }
  },
};
