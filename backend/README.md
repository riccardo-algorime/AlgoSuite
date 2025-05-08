# AlgoSuite Backend

This is the backend API for AlgoSuite, a penetration testing suite built with FastAPI.

## Features

- FastAPI framework with async support
- PostgreSQL database with pgvector for vector storage
- SQLAlchemy ORM with Alembic migrations
- Pydantic for data validation
- Celery for background tasks
- Keycloak integration for authentication
- LangChain for AI capabilities
- Docker and Docker Compose for containerization

## Project Structure

```
backend/
├── alembic/                  # Database migrations
├── app/                      # Application code
│   ├── api/                  # API endpoints
│   │   ├── dependencies/     # API dependencies
│   │   ├── endpoints/        # API endpoint modules
│   │   └── v1/               # API v1 router
│   ├── core/                 # Core modules
│   ├── db/                   # Database utilities
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Business logic
│   ├── tasks/                # Celery tasks
│   └── utils/                # Utility functions
├── tests/                    # Tests
│   ├── api/                  # API tests
│   ├── integration/          # Integration tests
│   └── unit/                 # Unit tests
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore file
├── alembic.ini               # Alembic configuration
├── Dockerfile                # Docker configuration
├── main.py                   # Application entry point
└── requirements.txt          # Python dependencies
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.11+

### Installation

1. Clone the repository
2. Create a `.env` file from `.env.example`
3. Install dependencies using the setup script:

```bash
# Navigate to the backend directory
cd backend

# Run the setup script
./setup_dev_env.sh

# Activate the virtual environment
source venv/bin/activate
```

Alternatively, you can install dependencies manually:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Ensure python-keycloak is installed with the correct version
pip install python-keycloak==3.5.0
```

### Running the Application

#### Using Docker

```bash
docker-compose up -d
```

#### Without Docker

1. Start a PostgreSQL database
2. Start a Redis instance
3. Run the application:

```bash
uvicorn app.app:app --reload
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head
```

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Testing

```bash
pytest
```
