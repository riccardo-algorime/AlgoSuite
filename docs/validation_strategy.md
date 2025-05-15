# Validation Strategy for NestJS Migration

## Overview

This document outlines the validation strategy for the NestJS migration, focusing on data validation, transformation,
and error handling. The strategy leverages NestJS's built-in validation capabilities and integrates with the TypeScript
type system to ensure data integrity throughout the application.

## Class-Validator Implementation

### Rationale

- **Type Safety**: Provides strong type checking at runtime
- **Decorator-based**: Aligns with NestJS's decorator-driven approach
- **Extensive Rules**: Offers a comprehensive set of validation decorators
- **Integration**: Seamlessly works with NestJS's validation pipe

### Implementation Plan

1. **Installation**:

```bash
npm install class-validator class-transformer
```

2. **Basic Usage in DTOs**:

```typescript
import {IsString, IsEmail, IsNotEmpty, Length, IsOptional} from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @Length(8, 100)
    password: string;

    @IsOptional()
    @IsString()
    bio?: string;
}
```

3. **Common Validators to Use**:

| Validator            | Purpose                    | Example             |
|----------------------|----------------------------|---------------------|
| `@IsNotEmpty()`      | Ensures value is not empty | `@IsNotEmpty()`     |
| `@IsString()`        | Validates string type      | `@IsString()`       |
| `@IsNumber()`        | Validates number type      | `@IsNumber()`       |
| `@IsBoolean()`       | Validates boolean type     | `@IsBoolean()`      |
| `@IsDate()`          | Validates Date objects     | `@IsDate()`         |
| `@IsEmail()`         | Validates email format     | `@IsEmail()`        |
| `@Length(min, max)`  | Validates string length    | `@Length(5, 100)`   |
| `@Min(val)`          | Validates minimum number   | `@Min(0)`           |
| `@Max(val)`          | Validates maximum number   | `@Max(100)`         |
| `@IsOptional()`      | Makes property optional    | `@IsOptional()`     |
| `@IsEnum(enum)`      | Validates enum values      | `@IsEnum(UserRole)` |
| `@IsArray()`         | Validates arrays           | `@IsArray()`        |
| `@ValidateNested()`  | Validates nested objects   | `@ValidateNested()` |
| `@ArrayMinSize(min)` | Validates min array length | `@ArrayMinSize(1)`  |
| `@ArrayMaxSize(max)` | Validates max array length | `@ArrayMaxSize(10)` |

## Class-Transformer Usage

### Rationale

- **Type Conversion**: Automatically converts incoming JSON to class instances
- **Data Transformation**: Transforms data during serialization/deserialization
- **Property Filtering**: Excludes sensitive data from responses
- **Integration**: Works with class-validator for complete validation pipeline

### Implementation Plan

1. **Basic Transformation**:

```typescript
import {Exclude, Expose, Transform} from 'class-transformer';

export class UserResponseDto {
    id: number;
    name: string;
    email: string;

    @Exclude()
    password: string;

    @Expose({name: 'registeredAt'})
    createdAt: Date;

    @Transform(({value}) => value ? 'Yes' : 'No')
    isActive: boolean;
}
```

2. **Common Transformers to Use**:

| Transformer          | Purpose                       | Example                                          |
|----------------------|-------------------------------|--------------------------------------------------|
| `@Exclude()`         | Excludes property from output | `@Exclude()`                                     |
| `@Expose()`          | Explicitly includes property  | `@Expose()`                                      |
| `@Type(() => Class)` | Specifies type for conversion | `@Type(() => User)`                              |
| `@Transform()`       | Custom transformation         | `@Transform(({ value }) => value.toUpperCase())` |

3. **Transformation Groups**:

```typescript
import {Exclude, Expose} from 'class-transformer';

export class UserDto {
    @Expose({groups: ['user.read', 'user.create']})
    id: number;

    @Expose({groups: ['user.read', 'user.create']})
    name: string;

    @Expose({groups: ['user.read', 'user.create']})
    email: string;

    @Exclude({groups: ['user.read']})
    @Expose({groups: ['user.create']})
    password: string;
}
```

## Validation Pipe Strategy

### Rationale

- **Automatic Validation**: Validates incoming requests without manual code
- **Transformation**: Transforms payloads to DTO instances
- **Error Handling**: Provides consistent error responses
- **Performance**: Validates only what's needed based on endpoint requirements

### Implementation Plan

1. **Global Validation Pipe**:

```typescript
// main.ts
import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties not in DTO
            forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
            transform: true, // Transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: true, // Automatically convert types
            },
        }),
    );

    await app.listen(3000);
}

bootstrap();
```

2. **Controller-Level Validation**:

```typescript
import {Body, Controller, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UsersService} from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Post()
    @UsePipes(new ValidationPipe({transform: true}))
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }
}
```

3. **Validation Options**:

| Option                   | Purpose                                     | Default |
|--------------------------|---------------------------------------------|---------|
| `whitelist`              | Strips non-whitelisted properties           | `false` |
| `forbidNonWhitelisted`   | Throws error for non-whitelisted properties | `false` |
| `transform`              | Transforms payload to DTO instance          | `false` |
| `disableErrorMessages`   | Disables detailed error messages            | `false` |
| `validationError.target` | Includes target object in errors            | `true`  |
| `validationError.value`  | Includes validated value in errors          | `true`  |
| `stopAtFirstError`       | Stops validation at first error             | `false` |

## Custom Validators

### Rationale

- **Complex Validation**: Handles validation logic beyond simple decorators
- **Business Rules**: Implements domain-specific validation rules
- **Cross-Field Validation**: Validates relationships between fields
- **Async Validation**: Performs database lookups or external API calls

### Implementation Plan

1. **Custom Property Decorator**:

```typescript
import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';

export function IsPasswordStrong(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isPasswordStrong',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                    return typeof value === 'string' && regex.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
                },
            },
        });
    };
}
```

2. **Class Validator**:

```typescript
import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import {Injectable} from '@nestjs/common';
import {UsersService} from './users.service';

@ValidatorConstraint({name: 'isEmailUnique', async: true})
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private usersService: UsersService) {
    }

    async validate(email: string, args: ValidationArguments) {
        const user = await this.usersService.findByEmail(email);
        return !user; // Return true if email is unique (user not found)
    }

    defaultMessage(args: ValidationArguments) {
        return `Email already exists`;
    }
}
```

3. **Using Custom Validators**:

```typescript
import {IsNotEmpty, IsEmail, Validate} from 'class-validator';
import {IsEmailUniqueConstraint} from '../validators/is-email-unique.constraint';
import {IsPasswordStrong} from '../validators/is-password-strong.validator';

export class CreateUserDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @Validate(IsEmailUniqueConstraint)
    email: string;

    @IsPasswordStrong()
    password: string;
}
```

4. **Cross-Field Validation**:

```typescript
import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'match',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    return value === relatedValue;
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return `${propertyName} must match ${relatedPropertyName}`;
                },
            },
        });
    };
}

// Usage
export class ResetPasswordDto {
    @IsNotEmpty()
    @IsPasswordStrong()
    password: string;

    @IsNotEmpty()
    @Match('password', {message: 'Passwords do not match'})
    passwordConfirm: string;
}
```

## Migration Strategy from FastAPI/Pydantic

### Mapping Pydantic Validators to Class-Validator

| Pydantic                            | Class-Validator                           | Notes                    |
|-------------------------------------|-------------------------------------------|--------------------------|
| `Field(min_length=x, max_length=y)` | `@Length(x, y)`                           | String length validation |
| `Field(gt=x, lt=y)`                 | `@Min(x+1)` & `@Max(y-1)`                 | Number range validation  |
| `Field(ge=x, le=y)`                 | `@Min(x)` & `@Max(y)`                     | Inclusive number range   |
| `Field(regex=pattern)`              | `@Matches(pattern)`                       | Regex pattern validation |
| `EmailStr`                          | `@IsEmail()`                              | Email validation         |
| `constr(strip_whitespace=True)`     | `@Transform(({ value }) => value.trim())` | Whitespace trimming      |
| `validator('field')`                | Custom validator                          | Custom validation logic  |
| `root_validator`                    | Class validator                           | Cross-field validation   |

### Implementation Steps

1. **Identify all Pydantic models** in the current FastAPI application
2. **Create equivalent DTOs** using class-validator decorators
3. **Map validation rules** from Pydantic to class-validator
4. **Implement custom validators** for complex validation logic
5. **Test validation** to ensure equivalent behavior

## Conclusion

The validation strategy for the NestJS migration will use class-validator and class-transformer to provide robust data
validation and transformation. The strategy:

1. Leverages NestJS's built-in validation pipe for automatic request validation
2. Uses class-validator decorators for defining validation rules
3. Implements class-transformer for data transformation and serialization
4. Creates custom validators for complex business rules
5. Provides a consistent approach to validation across the application

This approach ensures data integrity, improves type safety, and provides clear error messages to clients, while
maintaining compatibility with the validation rules in the current FastAPI application.