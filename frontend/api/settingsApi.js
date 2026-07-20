import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const settingsApi = {
  async getBank() {
    try {
      const response = await axiosClient.get('/settings/bank');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch bank settings');
      throw error;
    }
  },
  async updateBank(payload) {
    try {
      const response = await axiosClient.put('/settings/bank', payload, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update bank settings');
      throw error;
    }
  },
};
