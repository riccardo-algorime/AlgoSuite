import { useState, useEffect, ReactNode } from 'react';
import { api } from '../api/apiClient';
import { AuthContext } from './auth-context-type';

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

    // Log token status for debugging
    console.log('Auth initialization:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user
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
  const login = async (username: string, password: string) => {
    try {
      // Create form data for OAuth2 password flow
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      // No need for client_id anymore with PostgreSQL auth
      // formData.append('client_id', 'algosuite-frontend');
      formData.append('grant_type', 'password');

      // Call the backend API to authenticate
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Authentication failed');
      }

      // Parse the response
      const data = await response.json();

      console.log('Login successful, received tokens');

      // Validate that we received the expected tokens
      if (!data.access_token) {
        throw new Error('No access token received from server');
      }

      // Store tokens in local storage
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token || '');

      // Log token storage for debugging
      console.log('Tokens stored in localStorage:', {
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token
      });

      // Get user info using the token
      const userResponse = await fetchUserInfo(data.access_token);

      // Store user in local storage
      localStorage.setItem(USER_KEY, JSON.stringify(userResponse));

      // Update auth state
      setAuthState({
        isAuthenticated: true,
        token: data.access_token,
        user: userResponse,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Helper function to fetch user info
  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // With JWT-based auth, we just need to call the logout endpoint
      // No need to send the refresh token as we're not invalidating it server-side
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/v1/auth/logout`, {
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

      // Call the backend API to register the user
      const response = await api.post('/v1/register', {
        email,
        full_name: fullName,
        password
      });

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
      // Note: The backend expects refresh_token as a query parameter, not in the body
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/v1/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // No body needed as we're passing the token as a query parameter
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


