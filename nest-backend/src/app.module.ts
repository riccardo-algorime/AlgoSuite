import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DatabaseModule} from './common/database/database.module';
import * as Joi from 'joi';

@Module({
    imports: [
        // Configuration module for environment variables
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
            validationSchema: Joi.object({
                // Database
                DB_HOST: Joi.string().default('localhost'),
                DB_PORT: Joi.number().default(5432),
                DB_USERNAME: Joi.string().default('postgres'),
                DB_PASSWORD: Joi.string().default('postgres'),
                DB_DATABASE: Joi.string().required(),
                DB_SYNCHRONIZE: Joi.boolean().default(false),
                DB_LOGGING: Joi.boolean().default(false),
                DB_POOL_MAX: Joi.number().default(20),
                DB_POOL_IDLE_TIMEOUT: Joi.number().default(30000),
                DB_POOL_CONNECTION_TIMEOUT: Joi.number().default(2000),
                DB_RETRY_ATTEMPTS: Joi.number().default(10),
                DB_RETRY_DELAY: Joi.number().default(3000),
                DB_MIGRATIONS_RUN: Joi.boolean().default(false),

                // Application
                PORT: Joi.number().default(3000),
                NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
                API_PREFIX: Joi.string().default('api'),
                SWAGGER_PATH: Joi.string().default('api/docs'),
                CORS_ORIGIN: Joi.string().default('*'),

                // JWT
                JWT_SECRET: Joi.string().required(),
                JWT_EXPIRATION: Joi.number().default(3600),
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
export class AppModule {
}
