import axios from 'axios';

/**
 * Centralized Axios instance for the PCForge API.
 *
 * - Base URL comes from the VITE_API_URL env variable, falling back to
 *   localhost:5000/api/v1 for local development.
 * - The response interceptor unwraps the backend's standard
 *   { success, message, data } envelope so callers receive `data` directly.
 * - The error interceptor normalizes all failures into a predictable shape
 *   with a human-readable `message` field.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
});

// ── Request interceptor ──────────────────────────────────────────────
// Attach JWT token from localStorage to authorization headers if it exists.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pcforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ── Response interceptor ─────────────────────────────────────────────
// The backend always responds with { success, message, data }.
// On success we return the full response so individual API functions can
// access `response.data` (which is the envelope) directly.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Build a consistent error message regardless of failure type.
    let message = 'An unexpected error occurred.';

    if (error.response) {
      // Handle 401 — token expired or invalid. Auto-logout and redirect.
      if (error.response.status === 401) {
        const isOnLoginPage = window.location.pathname === '/login';
        if (!isOnLoginPage) {
          localStorage.removeItem('pcforge_token');
          const redirectPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;
        }
      }

      // Server responded with a non-2xx status
      const serverMessage = error.response.data?.message;
      message = serverMessage || `Server error (${error.response.status})`;
    } else if (error.request) {
      // Request was sent but no response received
      message = 'Network error — please check your connection and try again.';
    } else {
      // Something happened while setting up the request
      message = error.message;
    }

    return Promise.reject(new Error(message));
  },
);


export default apiClient;
