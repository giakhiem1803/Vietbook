import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminStatsApi = {
  async getOverview() {
    try {
      const response = await axiosClient.get('/admin/stats/overview', { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch overview stats');
      throw error;
    }
  },
  async getMonthlyRevenue() {
    try {
      const response = await axiosClient.get('/admin/stats/monthly-revenue', { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch monthly revenue');
      throw error;
    }
  },
};
