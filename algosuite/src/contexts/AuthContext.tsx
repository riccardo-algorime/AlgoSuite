import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/apiClient';
import { User, AuthState } from '../types';

// Define the shape of the auth context
interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<any>;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // Login function
  const login = async (username: string, password: string) => {
    try {
      // For development purposes, simulate a successful login
      // In a real application, this would be a call to the authentication server
      if (username === 'test' && password === 'password') {
        // Simulate a successful login response
        const data = {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          token_type: 'bearer',
          expires_in: 3600
        };

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

        // Update auth state
        setAuthState({
          isAuthenticated: true,
          token: data.access_token,
          user: userResponse,
        });

        return;
      } else if (username === 'admin' && password === 'admin') {
        // Simulate a successful login response for admin
        const data = {
          access_token: 'mock_access_token_admin',
          refresh_token: 'mock_refresh_token_admin',
          token_type: 'bearer',
          expires_in: 3600
        };

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

        // Update auth state
        setAuthState({
          isAuthenticated: true,
          token: data.access_token,
          user: userResponse,
        });

        return;
      }

      // If credentials don't match, throw an error
      throw new Error('Invalid username or password');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // In a real application, this would call the authentication server to invalidate the token
      console.log('Logging out...');
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

      return response;
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
        throw new Error('No refresh token available');
      }

      // In a real application, this would call the authentication server to refresh the token
      console.log('Refreshing token...');

      // Simulate a successful refresh response
      const data = {
        access_token: 'new_mock_access_token',
        refresh_token: 'new_mock_refresh_token',
        token_type: 'bearer',
        expires_in: 3600
      };

      // Update tokens in local storage
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        token: data.access_token,
      }));

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);

      // If refresh fails, log out the user
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

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
