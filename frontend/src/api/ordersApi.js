import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const ordersApi = {
  async checkout(cartItems) {
    try {
      const payload = {
        items: cartItems.map((item) => ({
          book_id: item.id,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };
      const response = await axiosClient.post('/orders/checkout', payload, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to place order');
      throw error;
    }
  },
  async getMyOrders() {
    try {
      const response = await axiosClient.get('/orders/my', { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch orders');
      throw error;
    }
  },
  async getOrderById(id) {
    try {
      const response = await axiosClient.get(`/orders/${id}`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch order details');
      throw error;
    }
  },
  async getAllForAdmin() {
    try {
      const response = await axiosClient.get('/orders/admin/all', { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch all orders');
      throw error;
    }
  },
  async updateStatus(orderId, status) {
    try {
      const response = await axiosClient.patch(`/orders/${orderId}/status`, { status }, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update order status');
      throw error;
    }
  },
  async startMomoPayment(orderId) {
    try {
      const response = await axiosClient.post(`/payments/momo/${orderId}`, {}, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to start MoMo payment');
      throw error;
    }
  },
};
