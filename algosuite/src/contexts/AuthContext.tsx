import { useState, useEffect, ReactNode } from 'react';
import { api } from '../api/apiClient';
import { AuthContext } from './auth-context-type';
import { getApiBaseUrl, getHostInfo } from '../utils/apiConfig';

// User type
interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name: string;
}

// Auth state type
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Local storage keys
const TOKEN_KEY = 'algosuite_token';
const REFRESH_TOKEN_KEY = 'algosuite_refresh_token';
const USER_KEY = 'algosuite_user';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize auth state from local storage if available
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);

    // Log token status and API configuration for debugging
    const apiBaseUrl = getApiBaseUrl();
    const hostInfo = getHostInfo();
    console.log('Auth initialization:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      apiBaseUrl,
      hostInfo
    });

    // Ensure we have both tokens
    if (token && !refreshToken) {
      console.warn('Access token exists but no refresh token found - this may cause issues with token refresh');
    }

    return {
      isAuthenticated: !!token,
      token: token,
      user: user ? JSON.parse(user) : null,
    };
  });

  // Set auth headers whenever token changes
  useEffect(() => {
    if (authState.token) {
      // Set default Authorization header for all requests
      api.setAuthHeader(authState.token);
    } else {
      // Remove Authorization header when not authenticated
      api.removeAuthHeader();
    }
  }, [authState.token]);

  // Set up token refresh interval
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    console.log('Setting up token refresh interval...');

    // Don't try to refresh immediately on login - the token is already fresh
    // Only set up the interval for automatic refresh

    // Refresh token every 25 minutes (tokens typically expire after 30 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        console.log('Auto-refreshing token...');
        await refreshToken();
      } catch (error) {
        console.error('Auto-refresh token error:', error);
      }
    }, 25 * 60 * 1000); // 25 minutes

    return () => clearInterval(refreshInterval);
  }, [authState.isAuthenticated]);

  // Listen for auth:failed events
  useEffect(() => {
    const handleAuthFailed = (event: Event) => {
      const customEvent = event as CustomEvent;
      const errorDetail = customEvent.detail?.error || 'Unknown error';
      console.log(`Authentication failed event received: ${errorDetail}`);

      // Be very selective about when to log out
      // Only log out for critical authentication errors, not for refresh token issues
      // This prevents logout on page refresh
      if (errorDetail.includes('Incorrect email or password') ||
          errorDetail.includes('Invalid credentials')) {
        console.log('Critical auth error - logging out');
        logout();
      } else {
        console.log('Non-critical auth error - not logging out');
      }
    };

    window.addEventListener('auth:failed', handleAuthFailed);

    return () => {
      window.removeEventListener('auth:failed', handleAuthFailed);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      // Create JSON payload with email and password
      const loginPayload = {
        email: email,
        password: password
      };

      // Call the backend API to authenticate
      const apiBaseUrl = getApiBaseUrl();
      console.log('Login attempt to:', `${apiBaseUrl}/v1/auth/login`);
      const response = await fetch(`${apiBaseUrl}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.detail || `Authentication failed (${response.status})`;
        throw new Error(errorMessage);
      }

      // Parse the response
      const data = await response.json();

      console.log('Login successful, received tokens');

      // Validate that we received the expected tokens
      if (!data.access_token) {
        throw new Error('No access token received from server');
      }

      // Store tokens in localStorage
      localStorage.setItem(TOKEN_KEY, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      }

      console.log('Tokens stored in localStorage:', {
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
      });

      // SECURITY NOTICE: In production, always validate tokens on the backend
      // The following approach prioritizes backend validation when available
      let userInfo;

      try {
        // First try to get user info from API (secure approach)
        userInfo = await fetchUserInfo(data.access_token);
        console.log('Successfully retrieved user info from backend');
      } catch (userInfoError) {
        console.warn('Backend /me endpoint failed, using token decoding as TEMPORARY fallback', userInfoError);
        console.warn('SECURITY WARNING: Token decoding on frontend should only be used during development');

        // DEVELOPMENT FALLBACK ONLY: Extract user info from token
        // This approach bypasses proper backend validation and should NOT be used in production
        userInfo = extractUserFromToken(data.access_token);

        if (!userInfo) {
          console.error('Both backend validation and token decoding failed');
          throw new Error('Failed to get user information');
        }
      }

      localStorage.setItem(USER_KEY, JSON.stringify(userInfo));

      // Update state
      setAuthState({
        isAuthenticated: true,
        token: data.access_token,
        user: userInfo,
      });

      // Set up token refresh interval
      // Only set up refresh interval if we have a refresh token
      if (data.refresh_token) {
        // Set up refresh interval - refresh token before it expires
        const tokenRefreshInterval = setInterval(() => {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
          if (refreshToken) {
            refreshAccessToken(refreshToken).catch(console.error);
          } else {
            clearInterval(tokenRefreshInterval);
          }
        }, 1000 * 60 * 15); // Refresh every 15 minutes
      }

      return userInfo;
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial auth state on error
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  };

  /**
   * SECURITY WARNING: This function is for DEVELOPMENT USE ONLY.
   *
   * Extracting and trusting user information from JWT tokens on the frontend
   * is NOT secure for production environments because:
   *
   * 1. It bypasses proper signature verification
   * 2. It doesn't validate if the user still exists in the database
   * 3. It doesn't check if the user account is still active/not banned
   * 4. It could be manipulated by sophisticated attackers
   *
   * In production, ALWAYS validate tokens on the backend through a proper /me endpoint.
   * This function should only be used as a fallback during development or when
   * backend services are temporarily unavailable.
   */
  const extractUserFromToken = (token: string): User | null => {
    if (!token) return null;

    try {
      // JWT tokens are in the format: header.payload.signature
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;

      // The payload is the second part (index 1) and is base64 encoded
      // Need to handle base64url format by replacing characters and adding padding
      const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - base64.length % 4) % 4);
      const jsonPayload = atob(base64 + padding);

      const payload = JSON.parse(jsonPayload);
      console.log('Extracted user info from token:', payload);
      console.warn('DEVELOPMENT MODE: Using unverified token data - NOT FOR PRODUCTION');

      // Create a user object from the payload
      return {
        id: payload.sub,
        email: payload.email,
        is_active: true, // Note: This is assumed without verification
        is_superuser: payload.role === 'admin', // Note: This is assumed without verification
        full_name: payload.name || '' // Use name if available
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Helper function to fetch user info from the API
  const fetchUserInfo = async (token: string): Promise<User> => {
    if (!token) {
      throw new Error('No token provided');
    }

    // Try up to 3 times with exponential backoff
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // If unauthorized, don't retry
          if (response.status === 401 || response.status === 403) {
            throw new Error(`Authentication error: ${response.status}`);
          }

          // For other errors, we'll retry
          throw new Error(`Failed to fetch user info: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        lastError = error;

        // Don't wait on the last attempt
        if (attempt < 2) {
          // Exponential backoff: 500ms, 1000ms
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
        }
      }
    }

    // All attempts failed
    throw lastError || new Error('Failed to fetch user info after multiple attempts');
  };

  // Function to refresh the access token using a refresh token
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/v1/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error('No access token received from server');
      }

      // Update the access token in localStorage
      localStorage.setItem(TOKEN_KEY, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      }

      // Update the auth state
      setAuthState(prev => ({
        ...prev,
        token: data.access_token,
      }));

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, log the user out
      logout();
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // With JWT-based auth, we just need to call the logout endpoint
      // No need to send the refresh token as we're not invalidating it server-side
      const apiBaseUrl = getApiBaseUrl();
      await fetch(`${apiBaseUrl}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        },
      }).catch(err => console.error('Error during logout API call:', err));
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and auth state
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      setAuthState({
        isAuthenticated: false,
        token: null,
        user: null,
      });
    }
  };

  // Register function
  const register = async (email: string, fullName: string, password: string) => {
    try {
      console.log('Registering user:', { email, fullName });

      // Split fullName into firstName and lastName
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Prepare registration data - IMPORTANT: Use firstName and lastName, NOT full_name
      const registrationData = {
        email,
        firstName, // Backend expects firstName (not full_name)
        lastName,  // Backend expects lastName
        password
      };

      // Log the exact data being sent to the backend
      console.log('Sending registration data to backend:', JSON.stringify(registrationData));

      // Call the backend API to register the user with the correct DTO format
      const response = await api.post('/v1/auth/register', registrationData);

      console.log('Registration successful:', response);

      // Return a properly typed response
      return {
        success: true,
        message: 'Registration successful',
        userId: typeof response === 'object' && response !== null && 'data' in response
          ? (response.data as any)?.id
          : undefined
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Token refresh function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        console.warn('No refresh token available in localStorage');
        throw new Error('No refresh token available');
      }

      console.log('Refreshing token from AuthContext...');

      // Call the backend API to refresh the token
      // Send refresh_token in the request body for better security
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(
        `${apiBaseUrl}/v1/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Token refresh failed with status ${response.status}: ${errorText}`);

        // Try to parse as JSON if possible
        let errorDetail = '';
        try {
          const errorData = JSON.parse(errorText);
          errorDetail = errorData.detail || '';
        } catch (e) {
          // Not valid JSON, use empty string for detail
        }

        throw new Error(errorDetail || `Token refresh failed with status ${response.status}`);
      }

      // Parse the response
      const data = await response.json();

      // Validate the response data
      if (!data.access_token) {
        console.error('Token refresh response missing access_token');
        throw new Error('Invalid token refresh response');
      }

      console.log('Token refreshed successfully in AuthContext');

      // Update tokens in local storage
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token || '');

      // Log token storage for debugging
      console.log('Refreshed tokens stored in localStorage:', {
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token
      });

      // Update auth state
      setAuthState((prev: AuthState) => ({
        ...prev,
        token: data.access_token,
      }));

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);

      // IMPORTANT: Never log out on token refresh errors
      // This prevents the user from being logged out on page refresh
      // The auth:failed event will handle critical auth errors

      throw error;
    }
  };

  // Provide the auth context to children
  return (
    <AuthContext.Provider value={{ authState, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
