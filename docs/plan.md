# Detailed Plan for Migrating from FastAPI (Python) to NestJS

## Phase 1: Preparation and Analysis

### 1. System Assessment

- Document current architecture: Create diagrams of the existing FastAPI system
- Identify all endpoints: Document all API routes, their methods, parameters, and responses
- Map data models: List all Pydantic models and their relationships
- Identify dependencies: Document all external services, databases, and third-party integrations
- Analyze authentication/authorization: Document current security implementation
- Review business logic: Identify complex algorithms and business rules
- Assess test coverage: Review existing tests and their coverage

### 2. Technology Stack Planning

- Database access: Choose between TypeORM, Prisma, Mongoose, or other ORMs based on your database
- Authentication: Select appropriate NestJS authentication strategies (JWT, Passport, etc.)
- Validation: Plan to use class-validator and class-transformer
- Documentation: Plan to use Swagger/OpenAPI via NestJS integration
- Testing: Set up Jest for unit and integration testing
- Logging and monitoring: Select appropriate libraries

### 3. Team Preparation

- Define coding standards: Establish TypeScript coding conventions and NestJS best practices

## Phase 2: Initial Setup

### 1. Project Scaffolding

- Initialize NestJS project: Use Nest CLI to create the project structure
- Configure TypeScript: Set up tsconfig.json with appropriate settings
- Set up linting and formatting: Configure ESLint and Prettier
- Configure build process: Set up build scripts and environment configurations
- Set up CI/CD pipeline: Adapt existing pipelines for the new stack

### 2. Database Migration

- Set up ORM: Install and configure TypeORM/Prisma/Mongoose
- Define entities: Create TypeScript entity classes that mirror your Python models
- Create migration scripts: Develop scripts to migrate data if schema changes are needed
- Set up database connection: Configure database access with proper pooling and error handling

## Phase 3: Incremental Implementation

### 1. Core Infrastructure

- Implement modules structure: Create NestJS modules that logically group related functionality
- Set up dependency injection: Configure providers and services
- Implement configuration management: Set up ConfigModule for environment variables
- Set up logging: Implement logging service with appropriate levels
- Implement error handling: Create exception filters and standardized error responses

### 2. Feature Migration (Iterative)

For each functional area:

- Create DTOs: Define Data Transfer Objects for request/response validation
- Implement controllers: Create controllers that map to existing FastAPI routes
- Develop services: Implement business logic in service classes

  **Status:**  
  - All core service classes (Auth, Users, Projects, Attack Surfaces, Assets, Scans, ScanResults, Findings, Health) have been implemented or enhanced.
  - Business logic, access control, and ownership checks are in place.
  - Password hashing, JWT authentication, and error handling are integrated.
  - Scan execution is mocked in ScansService with a TODO for future queue integration.
  - Module resolution issue for HealthModule was fixed by switching to a relative import in app.module.ts as a workaround for a path alias issue.

- Add validation: Implement request validation using class-validator
- Write tests: Create unit and integration tests for new components
- Document API: Add Swagger annotations

### 3. Authentication and Authorization

- Implement authentication: Set up Guards, Strategies, and JWT handling
- Set up authorization: Implement role-based access control
- Secure endpoints: Apply guards to controllers and routes

## Phase 4: Testing and Validation

### 1. Comprehensive Testing

- Unit testing: Test individual components in isolation
- Integration testing: Test interactions between components
- API testing: Verify API contracts match the original FastAPI implementation
- Performance testing: Compare performance metrics with the original system
- Security testing: Conduct security audits on the new implementation

### 2. Parallel Running

- Set up proxy: Configure a proxy to route traffic to either system
- Implement feature flags: Allow gradual rollout of NestJS endpoints
- Shadow testing: Send duplicate requests to both systems and compare responses
- Monitoring: Set up detailed monitoring to catch discrepancies

## Phase 5: Deployment and Transition

### 1. Gradual Rollout

- Start with non-critical endpoints: Migrate low-risk endpoints first
- Implement canary releases: Gradually increase traffic to NestJS backend
- Monitor closely: Watch for errors, performance issues, and discrepancies
- Have rollback plan: Maintain ability to revert to FastAPI if issues arise

### 2. Complete Transition

- Migrate all traffic: Once confident, route all traffic to NestJS
- Decommission FastAPI: Shut down FastAPI services after a monitoring period
- Document final architecture: Update all system documentation

## Phase 6: Post-Migration

### 1. Optimization

- Performance tuning: Optimize NestJS application based on production metrics
- Code refactoring: Clean up any technical debt accumulated during migration
- Enhance testing: Improve test coverage and quality

### 2. Knowledge Consolidation

- Update documentation: Ensure all documentation reflects the new system
- Team training: Conduct advanced training on NestJS features and patterns
- Retrospective: Review the migration process and document lessons learned
