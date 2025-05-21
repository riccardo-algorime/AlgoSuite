import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  // Test user credentials
  const testUser = {
    email: 'test.user.e2e@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'UserE2E',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strips properties that do not have any decorators
        forbidNonWhitelisted: true, // Throws an error if non-whitelisted values are provided
        transform: true, // Automatically transforms payloads to DTO instances
      }),
    );
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    // Clean up any existing test user before tests
    const existingUser = await userRepository.findOne({ where: { email: testUser.email } });
    if (existingUser) {
      await userRepository.remove(existingUser);
    }
  });

  afterAll(async () => {
    // Clean up the test user after all tests are done
    const existingUser = await userRepository.findOne({ where: { email: testUser.email } });
    if (existingUser) {
      await userRepository.remove(existingUser);
    }
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user and return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      // Verify user is in the database (optional, but good for sanity check)
      const dbUser = await userRepository.findOne({ where: { email: testUser.email } });
      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toEqual(testUser.email);
    });

    it('should return 400 for missing registration fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: testUser.email, password: testUser.password })
        .expect(400);
    });

    it('should return 401 if user already exists', async () => {
      // Attempt to register the same user again
      await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(401); // Or 409 Conflict, depending on implementation. AuthService throws 401.
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login an existing user and return tokens', async () => {
      // Note: User is already registered from the previous test block
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid credentials (wrong password)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword!' })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'anypassword' })
        .expect(401);
    });

    it('should return 400 for missing login fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email })
        .expect(400);
    });
  });

  // Placeholder for /auth/logout (POST) tests
  describe('/auth/logout (POST)', () => {
    it.todo('should logout the user (e.g., invalidate token if using a denylist)');
  });

  // Placeholder for /auth/me (GET) tests
  describe('/auth/me (GET)', () => {
    it.todo('should return the current user profile if authenticated');
    it.todo('should return 401 if not authenticated');
  });

  // Placeholder for /auth/refresh (POST) tests
  describe('/auth/refresh (POST)', () => {
    it.todo('should refresh the access token using a valid refresh token');
    it.todo('should return 401 if refresh token is invalid or expired');
  });
});
