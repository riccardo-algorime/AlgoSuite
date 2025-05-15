import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';

@Module({
    imports: [
        // Configuration module for environment variables
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.development'],
        }),

        // Database connection
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
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: configService.get('DB_SYNCHRONIZE', false),
                logging: configService.get('DB_LOGGING', false),
            }),
        }),

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