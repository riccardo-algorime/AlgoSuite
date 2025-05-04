import { createContext } from 'react';

// User type
export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name: string;
}

// Auth state type
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

// Response types
interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Auth context type
interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<TokenResponse>;
}

// Create auth context with default values
export const AuthContext = createContext<AuthContextType>({
  authState: {
    isAuthenticated: false,
    token: null,
    user: null,
  },
  login: async () => {},
  register: async () => {
    return {
      success: false,
      message: 'Not implemented'
    };
  },
  logout: async () => {},
  refreshToken: async () => {
    return {
      access_token: '',
      refresh_token: '',
      token_type: 'bearer',
      expires_in: 0
    };
  },
});
