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
    const user = localStorage.getItem(USER_KEY);

    console.log('AuthContext: Initializing from localStorage', { 
      hasToken: !!token, 
      tokenFirstChars: token ? token.substring(0, 10) + '...' : 'none',
      hasUser: !!user 
    });

    return {
      isAuthenticated: !!token,
      token: token,
      user: user ? JSON.parse(user) : null,
    };
  });

  // Set auth headers whenever token changes
  useEffect(() => {
    if (authState.token) {
      console.log('AuthContext: Token changed, setting auth header', { 
        tokenFirstChars: authState.token.substring(0, 10) + '...',
        isAuthenticated: authState.isAuthenticated
      });
      
      // Set default Authorization header for all requests
      api.setAuthHeader(authState.token);
      
      // Verify the token was set correctly
      setTimeout(() => {
        const currentToken = api.getAuthToken();
        console.log('AuthContext: Verifying token was set in API client', { 
          success: currentToken === authState.token,
          apiTokenFirstChars: currentToken ? currentToken.substring(0, 10) + '...' : 'none'
        });
        console.log('AuthContext: Verifying token was set correctly:', 
          currentToken === authState.token ? 'YES' : 'NO');
      }, 0);
    } else {
      console.log('AuthContext: No token available, removing auth header');
      // Remove Authorization header when not authenticated
      api.removeAuthHeader();
    }
  }, [authState.token]);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      console.log('AuthContext: Login attempt', { username });
      
      // For development purposes, simulate a successful login
      // In a real application, this would be a call to the authentication server
      if (username === 'test' && password === 'password') {
        console.log('AuthContext: Login successful for test user');
        
        // Simulate a successful login response
        const data = {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          token_type: 'bearer',
          expires_in: 3600
        };

        console.log('AuthContext: Storing tokens in localStorage', {
          tokenFirstChars: data.access_token.substring(0, 10) + '...',
          refreshTokenFirstChars: data.refresh_token.substring(0, 10) + '...'
        });

        // Store tokens in local storage
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

        // Create mock user object
        const userResponse = {
          id: '123456',
          email: 'test@example.com',
          is_active: true,
          is_superuser: false,
          full_name: 'Test User',
        };

        // Store user in local storage
        localStorage.setItem(USER_KEY, JSON.stringify(userResponse));

        console.log('AuthContext: Updating auth state with new token');
        
        // Update auth state
        setAuthState({
          isAuthenticated: true,
          token: data.access_token,
          user: userResponse,
        });

        // Verify token was stored correctly
        setTimeout(() => {
          const storedToken = localStorage.getItem(TOKEN_KEY);
          console.log('AuthContext: Verifying token storage after login', {
            success: storedToken === data.access_token,
            storedTokenFirstChars: storedToken ? storedToken.substring(0, 10) + '...' : 'none'
          });
        }, 0);

        return;
      } else if (username === 'admin' && password === 'admin') {
        console.log('AuthContext: Login successful for admin user');
        
        // Simulate a successful login response for admin
        const data = {
          access_token: 'mock_access_token_admin',
          refresh_token: 'mock_refresh_token_admin',
          token_type: 'bearer',
          expires_in: 3600
        };

        console.log('AuthContext: Storing admin tokens in localStorage', {
          tokenFirstChars: data.access_token.substring(0, 10) + '...',
          refreshTokenFirstChars: data.refresh_token.substring(0, 10) + '...'
        });

        // Store tokens in local storage
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

        // Create mock user object for admin
        const userResponse = {
          id: '654321',
          email: 'admin@example.com',
          is_active: true,
          is_superuser: true,
          full_name: 'Admin User',
        };

        // Store user in local storage
        localStorage.setItem(USER_KEY, JSON.stringify(userResponse));

        console.log('AuthContext: Updating auth state with new admin token');
        
        // Update auth state
        setAuthState({
          isAuthenticated: true,
          token: data.access_token,
          user: userResponse,
        });

        // Verify token was stored correctly
        setTimeout(() => {
          const storedToken = localStorage.getItem(TOKEN_KEY);
          console.log('AuthContext: Verifying admin token storage after login', {
            success: storedToken === data.access_token,
            storedTokenFirstChars: storedToken ? storedToken.substring(0, 10) + '...' : 'none'
          });
        }, 0);

        return;
      }

      // If credentials don't match, throw an error
      console.log('AuthContext: Login failed - invalid credentials');
      throw new Error('Invalid username or password');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // In a real application, this would call the authentication server to invalidate the token
      console.log('AuthContext: Logging out user');
      
      // Check what we're removing
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      
      console.log('AuthContext: Current state before logout', {
        hasToken: !!token,
        tokenFirstChars: token ? token.substring(0, 10) + '...' : 'none',
        hasRefreshToken: !!refreshToken,
        hasUser: !!user
      });
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    } finally {
      console.log('AuthContext: Clearing localStorage and auth state');
      
      // Clear local storage and auth state
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      setAuthState({
        isAuthenticated: false,
        token: null,
        user: null,
      });
      
      // Verify auth header was removed
      setTimeout(() => {
        const currentToken = api.getAuthToken();
        const storedToken = localStorage.getItem(TOKEN_KEY);
        
        console.log('AuthContext: Verifying logout cleanup', {
          apiTokenCleared: currentToken === null,
          localStorageTokenCleared: storedToken === null
        });
      }, 0);
    }
  };

  // Register function
  const register = async (email: string, fullName: string, password: string) => {
    try {
      console.log('AuthContext: Registering user', { email, fullName });

      console.log('Registering user:', { email, fullName });

      // Call the backend API to register the user
      const response = await api.post('/v1/register', {
        email,
        full_name: fullName,
        password
      });

      console.log('AuthContext: Registration successful', response);
      
      // Check if we have a token in the auth state
      console.log('AuthContext: Auth state after registration', {
        isAuthenticated: authState.isAuthenticated,
        hasToken: !!authState.token,
        tokenFirstChars: authState.token ? authState.token.substring(0, 10) + '...' : 'none'
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
      console.error('AuthContext: Registration error:', error);
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Token refresh function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      console.log('AuthContext: Attempting to refresh token', {
        hasRefreshToken: !!refreshToken,
        refreshTokenFirstChars: refreshToken ? refreshToken.substring(0, 10) + '...' : 'none'
      });

      if (!refreshToken) {
        console.log('AuthContext: No refresh token available');
        throw new Error('No refresh token available');
      }

      // In a real application, this would call the authentication server to refresh the token
      console.log('AuthContext: Refreshing token...');

      // Simulate a successful refresh response
      const data = {
        access_token: 'new_mock_access_token',
        refresh_token: 'new_mock_refresh_token',
        token_type: 'bearer',
        expires_in: 3600
      };

      console.log('AuthContext: Token refresh successful, updating storage', {
        newTokenFirstChars: data.access_token.substring(0, 10) + '...',
        newRefreshTokenFirstChars: data.refresh_token.substring(0, 10) + '...'
      });

      // Update tokens in local storage
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

      // Update auth state
      setAuthState((prev: AuthState) => {
        console.log('AuthContext: Updating auth state with refreshed token');
        return {
          ...prev,
          token: data.access_token,
        };
      });

      // Verify token was updated correctly
      setTimeout(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const apiToken = api.getAuthToken();
        
        console.log('AuthContext: Verifying token refresh', {
          localStorageUpdated: storedToken === data.access_token,
          apiClientUpdated: apiToken === data.access_token,
          storedTokenFirstChars: storedToken ? storedToken.substring(0, 10) + '...' : 'none',
          apiTokenFirstChars: apiToken ? apiToken.substring(0, 10) + '...' : 'none'
        });
      }, 0);

      return data;
    } catch (error) {
      console.error('AuthContext: Token refresh error:', error);

      // If refresh fails, log out the user
      console.log('AuthContext: Token refresh failed, logging out user');
      await logout();
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
