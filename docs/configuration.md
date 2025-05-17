# Configuration Management

This document outlines the configuration management system of the NestJS application.

## Overview

The application uses NestJS's ConfigModule with a custom ConfigService wrapper to provide strongly-typed access to configuration values. Configuration is loaded from environment-specific `.env` files and validated using Joi.

## Configuration Files

- `.env.development`: Development environment configuration
- `.env.test`: Test environment configuration
- `.env.production`: Production environment configuration

## Configuration Categories

### Database Configuration

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| dbHost | string | localhost | Database host |
| dbPort | number | 5432 | Database port |
| dbUsername | string | postgres | Database username |
| dbPassword | string | postgres | Database password |
| dbDatabase | string | (required) | Database name |
| dbSynchronize | boolean | false | Whether to synchronize database schema |
| dbLogging | boolean | false | Whether to log database queries |
| dbPoolMax | number | 20 | Maximum number of connections in the pool |
| dbPoolIdleTimeout | number | 30000 | Idle timeout for connections in ms |
| dbPoolConnectionTimeout | number | 2000 | Connection timeout in ms |
| dbRetryAttempts | number | 10 | Number of connection retry attempts |
| dbRetryDelay | number | 3000 | Delay between retry attempts in ms |
| dbMigrationsRun | boolean | false | Whether to run migrations on startup |

### Application Configuration

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| port | number | 3000 | Application port |
| nodeEnv | string | development | Node environment (development, test, production) |
| apiPrefix | string | api | API prefix for all routes |
| swaggerPath | string | api/docs | Path to Swagger documentation |
| corsOrigin | string | * | CORS origin |

### JWT Configuration

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| jwtSecret | string | (required) | Secret key for JWT signing |
| jwtExpiration | number | 3600 | JWT expiration time in seconds |

## Usage

### Accessing Configuration

The ConfigService provides strongly-typed access to configuration values:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../core/config/config.service';

@Injectable()
export class MyService {
  constructor(private _configService: ConfigService) {}

  someMethod(): void {
    const port = this._configService.port;
    const isDev = this._configService.isDevelopment;
    // ...
  }
}
```

### Environment Detection

The ConfigService provides helper methods for detecting the current environment:

```typescript
if (this._configService.isDevelopment) {
  // Development-specific code
}

if (this._configService.isProduction) {
  // Production-specific code
}

if (this._configService.isTest) {
  // Test-specific code
}
```

## Validation

Configuration is validated using Joi to ensure that all required values are provided and that values are of the correct type. If validation fails, the application will not start.

## Best Practices

1. Always use the ConfigService to access configuration values
2. Never hardcode configuration values in the code
3. Use environment-specific configuration files for different environments
4. Keep sensitive information in environment variables, not in code
5. Validate all configuration values to catch errors early
