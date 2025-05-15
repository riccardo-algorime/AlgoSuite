# API Endpoints Documentation

## Authentication Endpoints

### POST /api/v1/auth/login

- **Description**: OAuth2 compatible token login
- **Request Body**: OAuth2PasswordRequestForm (username, password)
- **Response**: Token (access_token, token_type, refresh_token)
- **Authentication**: None

### POST /api/v1/auth/refresh

- **Description**: Refresh access token
- **Request Body**: TokenRefresh (refresh_token)
- **Response**: Token (access_token, token_type, refresh_token)
- **Authentication**: None

### POST /api/v1/auth/logout

- **Description**: Logout user (client-side only)
- **Request Body**: None
- **Response**: {"detail": "Successfully logged out"}
- **Authentication**: None

### GET /api/v1/auth/me

- **Description**: Get current user
- **Request Body**: None
- **Response**: User
- **Authentication**: Bearer token

## User Endpoints

### GET /api/v1/users

- **Description**: Get list of users
- **Query Parameters**: skip, limit
- **Response**: List[User]
- **Authentication**: Bearer token (superuser only)

### POST /api/v1/users

- **Description**: Create new user
- **Request Body**: UserCreate
- **Response**: User
- **Authentication**: Bearer token (superuser only)

### GET /api/v1/users/me

- **Description**: Get current user
- **Request Body**: None
- **Response**: User
- **Authentication**: Bearer token

### POST /api/v1/users/ensure-in-db

- **Description**: Ensure the current user exists in the database
- **Request Body**: None
- **Response**: User
- **Authentication**: Bearer token

### PUT /api/v1/users/me

- **Description**: Update current user
- **Request Body**: UserUpdate
- **Response**: User
- **Authentication**: Bearer token

### GET /api/v1/users/{user_id}

- **Description**: Get a specific user by id
- **Path Parameters**: user_id
- **Response**: User
- **Authentication**: Bearer token (own user or superuser)

## Registration Endpoints

### POST /api/v1/register

- **Description**: Register a new user
- **Request Body**: RegisterRequest (email, full_name, password)
- **Response**: User
- **Authentication**: None

## Health Check Endpoints

### GET /api/v1/health

- **Description**: Health check endpoint to verify API and database connection
- **Response**: HealthCheck (status, api_version, database_connected)
- **Authentication**: None

## Project Endpoints

### GET /api/v1/projects

- **Description**: Get list of projects
- **Query Parameters**: skip, limit
- **Response**: List[Project]
- **Authentication**: Bearer token

### POST /api/v1/projects

- **Description**: Create new project
- **Request Body**: ProjectCreate
- **Response**: Project
- **Authentication**: Bearer token

### GET /api/v1/projects/{project_id}

- **Description**: Get a specific project by id
- **Path Parameters**: project_id
- **Response**: Project
- **Authentication**: Bearer token

### GET /api/v1/projects/{project_id}/attack-surfaces

- **Description**: Get attack surfaces for a project
- **Path Parameters**: project_id
- **Query Parameters**: skip, limit
- **Response**: List[AttackSurface]
- **Authentication**: Bearer token

### POST /api/v1/projects/{project_id}/attack-surfaces

- **Description**: Create new attack surface for a project
- **Path Parameters**: project_id
- **Request Body**: AttackSurfaceCreate
- **Response**: AttackSurface
- **Authentication**: Bearer token

### GET /api/v1/projects/{project_id}/attack-surfaces/{surface_id}

- **Description**: Get a specific attack surface for a project
- **Path Parameters**: project_id, surface_id
- **Response**: AttackSurfaceWithAssets
- **Authentication**: Bearer token

## Asset Endpoints

### GET /api/v1/projects/{project_id}/attack-surfaces/{attack_surface_id}/assets

- **Description**: Get assets for a specific attack surface
- **Path Parameters**: project_id, attack_surface_id
- **Query Parameters**: skip, limit
- **Response**: List[Asset]
- **Authentication**: Bearer token

### POST /api/v1/projects/{project_id}/attack-surfaces/{attack_surface_id}/assets

- **Description**: Create new asset for an attack surface
- **Path Parameters**: project_id, attack_surface_id
- **Request Body**: AssetCreate
- **Response**: Asset
- **Authentication**: Bearer token

### GET /api/v1/projects/{project_id}/attack-surfaces/{attack_surface_id}/assets/{asset_id}

- **Description**: Get a specific asset by id
- **Path Parameters**: project_id, attack_surface_id, asset_id
- **Response**: Asset
- **Authentication**: Bearer token

### PUT /api/v1/projects/{project_id}/attack-surfaces/{attack_surface_id}/assets/{asset_id}

- **Description**: Update an existing asset
- **Path Parameters**: project_id, attack_surface_id, asset_id
- **Request Body**: AssetUpdate
- **Response**: Asset
- **Authentication**: Bearer token

### DELETE /api/v1/projects/{project_id}/attack-surfaces/{attack_surface_id}/assets/{asset_id}

- **Description**: Delete an asset
- **Path Parameters**: project_id, attack_surface_id, asset_id
- **Response**: {"detail": "Asset deleted successfully"}
- **Authentication**: Bearer token

## Scan Endpoints

### GET /api/v1/scans

- **Description**: Get list of scans
- **Query Parameters**: skip, limit
- **Response**: List[Scan]
- **Authentication**: Bearer token

### POST /api/v1/scans

- **Description**: Create new scan
- **Request Body**: ScanCreate
- **Response**: Scan
- **Authentication**: Bearer token

### GET /api/v1/scans/{scan_id}

- **Description**: Get a specific scan by id
- **Path Parameters**: scan_id
- **Response**: Scan
- **Authentication**: Bearer token

### GET /api/v1/scans/{scan_id}/results

- **Description**: Get results for a specific scan
- **Path Parameters**: scan_id
- **Response**: ScanResult
- **Authentication**: Bearer token