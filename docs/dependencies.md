# Dependencies Documentation

## External Dependencies

### Database

- **Type**: SQL Database
- **Connection**: SQLAlchemy ORM
- **Configuration**: `DATABASE_URL` in settings
- **Usage**: Storing application data
- **Files**:
    - `app/db/session.py`: Database connection setup
    - `app/models/*.py`: Database models

### Keycloak

- **Type**: Identity and Access Management
- **Configuration**:
    - `KEYCLOAK_URL`: Keycloak server URL
    - `KEYCLOAK_REALM`: Keycloak realm
    - `KEYCLOAK_CLIENT_ID`: Client ID
    - `KEYCLOAK_CLIENT_SECRET`: Client secret
    - `KEYCLOAK_ADMIN_USERNAME`: Admin username
    - `KEYCLOAK_ADMIN_PASSWORD`: Admin password
- **Usage**: External authentication provider (not fully implemented in the code)

### Redis

- **Type**: In-memory data store
- **Configuration**:
    - `REDIS_HOST`: Redis server host
    - `REDIS_PORT`: Redis server port
- **Usage**: Caching and possibly token blacklisting (mentioned in auth.py)

### Celery

- **Type**: Task queue
- **Configuration**:
    - `CELERY_BROKER_URL`: Message broker URL
    - `CELERY_RESULT_BACKEND`: Result backend URL
- **Usage**: Background task processing
- **Files**:
    - `app/core/celery_app.py`: Celery application setup
    - `app/tasks/scans.py`: Scan tasks

### OpenAI

- **Type**: AI services
- **Configuration**:
    - `OPENAI_API_KEY`: OpenAI API key
- **Usage**: Not clear from the code, possibly for AI-assisted security analysis

## Internal Dependencies

### FastAPI Framework

- **Type**: Web framework
- **Usage**: API endpoints, request/response handling, dependency injection
- **Files**: All endpoint files in `app/api/`

### Pydantic

- **Type**: Data validation
- **Usage**: Request/response validation, settings management
- **Files**: All schema files in `app/schemas/`

### SQLAlchemy

- **Type**: ORM (Object-Relational Mapping)
- **Usage**: Database operations
- **Files**: All model files in `app/models/`

### Alembic

- **Type**: Database migration tool
- **Usage**: Managing database schema changes
- **Files**: `alembic/` directory

### JWT (jose)

- **Type**: Authentication
- **Usage**: Token-based authentication
- **Files**: `app/services/security.py`

### Passlib/bcrypt

- **Type**: Password hashing
- **Usage**: Secure password storage
- **Files**: `app/services/security.py`

## Dependency Injection

FastAPI uses dependency injection for:

- Database sessions
- Authentication
- Current user

### Database Dependency

```python
from app.db.session import get_db


@router.get("/endpoint")
async def endpoint(db: Session = Depends(get_db)):
    # Use db session
    pass
```

### Authentication Dependencies

```python
from app.api.dependencies.auth import get_current_active_user


@router.get("/endpoint")
async def endpoint(current_user: User = Depends(get_current_active_user)):
    # Use authenticated user
    pass
```

## Service Dependencies

The application uses service classes for business logic:

- `security_service`: Authentication and security operations
- `user_service`: User management operations

These services are implemented as singletons and imported where needed.

## Message Queues and Event Systems

- **Celery**: Used for asynchronous task processing
- **Broker**: Not specified in the code, but typically RabbitMQ or Redis
- **Tasks**: Scan execution tasks in `app/tasks/scans.py`

## Caching Mechanisms

- **Redis**: Configured but usage not clear from the code
- **Potential uses**: Session caching, token blacklisting, result caching

## Third-Party Services

- **Keycloak**: Identity and access management
- **OpenAI**: AI services (usage not clear)