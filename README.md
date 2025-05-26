# AlgoSuite - Security Assessment Platform

AlgoSuite is a comprehensive security assessment platform that helps organizations identify and manage their attack surfaces, assets, and security vulnerabilities.

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/riccardo-algorime/Algosuite_test_3.git
cd Algosuite_test_3

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api
```

### External Access Setup

If you need to access AlgoSuite from external devices (not localhost), use the automated setup script:

```bash
# Run the external access setup script
./scripts/setup-external-access.sh
```

This script will:
- Detect your server's IP address
- Configure the application for external access
- Update CORS settings
- Restart services with the new configuration

For manual configuration, see [External Access Setup Guide](docs/external-access-setup.md).

## 📋 Features

- **Project Management**: Create and manage security assessment projects
- **Attack Surface Mapping**: Define and analyze attack surfaces
- **Asset Discovery**: Identify and catalog digital assets
- **Security Assessment**: Comprehensive security evaluation tools
- **User Management**: Role-based access control
- **API Integration**: RESTful API for automation and integration

## 🏗️ Architecture

The application consists of:
- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL with pgvector extension
- **Cache**: Redis
- **Task Queue**: Celery with Redis broker

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DB_PASSWORD=your_secure_password

# Application Security
SECRET_KEY=your_secure_secret_key

# External Services
OPENAI_API_KEY=your_openai_api_key

# Network Configuration (for external access)
CORS_ORIGINS=http://your-server-ip:5173,http://localhost:5173
```

### External Access Configuration

For external access, the application automatically detects the appropriate API URL based on the current host. You can override this by setting:

```bash
# Frontend environment variable
VITE_API_BASE_URL=http://your-server-ip:8000/api
```

## 🐛 Troubleshooting

### Login Issues from External IP

If you experience "ERR_CONNECTION_REFUSED" errors when accessing from external devices:

1. **Use the setup script** (recommended):
   ```bash
   ./scripts/setup-external-access.sh
   ```

2. **Manual configuration**:
   - Ensure ports 5173 and 8000 are accessible
   - Check firewall settings
   - Verify CORS configuration
   - Use the API Debug component in the frontend

3. **Debug tools**:
   - Click "Debug API" button in the frontend (bottom-right corner)
   - Check browser console for API URL detection logs
   - Verify network connectivity with `curl http://your-server-ip:8000/api`

### Common Issues

- **Services not starting**: Check Docker logs with `docker-compose logs -f`
- **Database connection errors**: Verify PostgreSQL is running and accessible
- **API connectivity**: Use the built-in API debug component
- **CORS errors**: Update `CORS_ORIGINS` environment variable

## 📚 Documentation

- [External Access Setup Guide](docs/external-access-setup.md) - Detailed guide for external access configuration
- [API Documentation](http://localhost:8000/api/docs) - Swagger API documentation (when running)

## Database Optimization and Security Improvements

This section outlines the changes made to optimize and secure the database and related services in the Docker environment.

## Changes Made

### Database Service (PostgreSQL with pgvector)

1. **Security Improvements**:
    - Removed direct port exposure to host (now only accessible within Docker network)
    - Added support for environment variable password configuration
    - Added health checks to ensure service availability

2. **Optimization Improvements**:
    - Pinned PostgreSQL version for stability
    - Added performance tuning parameters:
        - Memory allocation (shared_buffers, work_mem)
        - Query optimization (random_page_cost, effective_io_concurrency)
        - Concurrency settings (max_connections, max_worker_processes)
        - Logging configuration (log_min_duration_statement)
    - Added resource limits to prevent excessive resource consumption

### Redis Service

1. **Security Improvements**:
    - Removed direct port exposure to host (now only accessible within Docker network)
    - Added health checks to ensure service availability

2. **Optimization Improvements**:
    - Pinned Redis version for stability
    - Added performance tuning parameters:
        - Memory management (maxmemory, maxmemory-policy)
        - Data persistence (appendonly, appendfsync)
        - RDB snapshot configuration (save)
    - Added resource limits to prevent excessive resource consumption

### Backend and Celery Worker Services

1. **Security Improvements**:
    - Updated to use environment variables for sensitive information
    - Added dependency conditions to ensure services start in the correct order

2. **Reliability Improvements**:
    - Added restart policies
    - Added resource limits to prevent excessive resource consumption

### Frontend Service

1. **Reliability Improvements**:
    - Added restart policy
    - Added dependency condition to ensure backend is available
    - Added resource limits to prevent excessive resource consumption

## Environment Variables

The following environment variables can be set to customize the deployment:

- `DB_PASSWORD`: PostgreSQL database password (default: "postgres")
- `SECRET_KEY`: Secret key for backend service (default: "development_secret_key")
- `OPENAI_API_KEY`: OpenAI API key (default: "sk-dummy-key-for-development-only")

## Usage

1. Create a `.env` file in the project root with your environment variables:
   ```
   DB_PASSWORD=your_secure_password
   SECRET_KEY=your_secure_secret_key
   OPENAI_API_KEY=your_openai_api_key
   ```

2. Start the services:
   ```
   docker-compose up -d
   ```

3. Monitor the services:
   ```
   docker-compose ps
   docker-compose logs -f
   ```

4. Test the database connection:
   ```
   # Install required packages if not already installed
   pip install sqlalchemy psycopg2-binary

   # Run the test script
   python test_db_connection.py
   ```

   The test script will attempt to connect to the database and verify that it's working correctly. It will also list the
   tables in the database to confirm that the schema is intact.

## Recommendations for Further Improvements

1. **Database Backups**: Implement regular database backups
2. **Connection Pooling**: Consider adding PgBouncer for connection pooling
3. **Monitoring**: Add monitoring tools like Prometheus and Grafana
4. **SSL**: Configure SSL for database connections
5. **Secrets Management**: Use Docker secrets or a dedicated secrets management solution
