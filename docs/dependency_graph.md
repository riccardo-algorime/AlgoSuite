# Dependency Injection Graph

This document outlines the dependency injection structure of the NestJS application.

## Service Dependencies

```
AppService
└── No dependencies

UsersService
└── UsersRepository

ProjectsService
└── ProjectsRepository

AttackSurfacesService
└── AttackSurfacesRepository

AssetsService
└── AssetsRepository

ScansService
└── ScansRepository

ScanResultsService
└── ScanResultsRepository

FindingsService
└── FindingsRepository
```

## Module Dependencies

```
AppModule
├── CoreModule
├── DatabaseModule
├── UsersModule
├── ProjectsModule
├── AttackSurfacesModule
├── AssetsModule
├── ScansModule
├── ScanResultsModule
└── FindingsModule

ProjectsModule
└── UsersModule (dependency)

AttackSurfacesModule
└── ProjectsModule (dependency)

AssetsModule
└── AttackSurfacesModule (dependency)

ScansModule
└── UsersModule (dependency)

ScanResultsModule
└── ScansModule (dependency)

FindingsModule
└── ScansModule (dependency)
└── ScanResultsModule (dependency)
```

## Repository Dependencies

Each service depends on its corresponding repository, which is injected using the `@InjectRepository()` decorator from TypeORM.

## Future Enhancements

In future iterations, we will implement more complex dependency injection patterns:

1. **Factory Providers**: For creating providers with dynamic values based on environment or configuration
2. **Alias Providers**: For providing alternative implementations of services
3. **Custom Providers**: For more complex initialization logic
4. **Async Providers**: For providers that depend on asynchronous operations during initialization

## Best Practices

1. Always use constructor injection rather than property injection
2. Keep services focused on a single responsibility
3. Use interfaces to define service contracts
4. Export only what is necessary from modules
5. Use the `@Injectable()` decorator for all services
6. Use the `@InjectRepository()` decorator for repository injection
