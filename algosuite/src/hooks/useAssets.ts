import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import { PaginationParams, AssetType } from '../types';

// Query keys for better cache management
export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (projectId: string, surfaceId: string, params?: PaginationParams) =>
    [...assetKeys.lists(), projectId, surfaceId, params] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (projectId: string, surfaceId: string, assetId: string) =>
    [...assetKeys.details(), projectId, surfaceId, assetId] as const,
};

/**
 * Custom hook to fetch all assets for a specific attack surface
 */
export function useAssets(projectId: string, surfaceId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: assetKeys.list(projectId, surfaceId, params),
    queryFn: () => projectsApi.getAssets(projectId, surfaceId, params),
    enabled: !!projectId && !!surfaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch a single asset by ID
 */
export function useAsset(projectId: string, surfaceId: string, assetId: string) {
  return useQuery({
    queryKey: assetKeys.detail(projectId, surfaceId, assetId),
    queryFn: () => projectsApi.getAsset(projectId, surfaceId, assetId),
    enabled: !!projectId && !!surfaceId && !!assetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to create a new asset
 */
export function useCreateAsset(projectId: string, surfaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newAsset: {
      name: string;
      asset_type: AssetType;
      description?: string;
      asset_metadata?: Record<string, unknown>;
    }) => projectsApi.createAsset(projectId, surfaceId, newAsset),
    onSuccess: () => {
      // Invalidate assets list queries to refetch data
      queryClient.invalidateQueries({
        queryKey: assetKeys.list(projectId, surfaceId)
      });
      // Also invalidate the attack surface query to update the assets list
      queryClient.invalidateQueries({
        queryKey: ['attack-surfaces', 'detail', projectId, surfaceId]
      });
    },
  });
}

/**
 * Custom hook to update an existing asset
 */
export function useUpdateAsset(projectId: string, surfaceId: string, assetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedAsset: {
      name?: string;
      asset_type?: AssetType;
      description?: string;
      asset_metadata?: Record<string, unknown>;
    }) => projectsApi.updateAsset(projectId, surfaceId, assetId, updatedAsset),
    onSuccess: (updatedAsset) => {
      // Update the asset in the cache
      queryClient.setQueryData(
        assetKeys.detail(projectId, surfaceId, assetId),
        updatedAsset
      );
      // Invalidate assets list to refetch
      queryClient.invalidateQueries({
        queryKey: assetKeys.list(projectId, surfaceId)
      });
      // Also invalidate the attack surface query to update the assets list
      queryClient.invalidateQueries({
        queryKey: ['attack-surfaces', 'detail', projectId, surfaceId]
      });
    },
  });
}

/**
 * Custom hook to delete an asset
 */
export function useDeleteAsset(projectId: string, surfaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) =>
      projectsApi.deleteAsset(projectId, surfaceId, assetId),
    onSuccess: (_data, assetId) => {
      // Remove the asset from the cache
      queryClient.removeQueries({
        queryKey: assetKeys.detail(projectId, surfaceId, assetId)
      });
      // Invalidate assets list to refetch
      queryClient.invalidateQueries({
        queryKey: assetKeys.list(projectId, surfaceId)
      });
      // Also invalidate the attack surface query to update the assets list
      queryClient.invalidateQueries({
        queryKey: ['attack-surfaces', 'detail', projectId, surfaceId]
      });
    },
  });
}
