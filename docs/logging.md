# Logging System

This document outlines the logging system of the NestJS application.

## Overview

The application uses Winston for logging, with a custom LoggingService that implements NestJS's LoggerService interface. The logging system provides different log levels, context-aware logging, and environment-specific configuration.

## Log Levels

The logging system supports the following log levels, in order of severity:

1. **error**: For errors that require immediate attention
2. **warn**: For warnings that don't require immediate action
3. **info**: For general information about application operation
4. **debug**: For detailed debugging information
5. **verbose**: For even more detailed debugging information

## Log Formats

Logs are formatted as follows:

```
{timestamp} [{level}] [{context}] {message}
```

For errors with stack traces:

```
{timestamp} [{level}] [{context}] {message}
{stack trace}
```

## Log Storage

In development, logs are output to the console with colorization for better readability.

In production, logs are:
1. Output to the console
2. Written to rotating log files:
   - `logs/application-%DATE%.log`: All logs
   - `logs/error-%DATE%.log`: Error logs only

Log files are rotated daily, compressed, and kept for 14 days.

## Context-Aware Logging

The LoggingService supports context-aware logging, allowing you to specify a context for each log message. This helps identify the source of log messages.

```typescript
// In a service
@Injectable()
export class MyService {
  private _logger: LoggingService;

  constructor(loggingService: LoggingService) {
    this._logger = loggingService.createContextLogger(MyService.name);
  }

  someMethod(): void {
    this._logger.log('Method called'); // [MyService] Method called
  }
}
```

## Usage

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../core/logging/logging.service';

@Injectable()
export class MyService {
  constructor(private _loggingService: LoggingService) {}

  someMethod(): void {
    this._loggingService.log('This is an info message', 'MyService');
    this._loggingService.error('This is an error message', 'Error stack trace', 'MyService');
    this._loggingService.warn('This is a warning message', 'MyService');
    this._loggingService.debug('This is a debug message', 'MyService');
    this._loggingService.verbose('This is a verbose message', 'MyService');
  }
}
```

### Context-Aware Logging

```typescript
import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../core/logging/logging.service';

@Injectable()
export class MyService {
  private _logger: LoggingService;

  constructor(loggingService: LoggingService) {
    this._logger = loggingService.createContextLogger(MyService.name);
  }

  someMethod(): void {
    this._logger.log('This is an info message');
    this._logger.error('This is an error message', 'Error stack trace');
    this._logger.warn('This is a warning message');
    this._logger.debug('This is a debug message');
    this._logger.verbose('This is a verbose message');
  }
}
```

## Best Practices

1. Use the appropriate log level for each message
2. Always provide a context for log messages
3. Include relevant information in log messages, but avoid sensitive data
4. Use structured logging for machine-readable logs
5. Log at the beginning and end of important operations
6. Include correlation IDs for tracking requests across services
