import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {DatabaseService} from './database.service';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST', 'localhost'),
                port: configService.get('DB_PORT', 5432),
                username: configService.get('DB_USERNAME', 'postgres'),
                password: configService.get('DB_PASSWORD', 'postgres'),
                database: configService.get('DB_DATABASE', 'algosuite'),
                entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
                synchronize: configService.get('DB_SYNCHRONIZE', false),
                logging: configService.get('DB_LOGGING', false),
                // Connection pool settings
                extra: {
                    // Maximum number of clients the pool should contain
                    max: configService.get('DB_POOL_MAX', 20),
                    // Maximum time (ms) that a client can be idle before being removed
                    idleTimeoutMillis: configService.get('DB_POOL_IDLE_TIMEOUT', 30000),
                    // Maximum time (ms) to wait for a connection from the pool
                    connectionTimeoutMillis: configService.get('DB_POOL_CONNECTION_TIMEOUT', 2000),
                },
                // Retry connection on failure
                retryAttempts: configService.get('DB_RETRY_ATTEMPTS', 10),
                retryDelay: configService.get('DB_RETRY_DELAY', 3000),
                // Auto-load migrations
                migrationsRun: configService.get('DB_MIGRATIONS_RUN', false),
                migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
                migrationsTableName: 'migrations',
            }),
        }),
    ],
    providers: [DatabaseService],
    exports: [DatabaseService],
})
export class DatabaseModule {
}