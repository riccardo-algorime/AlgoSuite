# Build Process Documentation

This document outlines the build process for the NestJS backend application, including environment-specific
configurations and build scripts.

## Environment Configuration

The application uses environment-specific configuration files to manage different settings for development, testing, and
production environments.

### Environment Files

- `.env.example` - Template file with all required environment variables
- `.env.development` - Configuration for development environment
- `.env.test` - Configuration for test environment
- `.env.production` - Configuration for production environment

### Required Environment Variables

#### Database Configuration

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `DB_DATABASE` - Database name (required)
- `DB_SYNCHRONIZE` - Whether to synchronize database schema (default: false)
- `DB_LOGGING` - Whether to log database queries (default: false)

#### Application Configuration

- `PORT` - Port to run the application on (default: 3000)
- `NODE_ENV` - Environment (development, test, or production) (default: development)
- `API_PREFIX` - Prefix for API routes (default: api)
- `SWAGGER_PATH` - Path for Swagger documentation (default: api/docs)
- `CORS_ORIGIN` - CORS origin (default: *)

#### JWT Configuration

- `JWT_SECRET` - Secret key for JWT tokens (required)
- `JWT_EXPIRATION` - JWT token expiration time in seconds (default: 3600)

## Build Scripts

The application provides several build scripts for different environments and purposes:

### Development Builds

```bash
# Clean the dist directory and build the application
npm run build

# Build with webpack and hot module replacement for development
npm run build:dev

# Start the application in development mode with file watching
npm run start:dev

# Start the application in debug mode with file watching
npm run start:debug
```

### Production Builds

```bash
# Build the application for production
npm run build:prod

# Start the application in production mode
npm run start:prod

# Start the application in staging mode
npm run start:staging
```

### Testing

```bash
# Run unit tests
npm run test

# Run unit tests with file watching
npm run test:watch

# Run unit tests with coverage report
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

### Other Scripts

```bash
# Format code with Prettier
npm run format

# Lint code with ESLint
npm run lint
```

## Build Process Details

### Development Build

The development build uses webpack with hot module replacement (HMR) for faster development. It includes:

- Source maps for better debugging
- Automatic reloading when files change
- Database schema synchronization
- Detailed logging

### Production Build

The production build is optimized for performance and security:

- No source maps to reduce bundle size
- No automatic schema synchronization
- Minimal logging
- Environment variables for sensitive information

### Environment-Specific Configurations

Each environment has specific configurations:

#### Development

- Database schema synchronization enabled
- SQL query logging enabled
- Source maps enabled
- Hot module replacement

#### Test

- Separate test database
- Database schema synchronization enabled
- Minimal logging
- Different port to avoid conflicts with development server

#### Production

- No database schema synchronization
- No SQL query logging
- No source maps
- Restricted CORS origin
- Environment variables for sensitive information

## Continuous Integration

For CI/CD pipelines, use the following commands:

```bash
# Install dependencies
npm ci

# Build for production
npm run build:prod

# Run tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Missing environment variables**: Ensure all required environment variables are set in the appropriate .env file.
2. **Database connection issues**: Check database credentials and ensure the database server is running.
3. **Port conflicts**: If the port is already in use, change the PORT environment variable.

### Logs

Application logs can be found in the console output. In production, consider using a log aggregation service.