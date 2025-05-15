# Authentication Strategy for NestJS Migration

## NestJS Authentication Strategies

Based on the current FastAPI implementation and the requirements of the application, the following NestJS authentication
strategies are recommended:

### 1. JWT Authentication (Primary Strategy)

**Rationale:**

- The current system already uses JWT-based authentication with access and refresh tokens
- JWT is stateless and scalable, suitable for the application's architecture
- NestJS has excellent built-in support for JWT authentication

**Implementation:**

- Use `@nestjs/jwt` package for JWT token generation and validation
- Implement JWT Guard for protecting routes
- Create JWT strategy using Passport

### 2. Passport Integration

**Rationale:**

- Passport is the de-facto authentication library for Node.js applications
- NestJS has first-class support for Passport via `@nestjs/passport`
- Passport provides a consistent authentication interface with various strategies

**Strategies to Implement:**

1. **Passport-Local**: For username/password authentication
2. **Passport-JWT**: For JWT token validation
3. **Passport-OAuth2**: For potential future OAuth2 provider integration

## JWT Implementation Plan

### 1. Token Structure

**Access Token:**

```typescript
interface AccessTokenPayload {
    sub: string;       // User ID
    email: string;     // User email
    roles: string[];   // User roles (e.g., 'superuser')
    iat: number;       // Issued at timestamp
    exp: number;       // Expiration timestamp
}
```

**Refresh Token:**

```typescript
interface RefreshTokenPayload {
    sub: string;       // User ID
    jti: string;       // Unique token ID
    iat: number;       // Issued at timestamp
    exp: number;       // Expiration timestamp
}
```

### 2. Token Lifecycle

**Access Token:**

- Short-lived (15-30 minutes)
- Used for API authentication
- Validated on each request

**Refresh Token:**

- Long-lived (7-30 days)
- Used to obtain new access tokens
- Stored securely and rotated on use

### 3. Implementation Components

**JWT Module:**

```typescript
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtStrategy} from './strategies/jwt.strategy';
import {LocalStrategy} from './strategies/local.strategy';
import {AuthService} from './auth.service';
import {UsersModule} from '../users/users.module';

@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION'),
                },
            }),
        }),
        UsersModule,
    ],
    providers: [AuthService, JwtStrategy, LocalStrategy],
    exports: [AuthService],
})
export class AuthModule {
}
```

**JWT Strategy:**

```typescript
import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {ConfigService} from '@nestjs/config';
import {UsersService} from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findOne(payload.sub);
        return user;
    }
}
```

## Passport Integration Strategy

### 1. Authentication Flow

1. **Local Authentication (Login):**
    - User submits credentials (email/password)
    - LocalStrategy validates credentials
    - If valid, AuthService generates JWT tokens
    - Tokens are returned to the client

2. **JWT Authentication (Protected Routes):**
    - Client includes JWT in Authorization header
    - JwtStrategy extracts and validates the token
    - If valid, user is attached to request object
    - Controller/route handler processes the request

3. **Token Refresh:**
    - Client sends refresh token to refresh endpoint
    - AuthService validates refresh token
    - If valid, new access and refresh tokens are generated
    - New tokens are returned to the client

### 2. Guards Implementation

**Local Auth Guard:**

```typescript
import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
}
```

**JWT Auth Guard:**

```typescript
import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
}
```

**Role-Based Guard:**

```typescript
import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ROLES_KEY} from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const {user} = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.roles?.includes(role));
    }
}
```

## Session Management Plan

The current application uses a stateless JWT-based authentication approach without server-side sessions. This approach
is recommended to continue in the NestJS implementation for the following reasons:

1. **Statelessness**: JWT-based authentication is stateless, which aligns with RESTful principles and simplifies
   scaling.
2. **Compatibility**: The current frontend is already designed to work with JWT tokens.
3. **Performance**: Avoiding server-side sessions reduces database load and latency.

However, if session management becomes necessary in the future, NestJS supports it through:

### Potential Session Implementation (if needed):

1. **Express-session integration:**

```typescript
import * as session from 'express-session';

// In main.ts
app.use(
    session({
        secret: configService.get<string>('SESSION_SECRET'),
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 60000 * 60 * 24, // 1 day
            secure: process.env.NODE_ENV === 'production',
        },
    }),
);
```

2. **Session serialization with Passport:**

```typescript
import {PassportSerializer} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {UsersService} from '../users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private readonly usersService: UsersService) {
        super();
    }

    serializeUser(user: any, done: (err: Error, user: any) => void): any {
        done(null, user.id);
    }

    async deserializeUser(
        userId: string,
        done: (err: Error, payload: any) => void,
    ): Promise<any> {
        const user = await this.usersService.findOne(userId);
        done(null, user);
    }
}
```

## Conclusion

The recommended authentication strategy for the NestJS migration is to implement JWT-based authentication using
Passport.js integration. This approach:

1. Maintains compatibility with the current authentication flow
2. Leverages NestJS's built-in authentication capabilities
3. Provides a secure and scalable authentication solution
4. Supports role-based access control for authorization
5. Allows for future extensibility with additional authentication strategies

The implementation will use the `@nestjs/passport` and `@nestjs/jwt` packages to create a robust authentication system
that mirrors the functionality of the current FastAPI implementation while taking advantage of NestJS's features and
best practices.