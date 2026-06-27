import axios from 'axios';

// Use relative URL so the Next.js rewrite handles it in dev (avoids CORS).
// In production, set NEXT_PUBLIC_API_URL and requests go straight to the API.
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const isDev = process.env.NODE_ENV !== 'production';
const API_BASE = isDev
  ? '/api'
  : (API_URL ? `${API_URL.replace(/\/$/, '')}/api` : '/api');

if (isDev) {
  console.log('Next.js rewrite enabled. API_BASE:', API_BASE);
}

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach JWT token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear session and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('parampare_user');
      // Don't redirect here — let each page handle it
    }
    return Promise.reject(error);
  }
);

export default apiClient;
