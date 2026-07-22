import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

// Anh upload len server tra ve duong dan tuong doi (vd: /static/book_images/xxx.jpg)
// Anh tu URL ngoai (vd: https://covers.openlibrary.org/...) thi giu nguyen.
export function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url}`;
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  },
);

export default axiosClient;
