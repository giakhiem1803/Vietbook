import axiosClient from './axiosClient';
import { getToken } from '../auth/token';
export const customersApi = { getAll: async () => (await axiosClient.get('/admin/customers', { headers: { Authorization: `Bearer ${getToken()}` } })).data };
