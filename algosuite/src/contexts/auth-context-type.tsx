import { createContext } from 'react';
import { AuthState } from '../types';

// Define the shape of the auth context
export interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<unknown>;
}

// Create the auth context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
