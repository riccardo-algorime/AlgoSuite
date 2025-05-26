// Base API client for making HTTP requests
import { getApiBaseUrl } from '../utils/apiConfig';

const API_BASE_URL = getApiBaseUrl();

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

  // Check if we have a token and add it to the headers if not already present
  if (!headers.has('Authorization')) {
    const token = localStorage.getItem('algosuite_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Make the request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized errors by refreshing the token
  if (response.status === 401 && !skipTokenRefresh) {
    try {
      console.log(`Got 401 for ${endpoint}, attempting token refresh...`);

      // Check if we have a token in localStorage before trying to refresh
      const hasToken = !!localStorage.getItem('algosuite_token');
      const hasRefreshToken = !!localStorage.getItem('algosuite_refresh_token');

      if (!hasToken || !hasRefreshToken) {
        console.warn('Missing tokens, cannot refresh');
        // Don't try to refresh if we don't have tokens
        throw new Error('Missing authentication tokens');
      }

      // Try to refresh the token
      await refreshAuthToken();

      // Retry the request with the new token
      return apiRequest(endpoint, { ...options, skipTokenRefresh: true });
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      // If token refresh fails, proceed with the original error
      // But don't trigger a logout - just let the request fail
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
        console.warn('No refresh token available in localStorage');
        throw new Error('No refresh token available');
      }

      console.log('Attempting to refresh token...');

      // Call the refresh token endpoint - note that the backend expects the refresh_token as a direct parameter
      // not in a JSON body
      const response = await fetch(`${API_BASE_URL}/v1/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No body needed as we're passing the token as a query parameter
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`Token refresh failed with status ${response.status}: ${errorText}`);
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Validate the response data
      if (!data.access_token) {
        console.error('Token refresh response missing access_token');
        throw new Error('Invalid token refresh response');
      }

      console.log('Token refresh successful, received new tokens');

      // Update tokens in local storage
      localStorage.setItem('algosuite_token', data.access_token);
      localStorage.setItem('algosuite_refresh_token', data.refresh_token || '');

      // Update auth header
      defaultHeaders.set('Authorization', `Bearer ${data.access_token}`);
      console.log('Token refreshed successfully and stored in localStorage');

      resolve();
    } catch (error) {
      console.error('Error refreshing token:', error);

      // Don't clear auth data on refresh failure
      // Only notify about the error, but don't trigger a logout
      console.warn('Token refresh failed, but continuing without logging out');

      // Only dispatch auth:failed for critical errors
      // For refresh errors, we'll just continue with the original request
      if (error instanceof Error &&
          (error.message.includes('Invalid credentials') ||
           error.message.includes('Incorrect email or password'))) {
        window.dispatchEvent(new CustomEvent('auth:failed', {
          detail: { error: error instanceof Error ? error.message : String(error) }
        }));
      }

      reject(error);
    } finally {
      isRefreshing = false;
    }
  });

  return refreshPromise;
}

/**
 * Check if the current token is valid
 * @returns True if a token exists in localStorage
 */
function hasValidToken(): boolean {
  const token = localStorage.getItem('algosuite_token');
  return !!token;
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

  // Check if we have a valid token
  hasValidToken,

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
