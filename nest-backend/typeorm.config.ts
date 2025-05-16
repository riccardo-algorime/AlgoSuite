import {DataSource} from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({path: `.env.${process.env.NODE_ENV || 'development'}`});

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'algosuite',
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
    synchronize: false, // Never use synchronize in production
    logging: process.env.DB_LOGGING === 'true',
    migrationsTableName: 'migrations',
    migrationsRun: false,
});