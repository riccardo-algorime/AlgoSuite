# TypeScript and NestJS Coding Standards

This document outlines the coding standards, best practices, and guidelines for the NestJS migration project.

## TypeScript Coding Conventions

### Naming Conventions

- **Classes**: Use PascalCase for class names (e.g., `UserService`, `AuthController`)
- **Interfaces**: Use PascalCase and prefix with 'I' (e.g., `IUserRepository`, `IAuthService`)
- **Types**: Use PascalCase (e.g., `UserDto`, `AuthPayload`)
- **Variables and Functions**: Use camelCase (e.g., `getUserById`, `authToken`)
- **Constants**: Use UPPER_SNAKE_CASE for true constants (e.g., `MAX_RETRY_COUNT`, `API_BASE_URL`)
- **Private Properties**: Prefix with underscore (e.g., `_userRepository`, `_logger`)

### File Naming

- Use kebab-case for file names (e.g., `user.service.ts`, `auth.controller.ts`)
- Follow NestJS naming patterns: `[name].[type].ts` (e.g., `user.entity.ts`, `auth.guard.ts`)

### Code Organization

- One class per file, with filename matching the class name
- Group related functionality in directories
- Keep files small and focused on a single responsibility
- Use barrel files (index.ts) to simplify imports

### Type Safety

- Avoid using `any` type; use `unknown` when type is truly unknown
- Use explicit return types for functions and methods
- Enable strict TypeScript compiler options
- Use type guards for runtime type checking
- Prefer interfaces over type aliases for object shapes

## NestJS Best Practices

### Module Organization

- Create feature modules for distinct functionality
- Keep controllers, services, and other components in their respective modules
- Use shared modules for common functionality
- Lazy-load modules when appropriate for performance

### Dependency Injection

- Use constructor injection for dependencies
- Mark dependencies as `@Injectable()`
- Use appropriate scope for providers (default, request, transient)
- Avoid circular dependencies

### Exception Handling

- Use NestJS exception filters for consistent error responses
- Create custom exceptions extending `HttpException`
- Handle exceptions at the appropriate level
- Use the `@Catch()` decorator for specific exception types

### Validation

- Use class-validator decorators for DTO validation
- Implement custom validators when needed
- Use ValidationPipe globally
- Separate validation logic from business logic

### Configuration

- Use ConfigModule for environment variables
- Validate configuration using Joi
- Use environment-specific configuration files
- Avoid hardcoded values

### Testing

- Write unit tests for services and other business logic
- Write integration tests for controllers and repositories
- Use NestJS testing utilities
- Mock dependencies appropriately

## Style Guide

### Code Formatting

- Use Prettier for consistent formatting
- 2-space indentation
- 100 character line length limit
- Use single quotes for strings
- Semicolons at the end of statements
- Trailing commas in multi-line object/array literals

### Comments and Documentation

- Use JSDoc comments for public APIs
- Document complex algorithms and business rules
- Keep comments up-to-date with code changes
- Use TODO/FIXME comments sparingly and address them promptly

### Import Order

1. External libraries
2. NestJS framework imports
3. Other internal modules
4. Relative imports from the current module
5. Type imports

### Code Structure

- Limit function/method length to 30 lines when possible
- Limit file size to 400 lines when possible
- Use early returns to reduce nesting
- Avoid deep nesting of conditionals and loops

## Code Review Process

### Pre-submission Checklist

- Code compiles without errors or warnings
- All tests pass
- Code is properly formatted
- No TODO/FIXME comments without corresponding issues
- Documentation is updated

### Review Guidelines

- Reviews should be completed within 24 hours
- Focus on correctness, maintainability, and performance
- Be constructive and specific in feedback
- Use a collaborative approach to problem-solving

### Review Process

1. Developer creates a pull request with a clear description
2. At least one team member reviews the code
3. Automated checks run (linting, tests, etc.)
4. Reviewer provides feedback
5. Developer addresses feedback
6. Reviewer approves changes
7. Code is merged to the main branch

### Continuous Integration

- All pull requests must pass CI checks
- Failed CI checks block merging
- Test coverage should not decrease
- Performance benchmarks should not degrade

## Version Control

### Branching Strategy

- Use feature branches for new features
- Use fix branches for bug fixes
- Branch from and merge to the development branch
- Use semantic versioning for releases

### Commit Messages

- Use conventional commits format
- Include issue/ticket number when applicable
- Keep commits focused and atomic
- Write descriptive commit messages

## Implementation Timeline

- Initial setup of linting and formatting tools: Week 1
- Documentation of coding standards: Week 1
- Team training on standards: Week 2
- Full implementation in codebase: Weeks 2-3
- Regular review and refinement: Ongoing