import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import * as joi from 'joi';

@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: joi.object({
        // Database
        dbHost: joi.string().default('localhost'),
        dbPort: joi.number().default(5432),
        dbUsername: joi.string().default('postgres'),
        dbPassword: joi.string().default('postgres'),
        dbDatabase: joi.string().required(),
        dbSynchronize: joi.boolean().default(false),
        dbLogging: joi.boolean().default(false),
        dbPoolMax: joi.number().default(20),
        dbPoolIdleTimeout: joi.number().default(30000),
        dbPoolConnectionTimeout: joi.number().default(2000),
        dbRetryAttempts: joi.number().default(10),
        dbRetryDelay: joi.number().default(3000),
        dbMigrationsRun: joi.boolean().default(false),

        // Application
        port: joi.number().default(3000),
        nodeEnv: joi.string().valid('development', 'test', 'production').default('development'),
        apiPrefix: joi.string().default('api'),
        swaggerPath: joi.string().default('api/docs'),
        corsOrigin: joi.string().default('*'),

        // JWT
        jwtSecret: joi.string().required(),
        jwtExpiration: joi.number().default(3600),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Database module
    DatabaseModule,

    // Add your feature modules here
    // UsersModule,
    // AuthModule,
    // etc.
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
