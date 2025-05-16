# Database Connection Guide

This document provides information about the database connection setup in the NestJS backend.

## Overview

The application uses TypeORM to connect to a PostgreSQL database. The connection is configured with:

- Connection pooling for efficient resource usage
- Automatic reconnection on failure
- Transaction management
- Error handling and logging

## Configuration

Database connection settings are configured through environment variables in the `.env.{environment}` files:

```
# Database connection
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=algosuite
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Connection pool settings
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000

# Reconnection settings
DB_RETRY_ATTEMPTS=10
DB_RETRY_DELAY=3000

# Migrations
DB_MIGRATIONS_RUN=false
```

### Environment Variables

| Variable                   | Description                                    | Default   |
|----------------------------|------------------------------------------------|-----------|
| DB_HOST                    | Database server hostname                       | localhost |
| DB_PORT                    | Database server port                           | 5432      |
| DB_USERNAME                | Database username                              | postgres  |
| DB_PASSWORD                | Database password                              | postgres  |
| DB_DATABASE                | Database name                                  | algosuite |
| DB_SYNCHRONIZE             | Auto-sync database schema (not for production) | false     |
| DB_LOGGING                 | Enable SQL query logging                       | false     |
| DB_POOL_MAX                | Maximum number of connections in the pool      | 20        |
| DB_POOL_IDLE_TIMEOUT       | Time (ms) before idle connections are removed  | 30000     |
| DB_POOL_CONNECTION_TIMEOUT | Time (ms) to wait for a connection             | 2000      |
| DB_RETRY_ATTEMPTS          | Number of reconnection attempts                | 10        |
| DB_RETRY_DELAY             | Delay (ms) between reconnection attempts       | 3000      |
| DB_MIGRATIONS_RUN          | Auto-run migrations on startup                 | false     |

## Architecture

### Database Module

The `DatabaseModule` is responsible for setting up the TypeORM connection with the appropriate configuration. It imports
the `ConfigModule` to access environment variables and provides the `DatabaseService`.

```typescript
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Configuration options
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

### Database Service

The `DatabaseService` provides methods for:

1. **Transaction Management**: Execute operations within a transaction with automatic commit/rollback
2. **Connection Status**: Check if the database is connected
3. **Reconnection**: Attempt to reconnect to the database
4. **Graceful Shutdown**: Close the database connection properly

```typescript
@Injectable()
export class DatabaseService implements OnModuleInit {
  // Service implementation
}
```

## Usage

### Importing the Database Module

Import the `DatabaseModule` in your application's root module:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      // Config options
    }),
    DatabaseModule,
    // Other modules
  ],
})
export class AppModule {}
```

### Using Transactions

Inject the `DatabaseService` in your service and use the `executeInTransaction` method:

```typescript

@Injectable()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {
    }

    async createUser(userData: CreateUserDto): Promise<User> {
        return this.databaseService.executeInTransaction(async (queryRunner) => {
            // Create user
            const userRepository = queryRunner.manager.getRepository(User);
            const user = userRepository.create(userData);
            await userRepository.save(user);

            // Create related entities
            // ...

            return user;
        });
    }
}
```

## Best Practices

1. **Use Transactions for Related Operations**: When multiple database operations need to succeed or fail together, use
   transactions.

2. **Handle Connection Errors**: Be prepared to handle database connection errors, especially in critical services.

3. **Monitor Connection Pool**: Keep an eye on connection pool metrics to ensure it's properly sized for your
   application's needs.

4. **Avoid Synchronize in Production**: Never use `synchronize: true` in production as it can lead to data loss. Use
   migrations instead.

5. **Use Repository Pattern**: Leverage TypeORM's repository pattern for database operations rather than direct queries
   when possible.

## Troubleshooting

### Connection Issues

If the application fails to connect to the database:

1. Check that the database server is running
2. Verify the connection settings (host, port, username, password)
3. Ensure the database exists
4. Check network connectivity and firewall settings

### Performance Issues

If you experience slow database operations:

1. Check the connection pool size (may need to be increased for high-traffic applications)
2. Review query performance and add indexes where needed
3. Consider query optimization or database tuning