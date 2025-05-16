import {DataSource} from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({path: `.env.${process.env.NODE_ENV || 'development'}`});

export default new DataSource({
    type: 'postgres',
    host: process.env.dbHost || 'localhost',
    port: parseInt(process.env.dbPort || '5432', 10),
    username: process.env.dbUsername || 'postgres',
    password: process.env.dbPassword || 'postgres',
    database: process.env.dbDatabase || 'algosuite',
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
    synchronize: false, // Never use synchronize in production
    logging: process.env.dbLogging === 'true',
    migrationsTableName: 'migrations',
    migrationsRun: false,
});