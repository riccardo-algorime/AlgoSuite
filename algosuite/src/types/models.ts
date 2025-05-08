// Types for models used in the application

// Project model
export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Project creation payload
export interface ProjectCreate {
  name: string;
  description?: string;
}

// Project update payload
export interface ProjectUpdate {
  name?: string;
  description?: string;
}

// Attack Surface model
export enum SurfaceType {
  WEB = "web",
  API = "api",
  MOBILE = "mobile",
  NETWORK = "network",
  CLOUD = "cloud",
  IOT = "iot",
  OTHER = "other",
}

export interface AttackSurface {
  id: string;
  project_id: string;
  surface_type: SurfaceType;
  description: string | null;
  config: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// Attack Surface creation payload
export interface AttackSurfaceCreate {
  project_id: string;
  surface_type: SurfaceType;
  description?: string;
  config?: Record<string, any>;
}

// Attack Surface update payload
export interface AttackSurfaceUpdate {
  surface_type?: SurfaceType;
  description?: string;
  config?: Record<string, any>;
}

// Pagination parameters
export interface PaginationParams {
  skip?: number;
  limit?: number;
}
