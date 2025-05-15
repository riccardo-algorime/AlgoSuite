# Logging and Monitoring Strategy for NestJS Migration

## Logging Library Selection

### Chosen Library: Winston

After evaluating several logging libraries for NestJS, we have selected Winston as our primary logging solution for the
following reasons:

1. **Integration with NestJS**: Winston has official NestJS integration via the `nest-winston` package
2. **Flexibility**: Supports multiple transports (console, file, external services)
3. **Structured Logging**: Provides JSON logging capabilities for better log analysis
4. **Performance**: High-performance logging with minimal overhead
5. **Community Support**: Widely used in the Node.js ecosystem with active maintenance

### Alternative Libraries Considered

- **Pino**: Offers better performance but less flexibility in formatting
- **Bunyan**: Good structured logging but less active development
- **Morgan**: HTTP request logging only, will be used alongside Winston for request logging

## Logging Configuration

### Basic Setup

```typescript
// logger.module.ts
import {Module} from '@nestjs/common';
import {WinstonModule} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.ms(),
                        winston.format.colorize(),
                        winston.format.printf(
                            (info) => `${info.timestamp} ${info.level}: ${info.message}`,
                        ),
                    ),
                }),
                new winston.transports.DailyRotateFile({
                    filename: 'logs/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json(),
                    ),
                }),
            ],
        }),
    ],
    exports: [WinstonModule],
})
export class LoggerModule {
}
```

### Environment-Specific Configuration

```typescript
// app.module.ts
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LoggerModule} from './logger/logger.module';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {LoggingInterceptor} from './interceptors/logging.interceptor';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        LoggerModule,
        // Other modules
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class AppModule {
}
```

### Request Logging Interceptor

```typescript
// logging.interceptor.ts
import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger} from '@nestjs/common';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const {method, url, body, ip} = request;
        const userAgent = request.get('user-agent') || '';
        const startTime = Date.now();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const response = context.switchToHttp().getResponse();
                    const responseTime = Date.now() - startTime;

                    this.logger.log(
                        `${method} ${url} ${response.statusCode} ${responseTime}ms - ${ip} - ${userAgent}`,
                    );
                },
                error: (error) => {
                    const response = context.switchToHttp().getResponse();
                    const responseTime = Date.now() - startTime;

                    this.logger.error(
                        `${method} ${url} ${response.statusCode} ${responseTime}ms - ${ip} - ${userAgent}`,
                        error.stack,
                    );
                },
            }),
        );
    }
}
```

### Contextual Logging

```typescript
// user.service.ts
import {Injectable, Logger} from '@nestjs/common';
import {User} from './user.entity';
import {UserRepository} from './user.repository';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(private userRepository: UserRepository) {
    }

    async findOne(id: number): Promise<User> {
        this.logger.debug(`Finding user with id: ${id}`);

        try {
            const user = await this.userRepository.findOne(id);

            if (!user) {
                this.logger.warn(`User with id ${id} not found`);
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            this.logger.error(`Error finding user with id ${id}`, error.stack);
            throw error;
        }
    }
}
```

## Monitoring Integration Plan

### APM Solution: New Relic

We will use New Relic as our primary Application Performance Monitoring (APM) solution for the following reasons:

1. **Comprehensive Monitoring**: Provides application, infrastructure, and user experience monitoring
2. **Node.js Support**: Excellent support for Node.js applications
3. **Distributed Tracing**: Built-in distributed tracing capabilities
4. **Alerting**: Robust alerting and notification system
5. **Dashboard**: Customizable dashboards for visualizing metrics

### New Relic Integration

```typescript
// main.ts
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from '@nestjs/config';

// Initialize New Relic if not in development mode
if (process.env.NODE_ENV !== 'development') {
    require('newrelic');
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get('PORT', 3000);

    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
```

### Prometheus and Grafana (Alternative)

For projects requiring an open-source monitoring solution, we will implement Prometheus and Grafana:

```typescript
// metrics.module.ts
import {Module} from '@nestjs/common';
import {PrometheusModule} from '@willsoto/nestjs-prometheus';

@Module({
    imports: [
        PrometheusModule.register({
            defaultMetrics: {
                enabled: true,
            },
            path: '/metrics',
        }),
    ],
})
export class MetricsModule {
}
```

## Error Tracking Strategy

### Error Tracking Service: Sentry

We will use Sentry for error tracking and monitoring for the following reasons:

1. **Real-time Error Tracking**: Captures and reports errors in real-time
2. **Context**: Provides detailed context for each error
3. **Source Maps**: Supports source maps for TypeScript applications
4. **Issue Management**: Allows for assigning, commenting, and resolving issues
5. **Integration**: Integrates well with NestJS

### Sentry Integration

```typescript
// sentry.module.ts
import {Module} from '@nestjs/common';
import {APP_INTERCEPTOR} from '@nestjs/core';
import * as Sentry from '@sentry/node';
import {ConfigService} from '@nestjs/config';
import {SentryInterceptor} from './sentry.interceptor';

@Module({
    providers: [
        {
            provide: 'SENTRY_INIT',
            useFactory: (configService: ConfigService) => {
                Sentry.init({
                    dsn: configService.get('SENTRY_DSN'),
                    environment: configService.get('NODE_ENV'),
                    release: process.env.npm_package_version,
                    tracesSampleRate: 1.0,
                });
                return Sentry;
            },
            inject: [ConfigService],
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: SentryInterceptor,
        },
    ],
    exports: ['SENTRY_INIT'],
})
export class SentryModule {
}
```

### Sentry Interceptor

```typescript
// sentry.interceptor.ts
import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject} from '@nestjs/common';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
    constructor(@Inject('SENTRY_INIT') private readonly sentry: typeof Sentry) {
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            tap({
                error: (exception) => {
                    this.sentry.withScope((scope) => {
                        const request = context.switchToHttp().getRequest();

                        // Add request information to Sentry scope
                        scope.setExtra('req', {
                            method: request.method,
                            url: request.url,
                            headers: request.headers,
                            body: request.body,
                            query: request.query,
                            params: request.params,
                        });

                        if (request.user) {
                            scope.setUser({
                                id: request.user.id,
                                email: request.user.email,
                            });
                        }

                        this.sentry.captureException(exception);
                    });
                },
            }),
        );
    }
}
```

### Global Exception Filter

```typescript
// all-exceptions.filter.ts
import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {HttpAdapterHost} from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const {httpAdapter} = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message:
                exception instanceof HttpException
                    ? exception.message
                    : 'Internal server error',
        };

        // Log the exception
        this.logger.error(
            `Exception: ${JSON.stringify(responseBody)}`,
            exception instanceof Error ? exception.stack : '',
        );

        // Capture exception in Sentry
        if (httpStatus >= 500) {
            Sentry.captureException(exception);
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
```

## Performance Monitoring Approach

### Key Metrics to Monitor

1. **Response Time**
    - Average response time
    - 95th and 99th percentile response times
    - Response time by endpoint

2. **Throughput**
    - Requests per second
    - Requests by endpoint
    - Success vs. failure rates

3. **Resource Utilization**
    - CPU usage
    - Memory usage
    - Garbage collection metrics
    - Event loop lag

4. **Database Performance**
    - Query execution time
    - Connection pool utilization
    - Slow queries

5. **External Service Calls**
    - Response time
    - Error rates
    - Availability

### Custom Metrics Collection

```typescript
// metrics.service.ts
import {Injectable} from '@nestjs/common';
import {Counter, Gauge, Histogram} from 'prom-client';
import {InjectMetric} from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
    constructor(
        @InjectMetric('http_request_duration_seconds')
        private readonly requestDurationHistogram: Histogram<string>,
        @InjectMetric('http_requests_total')
        private readonly requestsCounter: Counter<string>,
        @InjectMetric('active_connections')
        private readonly activeConnectionsGauge: Gauge<string>,
    ) {
    }

    recordRequestDuration(method: string, route: string, statusCode: number, duration: number): void {
        this.requestDurationHistogram.labels(method, route, statusCode.toString()).observe(duration);
    }

    incrementRequestCount(method: string, route: string, statusCode: number): void {
        this.requestsCounter.labels(method, route, statusCode.toString()).inc();
    }

    setActiveConnections(count: number): void {
        this.activeConnectionsGauge.set(count);
    }
}
```

### Health Checks

```typescript
// health.controller.ts
import {Controller, Get} from '@nestjs/common';
import {HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator, HealthCheck} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private db: TypeOrmHealthIndicator,
    ) {
    }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.db.pingCheck('database'),
            () => this.http.pingCheck('external-api', 'https://api.example.com/health'),
        ]);
    }
}
```

## Best Practices

1. **Structured Logging**
    - Use structured JSON logging in production
    - Include contextual information (request ID, user ID, etc.)
    - Use appropriate log levels (debug, info, warn, error)

2. **Correlation IDs**
    - Generate a unique ID for each request
    - Pass the ID through all services and components
    - Include the ID in all log messages related to the request

3. **Log Rotation**
    - Implement log rotation to prevent disk space issues
    - Archive old logs for compliance and debugging

4. **Security Considerations**
    - Avoid logging sensitive information (passwords, tokens, PII)
    - Implement proper access controls for log storage
    - Consider log encryption for sensitive environments

5. **Alerting Strategy**
    - Define clear thresholds for alerts
    - Implement different severity levels
    - Avoid alert fatigue with proper tuning
    - Set up on-call rotations for critical alerts

6. **Documentation**
    - Document logging standards for developers
    - Create runbooks for common alerts
    - Maintain dashboards for key metrics

7. **Regular Review**
    - Periodically review logging and monitoring effectiveness
    - Adjust based on operational experience
    - Update as application evolves

## Implementation Roadmap

1. **Phase 1: Basic Logging**
    - Implement Winston logger
    - Set up log rotation
    - Create logging interceptor

2. **Phase 2: Error Tracking**
    - Integrate Sentry
    - Implement global exception filter
    - Set up error notifications

3. **Phase 3: Performance Monitoring**
    - Set up APM (New Relic or Prometheus/Grafana)
    - Implement custom metrics
    - Create dashboards

4. **Phase 4: Health Checks and Alerting**
    - Implement health check endpoints
    - Set up alerting rules
    - Create on-call procedures

5. **Phase 5: Optimization**
    - Review and optimize based on gathered metrics
    - Fine-tune logging levels
    - Adjust alerting thresholds