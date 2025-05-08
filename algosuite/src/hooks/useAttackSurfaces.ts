import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import { PaginationParams } from '../types';

/**
 * Custom hook to fetch all attack surfaces for a specific project
 */
export function useProjectAttackSurfaces(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['project-attack-surfaces', projectId, params],
    queryFn: () => projectsApi.getAttackSurfaces(projectId, params),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch a single attack surface by ID
 */
export function useAttackSurface(projectId: string, surfaceId: string) {
  return useQuery({
    queryKey: ['attack-surface', projectId, surfaceId],
    queryFn: () => projectsApi.getAttackSurface(projectId, surfaceId),
    enabled: !!projectId && !!surfaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
