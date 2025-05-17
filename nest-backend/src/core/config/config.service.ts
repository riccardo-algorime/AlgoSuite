import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private _configService: NestConfigService) {}

  // Database configuration
  get dbHost(): string {
    return this._configService.get<string>('dbHost', 'localhost');
  }

  get dbPort(): number {
    return this._configService.get<number>('dbPort', 5432);
  }

  get dbUsername(): string {
    return this._configService.get<string>('dbUsername', 'postgres');
  }

  get dbPassword(): string {
    return this._configService.get<string>('dbPassword', 'postgres');
  }

  get dbDatabase(): string {
    return this._configService.get<string>('dbDatabase', 'algosuite');
  }

  get dbSynchronize(): boolean {
    return this._configService.get<boolean>('dbSynchronize', false);
  }

  get dbLogging(): boolean {
    return this._configService.get<boolean>('dbLogging', false);
  }

  get dbPoolMax(): number {
    return this._configService.get<number>('dbPoolMax', 20);
  }

  get dbPoolIdleTimeout(): number {
    return this._configService.get<number>('dbPoolIdleTimeout', 30000);
  }

  get dbPoolConnectionTimeout(): number {
    return this._configService.get<number>('dbPoolConnectionTimeout', 2000);
  }

  get dbRetryAttempts(): number {
    return this._configService.get<number>('dbRetryAttempts', 10);
  }

  get dbRetryDelay(): number {
    return this._configService.get<number>('dbRetryDelay', 3000);
  }

  get dbMigrationsRun(): boolean {
    return this._configService.get<boolean>('dbMigrationsRun', false);
  }

  // Application configuration
  get port(): number {
    return this._configService.get<number>('port', 3000);
  }

  get nodeEnv(): string {
    return this._configService.get<string>('nodeEnv', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get apiPrefix(): string {
    return this._configService.get<string>('apiPrefix', 'api');
  }

  get swaggerPath(): string {
    return this._configService.get<string>('swaggerPath', 'api/docs');
  }

  get corsOrigin(): string {
    return this._configService.get<string>('corsOrigin', '*');
  }

  // JWT configuration
  get jwtSecret(): string {
    return this._configService.get<string>('jwtSecret', 'secret');
  }

  get jwtExpiration(): number {
    return this._configService.get<number>('jwtExpiration', 3600);
  }

  // Get any configuration value
  get<T>(key: string, defaultValue?: T): T {
    return this._configService.get<T>(key, defaultValue);
  }
}
