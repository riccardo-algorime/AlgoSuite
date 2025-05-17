# Module Organization

This document outlines the module structure of the NestJS application.

## Core Module

The `CoreModule` provides shared functionality that is used across the application:

- Configuration management
- Logging
- Error handling
- Common utilities

## Feature Modules

### UsersModule

Handles user management, authentication, and authorization.

- Entity: `User`
- Controllers: `UsersController`
- Services: `UsersService`

### ProjectsModule

Manages projects created by users.

- Entity: `Project`
- Controllers: (To be implemented)
- Services: (To be implemented)

### AttackSurfacesModule

Manages attack surfaces associated with projects.

- Entity: `AttackSurface`
- Controllers: (To be implemented)
- Services: (To be implemented)

### AssetsModule

Manages assets associated with attack surfaces.

- Entity: `Asset`
- Controllers: (To be implemented)
- Services: (To be implemented)

### ScansModule

Manages security scans.

- Entity: `Scan`
- Controllers: (To be implemented)
- Services: (To be implemented)

### ScanResultsModule

Manages the results of security scans.

- Entity: `ScanResult`
- Controllers: (To be implemented)
- Services: (To be implemented)

### FindingsModule

Manages security findings from scans.

- Entity: `Finding`
- Controllers: (To be implemented)
- Services: (To be implemented)

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

## Future Enhancements

- Implement lazy loading for modules to improve performance
- Add feature flags to conditionally enable/disable modules
- Implement shared modules for common functionality across feature modules
