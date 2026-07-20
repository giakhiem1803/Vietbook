export function handleApiError(error, fallbackMessage = 'API request failed') {
  if (error.response) {
    console.error('API Error Response:', error.response.status, error.response.data);
  } else if (error.request) {
    console.error('API Network Error:', error.request);
  } else {
    console.error('API Error:', error.message);
  }
}
