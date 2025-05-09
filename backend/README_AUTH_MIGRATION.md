# Authentication Migration: Keycloak to PostgreSQL

This document outlines the migration of authentication from Keycloak to the existing PostgreSQL user table.

## Overview

The authentication system has been migrated from Keycloak to use the existing PostgreSQL user table. This simplifies the architecture by:

1. Eliminating the dependency on Keycloak
2. Using the existing user table in PostgreSQL
3. Implementing JWT-based authentication directly in the application
4. Simplifying the deployment and maintenance

## Migration Steps

### 1. Update Environment Variables

Remove Keycloak-related environment variables and ensure the following are set:

```
# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

### 2. Migrate Existing Users

Run the migration script to transfer users from Keycloak to PostgreSQL:

```bash
cd backend
python scripts/migrate_users.py
```

**Note:** All migrated users will have a default password of `ChangeMe123!`. They should reset their password after first login.

### 3. Update Frontend Configuration

The frontend has been updated to work with the new authentication system. No additional configuration is needed.

## Implementation Details

### Backend Changes

1. **New Services:**
   - `SecurityService`: Handles password hashing and JWT token management
   - `UserService`: Handles user CRUD operations

2. **Updated Endpoints:**
   - `/auth/login`: Uses PostgreSQL for authentication
   - `/auth/refresh`: Uses JWT refresh tokens
   - `/auth/logout`: Client-side only (no server-side token invalidation)
   - `/register`: Creates users directly in PostgreSQL

3. **Dependencies:**
   - Updated `get_current_user` to validate JWT tokens and fetch users from PostgreSQL

### Frontend Changes

1. **AuthContext:**
   - Updated to work with the new authentication endpoints
   - Removed Keycloak-specific parameters

## Testing the Migration

1. **Login with Existing Users:**
   - Existing users should be able to log in with the default password (`ChangeMe123!`)
   - They should be prompted to change their password

2. **Register New Users:**
   - New users should be able to register and log in

3. **Token Refresh:**
   - Sessions should persist and tokens should refresh automatically

## Rollback Plan

If issues are encountered, you can roll back to Keycloak by:

1. Reverting the code changes
2. Ensuring Keycloak is running
3. Restoring the Keycloak environment variables

## Security Considerations

1. **Password Security:**
   - Passwords are hashed using bcrypt
   - Users migrated from Keycloak should reset their passwords

2. **Token Security:**
   - JWT tokens are signed with a secret key
   - Access tokens expire after 30 minutes
   - Refresh tokens expire after 30 days

3. **Future Enhancements:**
   - Implement token blacklisting for logout
   - Add rate limiting for authentication endpoints
   - Implement two-factor authentication
