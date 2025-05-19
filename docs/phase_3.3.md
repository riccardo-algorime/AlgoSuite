# Phase 3.3: Authentication and Authorization Implementation Plan

This document provides a detailed, actionable plan for fully implementing **Phase 3.3: Authentication and Authorization** in the migration from FastAPI to NestJS. It is based on the project’s current state, as described in `docs/plan.md` and `docs/work_log.md`, and covers tasks 37–39 from `docs/tasks.md`.

---

## Overview

Phase 3.3 consists of three main objectives:

1. **Implement authentication** (Task 37)
2. **Set up authorization** (Task 38)
3. **Secure endpoints** (Task 39)

The goal is to provide robust, secure, and maintainable authentication and authorization mechanisms using NestJS best practices, leveraging JWT, Passport, Guards, and role-based access control (RBAC).

---

## Prerequisites

- All core modules, DTOs, controllers, and services are implemented.
- Validation, error handling, and API documentation are in place.
- The project uses TypeORM, class-validator, and has a modular structure.
- The authentication strategy and coding standards are documented (`docs/authentication_strategy.md`, `docs/coding_standards.md`).

---

## 1. Implement Authentication (Task 37)

### 1.1. Set Up Passport and JWT

- **Install dependencies**:  
  - `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`, `bcrypt` (if not already installed).
- **Configure JWT module**:  
  - In `AuthModule`, import and configure `JwtModule` with secret and expiration from environment variables.
  - Reference: `nest-backend/src/modules/auth/auth.module.ts`, `nest-backend/src/core/config/config.service.ts`.

### 1.2. Implement Authentication Strategies

- **Local Strategy**:  
  - Create `LocalStrategy` for username/password authentication.
  - Validate user credentials using `AuthService`.
  - File: `nest-backend/src/modules/auth/local.strategy.ts` (to be created).
- **JWT Strategy**:  
  - Create `JwtStrategy` to validate JWT tokens on protected routes.
  - Extract user info from token payload.
  - File: `nest-backend/src/modules/auth/jwt.strategy.ts` (to be created).

### 1.3. Implement Guards

- **AuthGuard**:  
  - Use `@UseGuards(AuthGuard('jwt'))` to protect routes.
  - Create custom guards if needed for additional logic (e.g., token revocation).
- **Integration**:  
  - Apply guards to controllers that require authentication.
  - Reference: `nest-backend/src/modules/auth/auth.controller.ts`, `users.controller.ts`, etc.

### 1.4. JWT Handling

- **Token Generation**:  
  - Issue JWTs on successful login/registration.
  - Store minimal user info in token payload (user id, roles).
- **Token Refresh**:  
  - Implement refresh token logic if required (see `token-refresh.dto.ts`).
- **Token Validation**:  
  - Validate token on each request to protected endpoints.

### 1.5. Documentation

- **Update Swagger**:  
  - Annotate endpoints with `@ApiBearerAuth()` and document authentication flow.
  - Reference: `nest-backend/src/main.ts`, controller files.

---

## 2. Set Up Authorization (Task 38)

### 2.1. Role-Based Access Control (RBAC)

- **Define Roles and Permissions**:  
  - Enumerate user roles (e.g., Admin, User, ReadOnly).
  - Define permissions for each role.
  - File: `nest-backend/src/modules/auth/roles.enum.ts` (to be created).

### 2.2. Permission Decorators

- **Create `@Roles()` Decorator**:  
  - Implement a custom decorator to specify required roles on controller methods.
  - File: `nest-backend/src/modules/auth/roles.decorator.ts` (to be created).

### 2.3. Roles Guard

- **Implement `RolesGuard`**:  
  - Guard checks if the authenticated user has the required role(s) for the endpoint.
  - File: `nest-backend/src/modules/auth/roles.guard.ts` (to be created).
  - Register globally or per-controller as needed.

### 2.4. Policy Enforcement

- **Fine-Grained Authorization**:  
  - For complex permissions (e.g., resource ownership), implement additional guards or service-level checks.
  - Example: Only allow users to access their own resources unless they are Admin.

### 2.5. Documentation

- **Document Authorization Rules**:  
  - Update API docs to specify which roles can access each endpoint.
  - Reference: `docs/api_documentation_strategy.md`.

---

## 3. Secure Endpoints (Task 39)

### 3.1. Apply Guards to Controllers

- **Protect Controllers/Routes**:  
  - Use `@UseGuards(AuthGuard('jwt'), RolesGuard)` and `@Roles()` on all endpoints that require authentication/authorization.
  - Ensure all sensitive endpoints are protected.
  - Reference: All controller files in `nest-backend/src/modules/*/*.controller.ts`.

### 3.2. Secure Individual Routes

- **Granular Security**:  
  - Apply different roles/permissions to different endpoints as needed.
  - Example:  
    - `GET /users/me` – any authenticated user  
    - `GET /users` – Admin only  
    - `POST /projects` – authenticated users  
    - `DELETE /projects/:id` – owner or Admin

### 3.3. Implement Rate Limiting

- **Install and Configure**:  
  - Use `@nestjs/throttler` for rate limiting.
  - Configure global and per-route limits as appropriate.
  - File: `nest-backend/src/core/throttler/` (to be created).
- **Document Security Measures**:  
  - Update documentation to reflect rate limiting and other security controls.

---

## 4. Additional Steps

### 4.1. Testing

- **Unit and Integration Tests**:  
  - Write tests for authentication strategies, guards, and authorization logic.
  - Use Jest and Supertest.
  - Reference: `nest-backend/test/`, `users.service.spec.ts`, `users.e2e-spec.ts`.

### 4.2. Error Handling

- **Consistent Error Responses**:  
  - Ensure all authentication/authorization errors use standardized error formats.
  - Reference: `docs/error_handling.md`, exception filters.

### 4.3. Documentation

- **Update Developer Docs**:  
  - Document authentication and authorization flows in developer guides.
  - Reference: `docs/authentication_strategy.md`, `docs/api_documentation_strategy.md`.

---

## 5. File and Module Structure

**New/Updated Files:**
- `nest-backend/src/modules/auth/local.strategy.ts`
- `nest-backend/src/modules/auth/jwt.strategy.ts`
- `nest-backend/src/modules/auth/roles.enum.ts`
- `nest-backend/src/modules/auth/roles.decorator.ts`
- `nest-backend/src/modules/auth/roles.guard.ts`
- `nest-backend/src/core/throttler/` (rate limiting)
- Controller files: add guards and decorators
- DTOs: update as needed for token/role payloads

---

## 6. References

- [NestJS Authentication Documentation](https://docs.nestjs.com/security/authentication)
- [NestJS Authorization (Guards & Roles)](https://docs.nestjs.com/guards)
- [NestJS JWT Passport](https://docs.nestjs.com/security/authentication#jwt-functionality)
- [NestJS Throttler (Rate Limiting)](https://github.com/nestjs/throttler)
- Project files: see `docs/work_log.md` for current implementation details

---

## 7. Milestones and Acceptance Criteria

- All authentication and authorization logic is implemented and tested.
- All sensitive endpoints are protected with appropriate guards and decorators.
- API documentation reflects authentication and authorization requirements.
- Security measures (rate limiting, error handling) are in place and documented.
- Developer documentation is updated.

---

## 8. Work Log Integration

- As each subtask is completed, update `docs/work_log.md` with status, summary, and related files.
- Reference this plan in commit messages and documentation updates.

---

**End of Phase 3.3 Implementation Plan**
