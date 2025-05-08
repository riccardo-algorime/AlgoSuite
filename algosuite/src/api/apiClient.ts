// Base API client for making HTTP requests

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Default headers for all requests
const defaultHeaders = new Headers({
  'Content-Type': 'application/json',
});

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  skipTokenRefresh?: boolean; // Skip token refresh on 401 errors
}

// Flag to prevent multiple token refresh attempts at once
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Handles API requests with error handling and automatic JSON parsing
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipTokenRefresh = false, ...fetchOptions } = options;

  // Build URL with query parameters if provided
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  // Set default headers
  const headers = new Headers(options.headers || defaultHeaders);
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  // Make the request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized errors by refreshing the token
  if (response.status === 401 && !skipTokenRefresh) {
    try {
      // Try to refresh the token
      await refreshAuthToken();

      // Retry the request with the new token
      return apiRequest(endpoint, { ...options, skipTokenRefresh: true });
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      // If token refresh fails, proceed with the original error
    }
  }

  // Handle non-2xx responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.message || `API request failed with status ${response.status}`
    );
  }

  // Parse JSON response
  return response.json();
}

/**
 * Refreshes the authentication token
 */
async function refreshAuthToken(): Promise<void> {
  // If already refreshing, wait for that to complete
  if (isRefreshing) {
    return refreshPromise as Promise<void>;
  }

  isRefreshing = true;
  refreshPromise = new Promise<void>(async (resolve, reject) => {
    try {
      const refreshToken = localStorage.getItem('algosuite_refresh_token');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call the refresh token endpoint
      const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Update tokens in local storage
      localStorage.setItem('algosuite_token', data.access_token);
      localStorage.setItem('algosuite_refresh_token', data.refresh_token || '');

      // Update auth header
      defaultHeaders.set('Authorization', `Bearer ${data.access_token}`);

      resolve();
    } catch (error) {
      console.error('Error refreshing token:', error);

      // Clear auth data on refresh failure
      localStorage.removeItem('algosuite_token');
      localStorage.removeItem('algosuite_refresh_token');
      localStorage.removeItem('algosuite_user');
      defaultHeaders.delete('Authorization');

      // Dispatch a custom event to notify the app about auth failure
      window.dispatchEvent(new CustomEvent('auth:failed'));

      reject(error);
    } finally {
      isRefreshing = false;
    }
  });

  return refreshPromise;
}

// Convenience methods for common HTTP methods
export const api = {
  // Set auth header for all requests
  setAuthHeader: (token: string) => {
    defaultHeaders.set('Authorization', `Bearer ${token}`);
  },

  // Remove auth header
  removeAuthHeader: () => {
    defaultHeaders.delete('Authorization');
  },

  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
