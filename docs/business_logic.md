# Business Logic Documentation

## Service Layer Architecture

The application follows a service layer architecture where business logic is encapsulated in service classes. These
services are responsible for implementing business rules, coordinating data access, and providing a clean API for the
controllers (API endpoints).

## Security Service

**File**: `app/services/security.py`

The SecurityService class handles security-related operations:

### Key Functions

- **verify_password**: Verifies a password against a hash using bcrypt
- **get_password_hash**: Hashes a password using bcrypt
- **create_access_token**: Creates a JWT access token with expiration
- **decode_token**: Decodes and validates a JWT token
- **create_user_response**: Creates a User response object

### Business Rules

- Access tokens expire after a configurable time (default: 30 minutes)
- Refresh tokens have a longer expiry (30 days)
- Tokens must have subject and expiration claims
- Passwords are securely hashed using bcrypt

## User Service

**File**: `app/services/user.py`

The UserService class handles user management operations:

### Key Functions

- **get_by_id**: Retrieves a user by ID
- **get_by_email**: Retrieves a user by email
- **_ensure_admin_user**: Ensures an admin user exists in the system
- **get_all**: Retrieves all users with pagination
- **create**: Creates a new user
- **update**: Updates an existing user
- **authenticate**: Authenticates a user with email and password
- **is_active**: Checks if a user is active
- **is_superuser**: Checks if a user is a superuser

### Business Rules

- User emails must be unique
- Passwords are hashed before storage
- System ensures at least one admin user exists
- Authentication validates email/password combinations
- Users can be active or inactive
- Users can be regular users or superusers

## Critical Business Rules

### User Authentication

1. User provides email and password
2. System looks up user by email
3. System verifies password hash
4. If valid, system generates access and refresh tokens
5. System returns tokens to client

### User Registration

1. User provides email, full name, and password
2. System checks if email already exists
3. If not, system creates new user with hashed password
4. System sets user as active and non-superuser by default
5. System returns user data to client

### Project Management

1. Projects are associated with a creator (user)
2. Projects can have multiple attack surfaces
3. Attack surfaces can have multiple assets
4. Users can only access their own projects unless they are superusers

### Security Scanning

1. Scans are associated with a creator (user)
2. Scans target specific assets or systems
3. Scans run asynchronously using Celery tasks
4. Scan results include findings with severity levels
5. Findings are associated with scans and can be part of scan results

## Transaction Boundaries

The application uses SQLAlchemy sessions for transaction management:

- Sessions are created per request using dependency injection
- Transactions are committed after successful operations
- Transactions are rolled back on exceptions
- Sessions are closed after request processing

Example from user service:

```python
def create(self, db: Session, user_in: UserCreate) -> Dict[str, Any]:
    # Check if user with this email already exists
    db_user = self.get_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = security_service.get_password_hash(user_in.password)

    db_user = UserModel(
        id=user_id,
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return self._model_to_dict(db_user)
```

## Performance-Critical Sections

The application doesn't explicitly identify performance-critical sections, but some areas that could be
performance-sensitive include:

- Database queries, especially those retrieving large result sets
- Security scanning operations (handled asynchronously via Celery)
- Token validation, which happens on every authenticated request

## Error Handling

The application uses FastAPI's exception handling for business logic errors:

- HTTPException is raised with appropriate status codes and error messages
- Exceptions in service methods are caught and re-raised as HTTPExceptions
- Authentication errors return 401 Unauthorized responses
- Permission errors return 403 Forbidden responses
- Resource not found errors return 404 Not Found responses
- Validation errors return 422 Unprocessable Entity responses
- Other errors return 400 Bad Request or 500 Internal Server Error responses

## Business Logic Gaps

Some areas where the business logic appears incomplete or placeholder:

- Scan execution is mostly placeholder code
- Project and attack surface relationships are defined but not fully implemented
- Asset management is defined but not fully implemented
- Keycloak integration is configured but not implemented