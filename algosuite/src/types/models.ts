// Types for models used in the application

// Project model
export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner?: {
    id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  // Keep the old property names for backward compatibility
  created_by?: string;
  created_at?: string;
  updated_at?: string;
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
  project_id?: string; // Optional for backward compatibility
  surfaceType: SurfaceType; // Match backend camelCase
  surface_type?: SurfaceType; // Keep for backward compatibility
  description: string | null;
  config: Record<string, any> | null;
  created_at?: string; // Optional for backward compatibility
  updated_at?: string; // Optional for backward compatibility
  createdAt: string; // Match backend camelCase
  updatedAt: string; // Match backend camelCase
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

// Asset model
export enum AssetType {
  SERVER = "server",
  WEBSITE = "website",
  DATABASE = "database",
  APPLICATION = "application",
  ENDPOINT = "endpoint",
  CONTAINER = "container",
  NETWORK_DEVICE = "network_device",
  CLOUD_RESOURCE = "cloud_resource",
  OTHER = "other",
}

export interface Asset {
  id: string;
  name: string;
  asset_type: AssetType;
  description: string | null;
  asset_metadata: Record<string, any> | null;
  attack_surface_id: string;
  created_at: string;
  updated_at: string;
}

// Asset creation payload
export interface AssetCreate {
  name: string;
  asset_type: AssetType;
  description?: string;
  asset_metadata?: Record<string, any>;
}

// Asset update payload
export interface AssetUpdate {
  name?: string;
  asset_type?: AssetType;
  description?: string;
  asset_metadata?: Record<string, any>;
}

// Attack Surface with assets
export interface AttackSurfaceWithAssets extends AttackSurface {
  assets: Asset[];
}

// Pagination parameters
export interface PaginationParams {
  skip?: number;
  limit?: number;
}
