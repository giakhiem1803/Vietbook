import axiosClient from './axiosClient';
import { getToken } from '../auth/token';
const headers = () => ({ Authorization: `Bearer ${getToken()}` });
const get = (path, params) => axiosClient.get(path, { headers: headers(), params }).then((r) => r.data);
export const adminStatsApi = {
  getOverview: (params) => get('/admin/stats/overview', params),
  getRevenueSeries: (params) => get('/admin/stats/revenue-series', params),
  getOrderStatuses: (params) => get('/admin/stats/order-statuses', params),
  getTopBooks: (params) => get('/admin/stats/top-books', params),
  getRecentOrders: () => get('/admin/stats/recent-orders'),
  getLowStock: () => get('/admin/stats/low-stock'),
};
