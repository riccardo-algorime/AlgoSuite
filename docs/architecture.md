# Current Architecture Documentation

## High-Level System Diagram

```
+-------------------+       +-------------------+
|                   |       |                   |
|  React Frontend   |<----->|  FastAPI Backend  |
|  (TypeScript)     |       |  (Python)         |
|                   |       |                   |
+-------------------+       +---------+---------+
                                      |
                                      v
                            +---------+---------+
                            |                   |
                            |     Database      |
                            |                   |
                            +-------------------+
```

## Service Interactions

The application follows a typical client-server architecture with the following components:

### Frontend (React/TypeScript)

- Located in the `algosuite` directory
- Built with React and TypeScript
- Organized into:
    - `api`: Client code for communicating with the backend
    - `components`: Reusable UI components
    - `contexts`: React contexts for state management
    - `hooks`: Custom React hooks
    - `pages`: Application pages/routes
    - `tests`: Frontend tests
    - `types`: TypeScript type definitions
    - `utils`: Utility functions

### Backend (FastAPI/Python)

- Located in the `backend` directory
- Built with FastAPI framework
- Organized into:
    - `api`: API endpoints and routes
        - `dependencies`: Dependency injection components
        - `endpoints`: API endpoint implementations
        - `v1`: API version 1 endpoints
    - `core`: Core functionality and configurations
    - `db`: Database connection and operations
    - `models`: Database models (SQLAlchemy)
    - `schemas`: Pydantic models for request/response validation
    - `services`: Business logic implementation
    - `tasks`: Background tasks
    - `utils`: Utility functions

### Database

- Uses SQLAlchemy ORM for database operations
- Migrations managed with Alembic
- Multiple migration scripts present in the project

## Data Flow Through the System

1. **User Interaction**:
    - User interacts with the React frontend
    - Frontend components render the UI and handle user input

2. **API Requests**:
    - Frontend makes API requests to the backend using the API client code
    - Requests are sent to specific endpoints in the FastAPI backend

3. **Backend Processing**:
    - FastAPI routes the request to the appropriate endpoint
    - Endpoint handlers validate the request using Pydantic schemas
    - Business logic is executed in service layers
    - Database operations are performed using SQLAlchemy models

4. **Database Interaction**:
    - Backend interacts with the database using SQLAlchemy ORM
    - Data is retrieved, created, updated, or deleted as needed

5. **Response**:
    - Backend returns a response to the frontend
    - Response is validated using Pydantic schemas
    - Frontend processes the response and updates the UI accordingly

6. **Background Processing**:
    - Some operations may be performed asynchronously in background tasks
    - These tasks are managed by the backend's task system