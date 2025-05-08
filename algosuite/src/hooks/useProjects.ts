import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import { PaginationParams } from '../types';

/**
 * Custom hook to fetch all projects for the current user
 */
export function useProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
