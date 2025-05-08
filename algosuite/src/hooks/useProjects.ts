import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import { PaginationParams } from '../types';

// Query keys for better cache management
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/**
 * Custom hook to fetch all projects for the current user
 */
export function useProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsApi.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProject: { name: string; description?: string }) =>
      projectsApi.createProject(newProject),
    onSuccess: () => {
      // Invalidate projects list queries to refetch data
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Custom hook to update an existing project
 */
export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedProject: { name?: string; description?: string }) =>
      projectsApi.updateProject(projectId, updatedProject),
    onSuccess: (updatedProject) => {
      // Update the project in the cache
      queryClient.setQueryData(
        projectKeys.detail(projectId),
        updatedProject
      );
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Custom hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      projectsApi.deleteProject(projectId),
    onSuccess: (_data, projectId) => {
      // Remove the project from the cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
