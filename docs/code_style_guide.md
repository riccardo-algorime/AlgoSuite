# Code Style Guide for NestJS Project

This document outlines the coding standards and style guidelines for the NestJS migration project. Following these
guidelines ensures consistency across the codebase and makes it easier for team members to collaborate.

## TypeScript Coding Conventions

### Naming Conventions

- **Variables and Functions**: Use camelCase
  ```typescript
  const userName = 'John';
  function getUserData() { ... }
  ```

- **Classes and Interfaces**: Use PascalCase
    - Interfaces should be prefixed with "I"
  ```typescript
  class UserService { ... }
  interface IUserData { ... }
  ```

- **Enums**: Use PascalCase with "Enum" suffix
  ```typescript
  enum UserRoleEnum { ... }
  ```

- **Constants**: Use UPPER_SNAKE_CASE
  ```typescript
  const MAX_RETRY_COUNT = 3;
  ```

- **Private Class Members**: Use camelCase with leading underscore
  ```typescript
  private _userRepository: UserRepository;
  ```

### File Naming

- Use kebab-case for file names
  ```
  user.service.ts
  auth.controller.ts
  ```

- Group related files in directories
  ```
  /users
    /dto
      create-user.dto.ts
      update-user.dto.ts
    /entities
      user.entity.ts
    users.controller.ts
    users.service.ts
    users.module.ts
  ```

## NestJS Best Practices

### Module Organization

- Each feature should have its own module
- Keep controllers, services, and entities in separate files
- Use barrel exports (index.ts) for cleaner imports

### Dependency Injection

- Always use constructor injection
- Use interfaces for service contracts when appropriate
- Mark dependencies as readonly when possible

```typescript

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService,
    ) {
    }
}
```

### Error Handling

- Use NestJS exception filters for consistent error responses
- Create custom exceptions for domain-specific errors
- Always include appropriate HTTP status codes

```typescript
throw new NotFoundException('User not found');
```

### Validation

- Use class-validator decorators for DTO validation
- Create custom validators when needed
- Use ValidationPipe globally

```typescript
@IsString()
@IsNotEmpty()
name
:
string;
```

### Documentation

- Use Swagger decorators to document APIs
- Include JSDoc comments for complex functions
- Document expected inputs and outputs

```typescript
/**
 * Creates a new user in the system
 * @param createUserDto - The user data
 * @returns The created user
 */
@ApiOperation({summary: 'Create a new user'})
@ApiResponse({status: 201, description: 'User created successfully'})
create(@Body()
createUserDto: CreateUserDto
):
Promise < User > {...}
```

## Formatting Rules

The project uses ESLint and Prettier for code formatting with the following rules:

- Single quotes for strings
- 2 spaces for indentation
- Semicolons at the end of statements
- 100 character line length limit
- Trailing commas in multi-line objects and arrays
- No parentheses for single arrow function parameters

## Pre-commit Hooks

The project uses Husky and lint-staged to enforce code quality:

- ESLint will check for code quality issues
- Prettier will format code according to the style guide
- Tests must pass before commits are allowed

## Code Review Process

1. All code changes must be reviewed by at least one team member
2. Reviewers should check for:
    - Adherence to this style guide
    - Potential bugs or edge cases
    - Test coverage
    - Documentation
3. Address all review comments before merging

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)