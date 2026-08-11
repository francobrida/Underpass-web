import axios from 'axios';

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL;
const DEV_FALLBACK_BASE_URL = 'http://localhost:8000/api/v1';

function resolveBaseURL() {
  if (configuredBaseURL) {
    return configuredBaseURL;
  }
  if (import.meta.env.DEV) {
    console.warn(
      `VITE_API_BASE_URL is not set. Falling back to ${DEV_FALLBACK_BASE_URL} for local development.`
    );
    return DEV_FALLBACK_BASE_URL;
  }
  throw new Error(
    'VITE_API_BASE_URL is required for non-development builds. Set it before building — this build is misconfigured.'
  );
}

const API_BASE_URL = resolveBaseURL();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthUser = (user) => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const getAuthUser = () => {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_user');
};

export default apiClient;
