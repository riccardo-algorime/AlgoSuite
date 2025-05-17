# Configuration Options

This document outlines the configuration options available in the NestJS application.

## Environment Variables

The application uses environment variables for configuration. These can be set in the `.env.{environment}` files or directly in the environment.

### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `dbHost` | Database host | `localhost` | No |
| `dbPort` | Database port | `5432` | No |
| `dbUsername` | Database username | `postgres` | No |
| `dbPassword` | Database password | `postgres` | No |
| `dbDatabase` | Database name | - | Yes |
| `dbSynchronize` | Whether to synchronize database schema | `false` | No |
| `dbLogging` | Whether to log database queries | `false` | No |
| `dbPoolMax` | Maximum number of connections in the pool | `20` | No |
| `dbPoolIdleTimeout` | Idle timeout for connections in ms | `30000` | No |
| `dbPoolConnectionTimeout` | Connection timeout in ms | `2000` | No |
| `dbRetryAttempts` | Number of connection retry attempts | `10` | No |
| `dbRetryDelay` | Delay between retry attempts in ms | `3000` | No |
| `dbMigrationsRun` | Whether to run migrations on startup | `false` | No |

### Application Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `port` | Port to run the application on | `3000` | No |
| `nodeEnv` | Node environment (development, test, production) | `development` | No |
| `apiPrefix` | Prefix for API routes | `api` | No |
| `swaggerPath` | Path for Swagger documentation | `api/docs` | No |
| `corsOrigin` | CORS origin | `*` | No |

### JWT Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `jwtSecret` | Secret key for JWT | - | Yes |
| `jwtExpiration` | JWT expiration time in seconds | `3600` | No |

## Configuration Files

The application uses the following configuration files:

- `.env.development`: Development environment configuration
- `.env.test`: Test environment configuration
- `.env.production`: Production environment configuration

## Configuration Service

The application provides a `ConfigService` that can be injected into any component to access configuration values:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../core/config/config.service';

@Injectable()
export class MyService {
  constructor(private _configService: ConfigService) {}

  someMethod(): void {
    const port = this._configService.port;
    const isDevelopment = this._configService.isDevelopment;
    // ...
  }
}
```

## Environment-Specific Configuration

The application loads environment-specific configuration based on the `NODE_ENV` environment variable:

- If `NODE_ENV` is not set, it defaults to `development`
- The application loads the corresponding `.env.{NODE_ENV}` file

## Configuration Validation

The application validates configuration values using Joi. If a required value is missing or invalid, the application will fail to start with an error message.
