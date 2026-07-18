import axios from 'axios';

/**
 * Centralized Axios instance for the PCForge API.
 *
 * - Base URL comes from the VITE_API_URL env variable, falling back to
 *   localhost:4000/api for local development.
 * - The response interceptor unwraps the backend's standard
 *   { success, message, data } envelope so callers receive `data` directly.
 * - The error interceptor normalizes all failures into a predictable shape
 *   with a human-readable `message` field.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
});

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
