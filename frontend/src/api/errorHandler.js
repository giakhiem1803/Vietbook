export function handleApiError(error, fallbackMessage = 'API request failed') {
  if (error.response) {
    console.error('API Error Response:', error.response.status, error.response.data);
  } else if (error.request) {
    console.error('API Network Error:', error.request);
  } else {
    console.error('API Error:', error.message);
  }
}

export function getApiErrorMessage(error, fallbackMessage = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg || item.message).filter(Boolean).join('. ') || fallbackMessage;
  if (!error?.response && error?.request) return 'Không kết nối được API. Hãy kiểm tra backend đang chạy tại http://localhost:8000.';
  if (error?.response?.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (error?.response?.status === 403) return 'Bạn không có quyền truy cập dữ liệu này.';
  return fallbackMessage;
}
