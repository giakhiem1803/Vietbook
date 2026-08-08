import axiosClient from './axiosClient';
import { getToken } from '../auth/token';
const headers = () => ({ Authorization: `Bearer ${getToken()}` });
export const customersApi = {
  getAll: async () => (await axiosClient.get('/admin/customers', { headers: headers() })).data,
  update: async (id, payload) => (await axiosClient.patch(`/admin/customers/${id}`, payload, { headers: headers() })).data,
};
