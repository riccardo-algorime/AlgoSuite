# Lints to Solve in nest-backend

This document tracks all the linting issues in the nest-backend codebase. Each issue has brackets `[ ]` that can be checked `[x]` when fixed.

## Naming Convention Issues

### Parameter Property Names (need leading underscore)
- [x] `appService` in app.controller.ts
- [x] `dataSource` in database.service.ts
- [x] `usersService` in users.controller.ts
- [x] `usersRepository` in users.service.ts

### Class Property Names (need leading underscore)
- [x] `logger` in database.service.ts

### Enum Names (need Enum suffix)
- [x] `AssetType` in asset-type.enum.ts
- [x] `SurfaceType` in surface-type.enum.ts
- [x] `Severity` in severity.enum.ts
- [x] `ScanStatus` in scan-status.enum.ts
- [x] `ScanType` in scan-type.enum.ts

### Enum Member Names (need camelCase)
- [x] `SERVER`, `WEBSITE`, `DATABASE`, `APPLICATION`, `ENDPOINT`, `CONTAINER`, `NETWORK_DEVICE`, `CLOUD_RESOURCE`, `OTHER` in asset-type.enum.ts
- [x] `WEB`, `API`, `MOBILE`, `NETWORK`, `CLOUD`, `IOT`, `OTHER` in surface-type.enum.ts
- [x] `HIGH`, `MEDIUM`, `LOW`, `INFO` in severity.enum.ts
- [x] `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED` in scan-status.enum.ts
- [x] `VULNERABILITY`, `NETWORK`, `WEB`, `API`, `MOBILE`, `CLOUD` in scan-type.enum.ts

### Import Names
- [x] `Joi` in app.module.ts

### Object Literal Property Names (need camelCase)
- [x] `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SYNCHRONIZE`, `DB_LOGGING`, `DB_POOL_MAX`, `DB_POOL_IDLE_TIMEOUT`, `DB_POOL_CONNECTION_TIMEOUT`, `DB_RETRY_ATTEMPTS`, `DB_RETRY_DELAY`, `DB_MIGRATIONS_RUN` in app.module.ts
- [x] `PORT`, `NODE_ENV`, `API_PREFIX`, `SWAGGER_PATH`, `CORS_ORIGIN` in app.module.ts
- [x] `JWT_SECRET`, `JWT_EXPIRATION` in app.module.ts

## No Explicit Any Issues
- [x] `any` in asset.entity.ts
- [x] `any` in attack-surface.entity.ts
- [x] `any` in scan.entity.ts
- [x] `any` in users.controller.ts (createUserDto)
- [x] `any` in users.controller.ts (updateUserDto)
- [x] `any` in users.service.ts (createUserDto)
- [x] `any` in users.service.ts (updateUserDto)

## Missing Return Types
- [x] Missing return type in database.service.ts (onModuleInit)
- [x] Missing return type in main.ts (bootstrap)
- [x] Missing return types in users.controller.ts (create, findAll, findOne, update, remove)
- [x] Missing return types in users.service.ts (create, findAll, findOne, update, remove)

## Unused Variables
- [x] 'ConfigService' is defined but never used in app.module.ts

## TypeScript Config Issues
- [x] typeorm.config.ts is not included in the tsconfig.json

## Summary of Lint Types
- Naming convention issues: 47 (Fixed: 47)
- No explicit any: 7 (Fixed: 7)
- Missing return types: 13 (Fixed: 13)
- Unused variables: 1 (Fixed: 1)
- TypeScript config issues: 1 (Fixed: 1)

Total: 69 errors, 29 warnings (All fixed!)
