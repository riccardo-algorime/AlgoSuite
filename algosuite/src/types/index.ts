// Common type definitions for the application
export * from './models';

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination metadata in API responses
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Surface types for attack surfaces
 */
export enum SurfaceType {
  WEB = "web",
  API = "api",
  MOBILE = "mobile",
  NETWORK = "network",
  CLOUD = "cloud",
  IOT = "iot",
  OTHER = "other"
}

/**
 * Project information
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Attack Surface information
 */
export interface AttackSurface {
  id: string;
  project_id?: string; // Optional for backward compatibility
  surfaceType: SurfaceType; // Match backend camelCase
  surface_type?: SurfaceType; // Keep for backward compatibility
  description?: string;
  config?: Record<string, unknown>;
  created_at?: string; // Optional for backward compatibility
  updated_at?: string; // Optional for backward compatibility
  createdAt: string; // Match backend camelCase
  updatedAt: string; // Match backend camelCase
}
