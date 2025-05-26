/**
 * API Configuration utilities
 * Handles dynamic API base URL determination for different environments
 */

/**
 * Get the API base URL based on environment and current location
 * Priority:
 * 1. VITE_API_BASE_URL environment variable (if set)
 * 2. Dynamic URL based on current window location
 * 3. Fallback to localhost for development
 */
export function getApiBaseUrl(): string {
  // Check if environment variable is explicitly set
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // In browser environment, try to determine API URL dynamically
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    
    // If accessing via localhost or 127.0.0.1, use localhost for API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000/api';
    }
    
    // For external access, use the same host with port 8000
    return `${protocol}//${hostname}:8000/api`;
  }

  // Fallback for SSR or other environments
  return 'http://localhost:8000/api';
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if we're accessing from localhost
 */
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Get the current host info for debugging
 */
export function getHostInfo() {
  if (typeof window === 'undefined') {
    return { hostname: 'unknown', protocol: 'unknown', port: 'unknown' };
  }
  
  const { protocol, hostname, port } = window.location;
  return { protocol, hostname, port };
}
