import { api } from './apiClient';
import { User } from '../types';

/**
 * API client methods for user management
 */
export const usersApi = {
  /**
   * Get the current user's profile
   * @returns Promise with user data
   */
  getCurrentUser: (): Promise<User> => {
    return api.get<User>('/v1/auth/me');
  },

  /**
   * Ensure the current user exists in the database
   * This is a helper method to fix issues with user creation
   * @returns Promise with user data
   */
  ensureUserInDb: (): Promise<User> => {
    return api.post<User>('/v1/users/ensure-in-db');
  },

  /**
   * Update the current user's profile
   * @param userData The user data to update
   * @returns Promise with the updated user
   */
  updateCurrentUser: (userData: Partial<User>): Promise<User> => {
    return api.put<User>('/v1/users/me', userData);
  },
};
