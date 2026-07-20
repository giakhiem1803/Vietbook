import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000',
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
