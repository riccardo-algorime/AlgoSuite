# Linting Issues in nest-backend

This document tracks all the linting issues found in the nest-backend codebase. Each issue has brackets `[ ]` that can be checked `[x]` when fixed.

## TypeScript ESLint Issues

### No Explicit Any (`@typescript-eslint/no-explicit-any`)

- [x] `all-exceptions.filter.ts` (line 31:39) - Unexpected any. Specify a different type
  ```typescript
  (exception.getResponse() as any).error
  ```

- [x] `all-exceptions.filter.ts` (line 32:50) - Unexpected any. Specify a different type
  ```typescript
  (exception.getResponse() as any).error
  ```

- [x] `http-exception.filter.ts` (line 23:29) - Unexpected any. Specify a different type
  ```typescript
  (errorResponse as any).message || exception.message
  ```

- [x] `http-exception.filter.ts` (line 26:62) - Unexpected any. Specify a different type
  ```typescript
  (errorResponse as any).error
  ```

- [x] `http-exception.filter.ts` (line 27:38) - Unexpected any. Specify a different type
  ```typescript
  (errorResponse as any).error
  ```

### Unused Variables (`@typescript-eslint/no-unused-vars`)

- [x] `http-exception.filter.ts` (line 1:64) - 'HttpStatus' is defined but never used. Allowed unused vars must match /^_/u
  ```typescript
  import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
  ```

### Naming Convention (`@typescript-eslint/naming-convention`)

- [x] `logging.service.ts` (line 4:13) - Import name `DailyRotateFile` must match one of the following formats: camelCase
  ```typescript
  import * as DailyRotateFile from 'winston-daily-rotate-file';
  ```

## Suggested Fixes

### No Explicit Any
Replace `any` with appropriate interfaces or types:

1. Create interfaces for the response objects:
   ```typescript
   interface HttpExceptionResponse {
     error?: string;
     message?: string;
     [key: string]: unknown;
   }
   ```

2. Use these interfaces instead of `any`:
   ```typescript
   (exception.getResponse() as HttpExceptionResponse).error
   ```

### Unused Variables
Remove the unused import or prefix it with an underscore if it might be needed later:

```typescript
// Remove unused import
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

// OR prefix with underscore if it might be needed later
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, _HttpStatus } from '@nestjs/common';
```

### Naming Convention
Change the import to use camelCase:

```typescript
import * as dailyRotateFile from 'winston-daily-rotate-file';
```

## TypeScript Version Warning

There is a warning about the TypeScript version being used:

```
WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.

You may find that it works just fine, or you may not.

SUPPORTED TYPESCRIPT VERSIONS: >=4.3.5 <5.4.0

YOUR TYPESCRIPT VERSION: 5.8.3
```

This is not a linting error but should be addressed to ensure compatibility. Consider downgrading TypeScript to a supported version or updating ESLint dependencies to support the current TypeScript version.

**Note**: This warning is still present after fixing all the linting errors. It's a compatibility warning rather than a linting error and can be addressed in a separate task.
