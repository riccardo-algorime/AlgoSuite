import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import { PaginationParams, SurfaceType } from '../types';

// Query keys for better cache management
export const attackSurfaceKeys = {
  all: ['attack-surfaces'] as const,
  lists: () => [...attackSurfaceKeys.all, 'list'] as const,
  list: (projectId: string, params?: PaginationParams) =>
    [...attackSurfaceKeys.lists(), projectId, params] as const,
  details: () => [...attackSurfaceKeys.all, 'detail'] as const,
  detail: (projectId: string, surfaceId: string) =>
    [...attackSurfaceKeys.details(), projectId, surfaceId] as const,
};

/**
 * Custom hook to fetch all attack surfaces for a specific project
 */
export function useAttackSurfaces(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: attackSurfaceKeys.list(projectId, params),
    queryFn: () => projectsApi.getAttackSurfaces(projectId, params),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Alias for useAttackSurfaces for backward compatibility
 */
export const useProjectAttackSurfaces = useAttackSurfaces;

/**
 * Custom hook to fetch a single attack surface by ID
 */
export function useAttackSurface(projectId: string, surfaceId: string) {
  return useQuery({
    queryKey: attackSurfaceKeys.detail(projectId, surfaceId),
    queryFn: () => projectsApi.getAttackSurface(projectId, surfaceId),
    enabled: !!projectId && !!surfaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to create a new attack surface
 */
export function useCreateAttackSurface(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSurface: {
      surface_type: SurfaceType;
      description?: string;
      config?: Record<string, unknown>;
    }) => projectsApi.createAttackSurface(projectId, newSurface),
    onSuccess: () => {
      // Invalidate attack surfaces list queries to refetch data
      queryClient.invalidateQueries({
        queryKey: attackSurfaceKeys.list(projectId)
      });
    },
  });
}

/**
 * Custom hook to update an existing attack surface
 */
export function useUpdateAttackSurface(projectId: string, surfaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedSurface: {
      surface_type?: SurfaceType;
      description?: string;
      config?: Record<string, unknown>;
    }) => projectsApi.updateAttackSurface(projectId, surfaceId, updatedSurface),
    onSuccess: (updatedSurface) => {
      // Update the attack surface in the cache
      queryClient.setQueryData(
        attackSurfaceKeys.detail(projectId, surfaceId),
        updatedSurface
      );
      // Invalidate attack surfaces list to refetch
      queryClient.invalidateQueries({
        queryKey: attackSurfaceKeys.list(projectId)
      });
    },
  });
}

/**
 * Custom hook to delete an attack surface
 */
export function useDeleteAttackSurface(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (surfaceId: string) =>
      projectsApi.deleteAttackSurface(projectId, surfaceId),
    onSuccess: (_data, surfaceId) => {
      // Remove the attack surface from the cache
      queryClient.removeQueries({
        queryKey: attackSurfaceKeys.detail(projectId, surfaceId)
      });
      // Invalidate attack surfaces list to refetch
      queryClient.invalidateQueries({
        queryKey: attackSurfaceKeys.list(projectId)
      });
    },
  });
}
