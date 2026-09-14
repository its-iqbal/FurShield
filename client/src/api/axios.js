/**
 * api/axios.js
 * Pre-configured Axios instance for FurShield API.
 * - Base URL from Vite env (VITE_API_URL) or defaults to localhost:5000
 * - Automatically attaches Bearer token from localStorage on every request
 * - 401 responses clear auth state and redirect to /login
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,          // send cookies too
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach stored JWT ────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('furshield_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 globally ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('furshield_token');
      localStorage.removeItem('furshield_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
