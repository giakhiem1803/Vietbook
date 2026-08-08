import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const ordersApi = {
  async checkout(cartItems, paymentMethod = 'VIETQR') {
    try {
      const payload = {
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          book_id: item.id,
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
  async submitPayment(paymentId) {
    try {
      const response = await axiosClient.post(`/payments/${paymentId}/submit`, {}, { headers: authHeader() });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to start MoMo payment');
      throw error;
    }
  },
  async updatePaymentStatus(paymentId, status, note = '') {
    const response = await axiosClient.patch(`/payments/${paymentId}/admin-status`, { status, note }, { headers: authHeader() });
    return response.data;
  },
  async getPaymentHistory(paymentId) {
    const response = await axiosClient.get(`/payments/${paymentId}/history`, { headers: authHeader() });
    return response.data;
  },
};
