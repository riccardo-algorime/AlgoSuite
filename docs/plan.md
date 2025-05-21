# Algosuite Backend Type & Lint Fix Plan

## What We Did

### 1. Type Issue Investigation & Fixes
- **Identified** persistent TypeScript errors related to TypeORM's DeepPartial and nested object assignments (e.g., `config`, `assetMetadata`).
- **Removed** all incorrect imports of `_QueryDeepPartialEntity`, which is not part of TypeORM's public API.
- **Updated** the `create` and `update` methods in:
  - `projects.service.ts` (handled `attackSurfaces` array and `config` field)
  - `attack-surfaces.service.ts` (handled `config` field)
  - `assets.service.ts` (handled `assetMetadata` field)
- **Fixed** import path for `Project` in `user.entity.ts`.

### 2. Type Assertion Adjustments
- Used correct typing for nested relations and JSON fields, matching the types declared in the entity files.
- Ensured all mappings and assignments use explicit `DeepPartial<T>` where appropriate.

### 3. Lint & Compile Testing
- Ran the TypeScript compiler and surfaced remaining type errors for further fixing.

## What Remains To Do

### 1. Outstanding Type Errors
- Some errors persist due to TypeORM's strict internal type expectations for nested relations and JSON fields. These typically look like:
  - `Type 'Record<string, unknown>' is not assignable to type '(() => string) | _QueryDeepPartialEntity<Record<string, unknown> | undefined>'`
- **Next Step:** Consider using `as unknown as DeepPartial<T>` as a workaround for these strict cases, or refactor DTO/entity types for compatibility.

### 2. Missing Type Declarations
- `@types/cors` is missing. Need to run: `npm i --save-dev @types/cors`

### 3. Remaining Import/Entity Issues
- Ensure all entity import paths are correct and all decorators reference the correct types.

### 4. General Linting
- Address any remaining lint warnings and ensure all DTOs/entities either initialize properties or use definite assignment assertions (`!`).
- Review and fix errors in `logging.service.ts`, `database.service.ts`, and `config.service.ts` as previously identified.

## Next Steps Checklist

- [x] Remove all `_QueryDeepPartialEntity` imports
- [x] Update type assertions for `config` and `assetMetadata`
- [x] Fix import path for `Project` in `user.entity.ts`
- [x] Apply workaround for strict DeepPartial errors if needed (see notes below)
- [x] Install missing type declarations (`@types/cors`)
- [ ] Run linter and TypeScript compiler until clean (`npm run lint && npm run typecheck`)
- [ ] Review and fix all remaining lint/type errors in all modules (see outstanding issues below)

#### Notes:
- **DeepPartial workaround:** If strict type errors persist with DeepPartial usage, consider using type assertions or utility types to satisfy the compiler. Example: `foo as DeepPartial<Bar>` or define a custom helper.
- **Outstanding Issues:**
  - Some entities/DTOs lack initializers or definite assignment assertions (`!`).
  - `logging.service.ts` and `database.service.ts` have unresolved type errors (see plan above).
  - Ensure all imports and decorators reference correct types.

---

_Last updated: 2025-05-21 13:05_
