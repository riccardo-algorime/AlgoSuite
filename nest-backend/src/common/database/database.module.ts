import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('dbHost', 'localhost'),
        port: configService.get('dbPort', 5432),
        username: configService.get('dbUsername', 'postgres'),
        password: configService.get('dbPassword', 'postgres'),
        database: configService.get('dbDatabase', 'algosuite'),
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: configService.get('dbSynchronize', false),
        logging: configService.get('dbLogging', false),
        // Connection pool settings
        extra: {
          // Maximum number of clients the pool should contain
          max: configService.get('dbPoolMax', 20),
          // Maximum time (ms) that a client can be idle before being removed
          idleTimeoutMillis: configService.get('dbPoolIdleTimeout', 30000),
          // Maximum time (ms) to wait for a connection from the pool
          connectionTimeoutMillis: configService.get('dbPoolConnectionTimeout', 2000),
        },
        // Retry connection on failure
        retryAttempts: configService.get('dbRetryAttempts', 10),
        retryDelay: configService.get('dbRetryDelay', 3000),
        // Auto-load migrations
        migrationsRun: configService.get('dbMigrationsRun', false),
        migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
