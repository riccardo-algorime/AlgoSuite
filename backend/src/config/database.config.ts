import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get<string>('ENVIRONMENT') === 'development',
  logging: configService.get<string>('ENVIRONMENT') === 'development' ? ['error', 'warn', 'schema'] : ['error', 'warn'],
  ssl: configService.get<string>('ENVIRONMENT') === 'production',
});
