import { api } from './apiClient';
import {
  Project,
  AttackSurface,
  AttackSurfaceWithAssets,
  Asset,
  AssetType,
  PaginationParams,
  SurfaceType
} from '../types';

// Convert PaginationParams to Record<string, string | number | boolean>
const convertParams = (params?: PaginationParams): Record<string, string | number | boolean> | undefined => {
  if (!params) return undefined;
  // Create a new object with the same properties
  return {
    page: params.page,
    limit: params.limit
  };
};

// Project creation payload type
interface ProjectCreatePayload {
  name: string;
  description?: string;
}

// Project update payload type
interface ProjectUpdatePayload {
  name?: string;
  description?: string;
}

// Attack Surface creation payload type
interface AttackSurfaceCreatePayload {
  surface_type: SurfaceType;
  description?: string;
  config?: Record<string, unknown>;
}

// Attack Surface update payload type
interface AttackSurfaceUpdatePayload {
  surface_type?: SurfaceType;
  description?: string;
  config?: Record<string, unknown>;
}

// Asset creation payload type
interface AssetCreatePayload {
  name: string;
  asset_type: AssetType;
  description?: string;
  asset_metadata?: Record<string, unknown>;
}

// Asset update payload type
interface AssetUpdatePayload {
  name?: string;
  asset_type?: AssetType;
  description?: string;
  asset_metadata?: Record<string, unknown>;
}

/**
 * API client methods for projects and attack surfaces
 */
export const projectsApi = {
  /**
   * Get all projects for the current user
   * @param params Optional pagination parameters
   * @returns Promise with array of projects
   */
  getProjects: async (params?: PaginationParams): Promise<Project[]> => {
    return api.get<Project[]>('/v1/projects', { params: convertParams(params) });
  },

  /**
   * Get a specific project by ID
   * @param projectId The ID of the project to retrieve
   * @returns Promise with project data
   */
  getProject: (projectId: string): Promise<Project> => {
    return api.get<Project>(`/v1/projects/${projectId}`);
  },

  /**
   * Create a new project
   * @param project The project data to create
   * @returns Promise with the created project
   */
  createProject: (project: ProjectCreatePayload): Promise<Project> => {
    return api.post<Project>('/v1/projects', project);
  },

  /**
   * Update an existing project
   * @param projectId The ID of the project to update
   * @param project The project data to update
   * @returns Promise with the updated project
   */
  updateProject: (projectId: string, project: ProjectUpdatePayload): Promise<Project> => {
    return api.put<Project>(`/v1/projects/${projectId}`, project);
  },

  /**
   * Delete a project
   * @param projectId The ID of the project to delete
   * @returns Promise with void
   */
  deleteProject: (projectId: string): Promise<void> => {
    return api.delete<void>(`/v1/projects/${projectId}`);
  },

  /**
   * Get all attack surfaces for a specific project
   * @param projectId The ID of the project
   * @param params Optional pagination parameters
   * @returns Promise with array of attack surfaces
   */
  getAttackSurfaces: (projectId: string, params?: PaginationParams): Promise<AttackSurface[]> => {
    return api.get<AttackSurface[]>(`/v1/projects/${projectId}/attack-surfaces`, { params: convertParams(params) });
  },

  /**
   * Get a specific attack surface by ID
   * @param projectId The ID of the project
   * @param surfaceId The ID of the attack surface
   * @returns Promise with attack surface data
   */
  getAttackSurface: (projectId: string, surfaceId: string): Promise<AttackSurface> => {
    return api.get<AttackSurface>(`/v1/projects/${projectId}/attack-surfaces/${surfaceId}`);
  },

  /**
   * Create a new attack surface for a project
   * @param projectId The ID of the project
   * @param surface The attack surface data to create
   * @returns Promise with the created attack surface
   */
  createAttackSurface: (projectId: string, surface: AttackSurfaceCreatePayload): Promise<AttackSurface> => {
    return api.post<AttackSurface>(`/v1/projects/${projectId}/attack-surfaces`, surface);
  },

  /**
   * Update an existing attack surface
   * @param projectId The ID of the project
   * @param surfaceId The ID of the attack surface to update
   * @param surface The attack surface data to update
   * @returns Promise with the updated attack surface
   */
  updateAttackSurface: (
    projectId: string,
    surfaceId: string,
    surface: AttackSurfaceUpdatePayload
  ): Promise<AttackSurface> => {
    return api.put<AttackSurface>(`/v1/projects/${projectId}/attack-surfaces/${surfaceId}`, surface);
  },

  /**
   * Delete an attack surface
   * @param projectId The ID of the project
   * @param surfaceId The ID of the attack surface to delete
   * @returns Promise with void
   */
  deleteAttackSurface: (projectId: string, surfaceId: string): Promise<void> => {
    return api.delete<void>(`/v1/projects/${projectId}/attack-surfaces/${surfaceId}`);
  },

  /**
   * Get attack surface with assets
   * @param projectId The ID of the project
   * @param surfaceId The ID of the attack surface
   * @returns Promise with attack surface data including assets
   */
  getAttackSurfaceWithAssets: (projectId: string, surfaceId: string): Promise<AttackSurfaceWithAssets> => {
    return api.get<AttackSurfaceWithAssets>(`/v1/projects/${projectId}/attack-surfaces/${surfaceId}`);
  },

  /**
   * Get all assets for a specific attack surface
   * @param projectId The ID of the project
   * @param surfaceId The ID of the attack surface
   * @param params Optional pagination parameters
   * @returns Promise with array of assets
   */
  getAssets: (projectId: string, surfaceId: string, params?: PaginationParams): Promise<Asset[]> => {
    return api.get<Asset[]>(`/v1/projects/${projectId}/attack-surfaces/${surfaceId}/assets`, { params: convertParams(params) });
  },

  /**
   * Get a specific asset by ID
   * @param projectId The ID of the project
   * @param surfaceId The ID of the attack surface
   * @param assetId The ID of the asset
   * @returns Promise with asset data
   */
  getAsset: (projectId: string, surfaceId: string, assetId: string): Promise<Asset> => {
    return api.get<Asset>(`/v1/projects/${projectId}/attack-surfaces/${surfaceId}/assets/${assetId}`);
  },

  /**
   * Create a new asset for an attack surface
   * @param projectId The ID of the project
   * @param surfaceId The ID of the attack surface
   * @param asset The asset data to create
   * @returns Promise with the created asset
   */
  createAsset: (projectId: string, surfaceId: string, asset: AssetCreatePayload): Promise<Asset> => {
    return api.post<Asset>(`/v1/projects/${projectId}/attack-surfaces/${surfaceId}/assets`, asset);
  },

  /**
   * Update an existing asset
   * @param projectId The ID of the project
   * @param surfaceId The ID of the attack surface
   * @param assetId The ID of the asset to update
   * @param asset The asset data to update
   * @returns Promise with the updated asset
   */
  updateAsset: (
    projectId: string,
    surfaceId: string,
    assetId: string,
    asset: AssetUpdatePayload
  ): Promise<Asset> => {
    return api.put<Asset>(`/v1/projects/${projectId}/attack-surfaces/${surfaceId}/assets/${assetId}`, asset);
  },

  /**
   * Delete an asset
   * @param projectId The ID of the project
   * @param surfaceId The ID of the attack surface
   * @param assetId The ID of the asset to delete
   * @returns Promise with void
   */
  deleteAsset: (projectId: string, surfaceId: string, assetId: string): Promise<void> => {
    return api.delete<void>(`/v1/projects/${projectId}/attack-surfaces/${surfaceId}/assets/${assetId}`);
  }
};
