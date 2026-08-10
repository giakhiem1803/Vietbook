import axiosClient from './axiosClient';
import { getToken } from '../auth/token';
const auth = () => ({ Authorization: `Bearer ${getToken()}` });
export const commerceApi = {
  wishlist: () => axiosClient.get('/wishlist', { headers: auth() }).then((r) => r.data),
  addWishlist: (bookId) => axiosClient.post(`/wishlist/${bookId}`, {}, { headers: auth() }),
  removeWishlist: (bookId) => axiosClient.delete(`/wishlist/${bookId}`, { headers: auth() }),
  reviews: (bookId) => axiosClient.get(`/books/${bookId}/reviews`).then((r) => r.data),
  review: (bookId, data) => axiosClient.put(`/books/${bookId}/review`, data, { headers: auth() }).then((r) => r.data),
  coupons: () => axiosClient.get('/admin/coupons', { headers: auth() }).then((r) => r.data),
  createCoupon: (data) => axiosClient.post('/admin/coupons', data, { headers: auth() }).then((r) => r.data),
  setCouponActive: (id, active) => axiosClient.patch(`/admin/coupons/${id}/active`, null, { headers: auth(), params: { active } }).then((r) => r.data),
};
