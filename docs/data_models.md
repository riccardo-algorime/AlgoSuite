# Data Models Documentation

## Database Models

### Base Model

- **File**: `app/models/base.py`
- **Description**: Base model for all SQLAlchemy models
- **Fields**:
    - `id`: UUID string, primary key
    - `created_at`: DateTime, creation timestamp
    - `updated_at`: DateTime, auto-updates on record changes

### User Model

- **File**: `app/models/user.py`
- **Description**: User model for authentication and authorization
- **Inherits**: BaseModel
- **Fields**:
    - `email`: String, unique, indexed, required
    - `hashed_password`: String, required
    - `full_name`: String, optional
    - `is_active`: Boolean, defaults to True, required
    - `is_superuser`: Boolean, defaults to False, required
- **Relationships**:
    - `scans`: One-to-many relationship with Scan model (cascade delete)
    - `projects`: One-to-many relationship with Project model (backref)

### Project Model

- **File**: `app/models/project.py`
- **Description**: Project model for organizing attack surfaces
- **Inherits**: BaseModel
- **Fields**:
    - `name`: String, required, indexed
    - `description`: Text, optional
    - `created_by`: String, foreign key to user.id, required
- **Relationships**:
    - `user`: Many-to-one relationship with User model
    - `attack_surfaces`: One-to-many relationship with AttackSurface model (cascade delete)

### AttackSurface Model

- **File**: `app/models/attack_surface.py`
- **Description**: Attack Surface model for organizing assets
- **Inherits**: BaseModel
- **Fields**:
    - `project_id`: String, foreign key to project.id, required, indexed
    - `surface_type`: String, required, indexed, defaults to "web"
    - `description`: Text, optional
    - `config`: JSON, optional
- **Relationships**:
    - `project`: Many-to-one relationship with Project model
    - `assets`: One-to-many relationship with Asset model (cascade delete)
- **Enums**:
    - `SurfaceType`: WEB, API, MOBILE, NETWORK, CLOUD, IOT, OTHER

### Asset Model

- **File**: `app/models/asset.py`
- **Description**: Asset model for representing security assets
- **Inherits**: BaseModel
- **Fields**:
    - `name`: String, required, indexed
    - `asset_type`: String, required, indexed, defaults to "server"
    - `description`: Text, optional
    - `asset_metadata`: JSON, optional
    - `attack_surface_id`: String, foreign key to attacksurface.id, required, indexed
- **Relationships**:
    - `attack_surface`: Many-to-one relationship with AttackSurface model
- **Enums**:
    - `AssetType`: SERVER, WEBSITE, DATABASE, APPLICATION, ENDPOINT, CONTAINER, NETWORK_DEVICE, CLOUD_RESOURCE, OTHER

### Scan Model

- **File**: `app/models/scan.py`
- **Description**: Scan model for security scans
- **Inherits**: BaseModel
- **Fields**:
    - `target`: String, required, indexed
    - `scan_type`: Enum(ScanType), required, indexed, defaults to VULNERABILITY
    - `description`: Text, optional
    - `config`: JSON, optional
    - `status`: Enum(ScanStatus), required, indexed, defaults to PENDING
    - `created_by`: String, foreign key to user.id, required
- **Relationships**:
    - `user`: Many-to-one relationship with User model
    - `findings`: One-to-many relationship with Finding model (cascade delete)
    - `result`: One-to-one relationship with ScanResult model (cascade delete)

### ScanResult Model

- **File**: `app/models/scan_result.py`
- **Description**: Scan result model for storing scan results
- **Inherits**: BaseModel
- **Fields**:
    - `scan_id`: String, foreign key to scan.id, required, unique
    - `high_count`: Integer, defaults to 0, required
    - `medium_count`: Integer, defaults to 0, required
    - `low_count`: Integer, defaults to 0, required
    - `info_count`: Integer, defaults to 0, required
- **Relationships**:
    - `scan`: One-to-one relationship with Scan model
    - `findings`: Many-to-many relationship with Finding model
- **Properties**:
    - `summary`: Returns a dictionary with counts of findings by severity

### Finding Model

- **File**: `app/models/finding.py`
- **Description**: Finding model for security findings
- **Inherits**: BaseModel
- **Fields**:
    - `title`: String, required
    - `description`: Text, required
    - `severity`: Enum(Severity), required, indexed, defaults to LOW
    - `cvss_score`: Float, optional
    - `cve_ids`: JSON, optional (list of CVE IDs)
    - `affected_components`: JSON, optional (list of affected components)
    - `remediation`: Text, optional
    - `references`: JSON, optional (list of reference URLs)
    - `scan_id`: String, foreign key to scan.id, required
- **Relationships**:
    - `scan`: Many-to-one relationship with Scan model
    - `scan_result`: Many-to-many relationship with ScanResult model

## Pydantic Schemas

### User Schemas

- **File**: `app/schemas/user.py`
- **Models**:
    - `UserBase`: Base class with common fields
    - `UserCreate`: For user creation (includes password)
    - `UserUpdate`: For user updates (optional fields)
    - `UserInDBBase`: Base class for DB models (includes id)
    - `User`: API response model
    - `UserInDB`: Internal DB model (includes hashed_password)

### Token Schemas

- **File**: `app/schemas/token.py`
- **Models**:
    - `Token`: API response model (access_token, token_type, refresh_token)
    - `TokenRefresh`: For token refresh requests (refresh_token)
    - `TokenPayload`: Internal model for token contents (sub, exp)

### Scan Schemas

- **File**: `app/schemas/scan.py`
- **Models**:
    - `ScanBase`: Base class with common fields
    - `ScanCreate`: For scan creation
    - `ScanUpdate`: For scan updates (optional fields)
    - `ScanInDBBase`: Base class for DB models (includes id, status, created_by)
    - `Scan`: API response model
    - `Finding`: Finding model for API responses
    - `ScanResultSummary`: Summary of findings by severity
    - `ScanResult`: Scan result model for API responses
- **Enums**:
    - `ScanType`: VULNERABILITY, NETWORK, WEB, API, MOBILE, CLOUD
    - `ScanStatus`: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
    - `Severity`: HIGH, MEDIUM, LOW, INFO

### Project Schemas

- **File**: `app/schemas/project.py`
- **Models**:
    - `Project`: Project model for API responses

### Attack Surface Schemas

- **File**: `app/schemas/attack_surface.py`
- **Models**:
    - `AttackSurface`: Attack surface model for API responses
    - `AttackSurfaceCreate`: For attack surface creation
    - `AttackSurfaceWithAssets`: Attack surface with assets for API responses

### Asset Schemas

- **File**: `app/schemas/asset.py`
- **Models**:
    - `Asset`: Asset model for API responses
    - `AssetCreate`: For asset creation
    - `AssetUpdate`: For asset updates

### Health Check Schemas

- **File**: `app/schemas/health.py`
- **Models**:
    - `HealthCheck`: Health check response model

## Model Relationships

```
User
├── scans (one-to-many)
└── projects (one-to-many)

Project
├── user (many-to-one)
└── attack_surfaces (one-to-many)

AttackSurface
├── project (many-to-one)
└── assets (one-to-many)

Asset
└── attack_surface (many-to-one)

Scan
├── user (many-to-one)
├── findings (one-to-many)
└── result (one-to-one)

ScanResult
├── scan (one-to-one)
└── findings (many-to-many)

Finding
├── scan (many-to-one)
└── scan_result (many-to-many)
```