import { api } from './apiClient';
import { Project, AttackSurface, PaginationParams } from '../types';

// Convert PaginationParams to Record<string, string | number | boolean>
const convertParams = (params?: PaginationParams): Record<string, string | number | boolean> | undefined => {
  if (!params) return undefined;
  // Create a new object with the same properties
  return {
    page: params.page,
    limit: params.limit
  };
};

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
  }
};
