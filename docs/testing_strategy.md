# Testing Strategy for NestJS Migration

## Jest Configuration

### Basic Setup

```typescript
// jest.config.js
module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/$1',
    },
};
```

### Configuration for Different Test Types

- **Unit Tests**: Default configuration above
- **Integration Tests**:
  ```typescript
  // jest-integration.config.js
  const baseConfig = require('./jest.config');

  module.exports = {
    ...baseConfig,
    testRegex: '.*\\.integration\\.spec\\.ts$',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/test/setup-integration.ts'],
  };
  ```
- **E2E Tests**:
  ```typescript
  // jest-e2e.config.js
  module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testEnvironment: 'node',
    testRegex: '.e2e-spec.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    moduleNameMapper: {
      '^@app/(.*)$': '<rootDir>/src/$1',
    },
  };
  ```

### NPM Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:integration": "jest --config ./jest-integration.config.js",
    "test:e2e": "jest --config ./jest-e2e.config.js"
  }
}
```

## Unit Testing Approach

### Testing Structure

- Tests should be co-located with the source files they test
- Follow the naming convention: `[filename].spec.ts`
- Group tests using `describe` blocks that match class/function names
- Use clear test descriptions that explain the expected behavior

### Testing Components

1. **Controllers**:
    - Test each endpoint for successful responses
    - Test validation errors
    - Test authorization checks
    - Mock service layer dependencies

2. **Services**:
    - Test business logic in isolation
    - Mock external dependencies (repositories, other services)
    - Test error handling and edge cases
    - Ensure proper transaction handling

3. **Pipes, Filters, and Guards**:
    - Test in isolation with mocked requests/responses
    - Verify correct behavior for various inputs
    - Test error handling

### Example Unit Test

```typescript
// user.service.spec.ts
import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from './user.service';
import {UserRepository} from './user.repository';

describe('UserService', () => {
    let service: UserService;
    let repository: UserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        repository = module.get<UserRepository>(UserRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOne', () => {
        it('should return a user if found', async () => {
            const mockUser = {id: 1, username: 'testuser'};
            jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

            const result = await service.findOne(1);

            expect(result).toEqual(mockUser);
            expect(repository.findOne).toHaveBeenCalledWith(1);
        });

        it('should throw an error if user not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow();
        });
    });
});
```

## Integration Testing Strategy

### Approach

- Test interactions between multiple components
- Use in-memory databases when possible (MongoDB Memory Server, SQLite)
- For complex database interactions, consider using Docker containers with test databases
- Focus on testing API endpoints with real database interactions

### Test Database Setup

- Create a separate test database configuration
- Use migrations to set up schema
- Seed test data before tests
- Clean up after tests

### Example Integration Test

```typescript
// auth.integration.spec.ts
import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from '../src/app.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {testDatabaseConfig} from './test-database.config';

describe('Authentication (integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot(testDatabaseConfig),
                AppModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /auth/login', () => {
        it('should authenticate a user with valid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({username: 'testuser', password: 'password'})
                .expect(200)
                .expect(res => {
                    expect(res.body.token).toBeDefined();
                    expect(res.body.user).toBeDefined();
                });
        });

        it('should reject invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({username: 'testuser', password: 'wrongpassword'})
                .expect(401);
        });
    });
});
```

## End-to-End Testing Plan

### Approach

- Test complete user flows from frontend to backend
- Use tools like Cypress or Playwright for browser-based testing
- Test API endpoints using Supertest for API-only flows
- Verify database state after operations

### Test Environment

- Set up a dedicated test environment with:
    - Test database
    - Mocked external services
    - Seeded test data

### Key Scenarios to Test

1. User registration and authentication flow
2. Core business processes end-to-end
3. Integration with external services (with mocks)
4. Error handling and recovery

### Example E2E Test

```typescript
// auth.e2e-spec.ts
import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from './../src/app.module';
import {getConnection} from 'typeorm';

describe('Authentication (e2e)', () => {
    let app: INestApplication;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Seed test data
        const connection = getConnection();
        await connection.query(`INSERT INTO users(username, password) 
                           VALUES('e2euser', '$2b$10$...')`) // Hashed 'password'
    });

    afterAll(async () => {
        const connection = getConnection();
        await connection.query('DELETE FROM users WHERE username = "e2euser"');
        await app.close();
    });

    it('should authenticate user and use token for protected routes', async () => {
        // Login
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({username: 'e2euser', password: 'password'})
            .expect(200);

        authToken = loginResponse.body.token;
        expect(authToken).toBeDefined();

        // Access protected route
        return request(app.getHttpServer())
            .get('/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200)
            .expect(res => {
                expect(res.body.username).toEqual('e2euser');
            });
    });

    it('should reject access to protected routes without valid token', () => {
        return request(app.getHttpServer())
            .get('/profile')
            .expect(401);
    });
});
```

## Test Coverage Goals

- **Unit Tests**: Aim for 80%+ coverage of all services and controllers
- **Integration Tests**: Cover all API endpoints and critical business flows
- **E2E Tests**: Cover main user journeys and critical business processes

## Continuous Integration

- Run unit tests on every pull request
- Run integration tests on merge to development branch
- Run E2E tests nightly or before releases
- Generate and publish coverage reports
- Fail builds if coverage drops below thresholds

## Testing Best Practices

1. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases
2. **Test Isolation**: Ensure tests don't depend on each other
3. **Mock External Dependencies**: Use Jest's mocking capabilities for external services
4. **Realistic Test Data**: Use factories or fixtures to generate realistic test data
5. **Focus on Behavior**: Test what the code does, not how it's implemented
6. **Keep Tests Fast**: Optimize tests to run quickly to encourage frequent testing
