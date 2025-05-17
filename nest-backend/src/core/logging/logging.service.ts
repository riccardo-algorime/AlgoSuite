import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import * as winston from 'winston';
import * as dailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggingService implements NestLoggerService {
  private _logger: winston.Logger;

  constructor(private _configService: ConfigService) {
    this._logger = this._createLogger();
  }

  log(message: string, context?: string): void {
    this._logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this._logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this._logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this._logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this._logger.verbose(message, { context });
  }

  /**
   * Create a child logger with a specific context
   * @param context The context for the child logger
   * @returns A new logger instance with the specified context
   */
  createContextLogger(context: string): LoggingService {
    const childLogger = new LoggingService(this._configService);
    childLogger._logger = this._logger.child({ context });
    return childLogger;
  }

  /**
   * Create a Winston logger with appropriate transports based on the environment
   * @returns A configured Winston logger
   */
  private _createLogger(): winston.Logger {
    const { combine, timestamp, printf, colorize } = winston.format;

    // Custom log format
    const logFormat = printf(({ level, message, timestamp, context, trace }) => {
      return `${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message}${
        trace ? `\n${trace}` : ''
      }`;
    });

    // Create transports array based on environment
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: combine(colorize(), timestamp(), logFormat),
      }),
    ];

    // Add file transports in production
    if (this._configService.isProduction) {
      // Add daily rotate file transport for all logs
      transports.push(
        new dailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: combine(timestamp(), logFormat),
        }),
      );

      // Add daily rotate file transport for error logs
      transports.push(
        new dailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          format: combine(timestamp(), logFormat),
        }),
      );
    }

    return winston.createLogger({
      level: this._configService.isDevelopment ? 'debug' : 'info',
      format: combine(timestamp(), logFormat),
      transports,
    });
  }
}
