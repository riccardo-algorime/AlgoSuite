// Base API client for making HTTP requests

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Default headers for all requests
const defaultHeaders = new Headers({
  'Content-Type': 'application/json',
});

// Store auth token for reuse
let authToken: string | null = null;

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Handles API requests with error handling and automatic JSON parsing
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query parameters if provided
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  // Create a new Headers object for this specific request
  const headers = new Headers(fetchOptions.headers || {});
  
  // Apply default headers if not overridden
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  
  // Always apply the current auth token if available
  if (authToken && !headers.has('Authorization')) {
    console.log('Adding Authorization header with token:', authToken.substring(0, 10) + '...');
    headers.set('Authorization', `Bearer ${authToken}`);
  } else {
    console.log('No auth token available for request to:', endpoint);
  }

  // Log the final headers for debugging
  console.log('Request headers for', endpoint, ':', Object.fromEntries(headers.entries()));

  // Make the request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle non-2xx responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API request failed:', {
      url,
      status: response.status,
      error: errorData
    });
    throw new Error(
      errorData.detail || errorData.message || `API request failed with status ${response.status}`
    );
  }

  // Parse JSON response
  return response.json();
}

// Convenience methods for common HTTP methods
export const api = {
  // Set auth header for all requests
  setAuthHeader: (token: string) => {
    console.log('Setting auth token:', token.substring(0, 10) + '...');
    authToken = token;
  },

  // Remove auth header
  removeAuthHeader: () => {
    console.log('Removing auth token');
    authToken = null;
  },

  // Get current auth token
  getAuthToken: () => {
    return authToken;
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
