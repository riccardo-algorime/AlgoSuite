# Authentication and Authorization Documentation

## Authentication Methods

### JWT-Based Authentication

The application uses JSON Web Tokens (JWT) for authentication.

- **Implementation**: `app/services/security.py`
- **Token Creation**: `security_service.create_access_token()`
- **Token Validation**: `security_service.decode_token()`
- **Token Lifetime**: Configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 30 minutes)
- **Refresh Tokens**: Implemented with 30-day expiry

#### Token Flow

1. User logs in with username/password via `/api/v1/auth/login`
2. Server validates credentials and returns access token and refresh token
3. Client includes access token in Authorization header for subsequent requests
4. When access token expires, client can use refresh token to get a new access token via `/api/v1/auth/refresh`
5. Logout is client-side only (token removal from storage)

#### Token Structure

- **Payload**:
    - `sub`: User ID
    - `exp`: Expiration timestamp
- **Signing**: HMAC-SHA256 (HS256) with server's secret key

### Potential Keycloak Integration

The application has configuration for Keycloak integration, but it doesn't appear to be fully implemented in the code.

- **Configuration**: `app/core/config.py`
- **Settings**:
    - `KEYCLOAK_URL`
    - `KEYCLOAK_REALM`
    - `KEYCLOAK_CLIENT_ID`
    - `KEYCLOAK_CLIENT_SECRET`
    - `KEYCLOAK_ADMIN_USERNAME`
    - `KEYCLOAK_ADMIN_PASSWORD`

## Password Management

- **Hashing**: bcrypt via passlib
- **Implementation**: `security_service.get_password_hash()` and `security_service.verify_password()`
- **Storage**: `hashed_password` field in User model

## Permission Structures

### User Roles

- **Regular User**: Basic access to own resources
- **Superuser**: Administrative access to all resources

### Role Storage

- `is_superuser` field in User model

## Role-Based Access Control

### Endpoint Protection

Endpoints are protected using FastAPI dependency injection:

- `get_current_user`: Ensures user is authenticated
- `get_current_active_user`: Ensures user is authenticated and active
- `get_current_active_superuser`: Ensures user is authenticated, active, and a superuser

### Implementation

```
from app.api.dependencies.auth import get_current_active_user, get_current_active_superuser

# Endpoint accessible to any authenticated active user
@router.get("/endpoint")
async def endpoint(current_user: User = Depends(get_current_active_user)):
    # ...

# Endpoint accessible only to superusers
@router.get("/admin-endpoint")
async def admin_endpoint(current_user: User = Depends(get_current_active_superuser)):
    # ...
```

### Resource-Level Authorization

Some endpoints implement resource-level authorization checks:

- Users can only access their own user data unless they are superusers
- Users can only access projects they created or are associated with

Example from `users.py`:

```python
# Users can only access their own data unless they are superusers
if user_id != current_user.id and not current_user.is_superuser:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not enough permissions"
    )
```

## Token Handling and Session Management

- **Token Storage**: Client-side (not specified in the code)
- **Session Management**: Stateless JWT-based authentication
- **Token Blacklisting**: Not implemented, but mentioned as a potential enhancement using Redis

## Security Considerations

- **Token Expiration**: Access tokens expire after 30 minutes by default
- **Refresh Tokens**: Longer-lived (30 days) for convenience
- **Password Security**: Passwords are hashed with bcrypt
- **HTTPS**: Not enforced in the code, but should be used in production
- **CORS**: Configured in `app/core/config.py` with allowed origins

## Potential Improvements

- Implement token blacklisting for logout
- Complete Keycloak integration for enterprise-grade authentication
- Add rate limiting for authentication endpoints
- Implement multi-factor authentication
- Add more granular permission system beyond just superuser/regular user