
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import { PaginationParams } from '../types';
import { useAuth } from './useAuth';

/**
 * Custom hook to fetch all projects for the current user
 */
export function useProjects(params?: PaginationParams) {
  const { authState } = useAuth();
  
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Only run the query if the user is authenticated
    enabled: !!authState.isAuthenticated && !!authState.token,
    // Handle authentication errors
    retry: (failureCount, error: any) => {
      // Don't retry on 401 Unauthorized errors
      if (error?.message?.includes('401')) {
        console.error('Authentication error when fetching projects:', error);
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    // Add onError handler for better debugging
    onError: (error: any) => {
      console.error('Error fetching projects:', error);
      if (error?.message?.includes('401')) {
        console.warn('Authentication issue detected. User may need to log in again.');
      }
    }
  });
}

/**
 * Custom hook to fetch a single project by ID
 */
export function useProject(id: string) {
  const { authState } = useAuth();
  
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(id),
    // Only run the query if we have an ID and the user is authenticated
    enabled: !!id && !!authState.isAuthenticated && !!authState.token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Handle authentication errors
    retry: (failureCount, error: any) => {
      // Don't retry on 401 Unauthorized errors
      if (error?.message?.includes('401')) {
        console.error('Authentication error when fetching project:', error);
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    // Add onError handler for better debugging
    onError: (error: any) => {
      console.error('Error fetching project:', error);
      if (error?.message?.includes('401')) {
        console.warn('Authentication issue detected. User may need to log in again.');
      }
    }
  });
}

