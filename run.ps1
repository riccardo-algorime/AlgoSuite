# PowerShell script equivalent to run.sh

# Colors for terminal output
$GREEN = [System.ConsoleColor]::Green
$YELLOW = [System.ConsoleColor]::Yellow
$RED = [System.ConsoleColor]::Red
$BLUE = [System.ConsoleColor]::Blue

# Function to display help message
function Show-Help {
    Write-Host "algosuite_test_3 Runner Script" -ForegroundColor $BLUE
    Write-Host "This script helps you run algosuite_test_3 components individually or all at once."
    Write-Host
    Write-Host "Usage: .\run.ps1 [OPTION]"
    Write-Host
    Write-Host "Options:"
    Write-Host "  all" -ForegroundColor $GREEN -NoNewline; Write-Host "             Start all components using docker-compose"
    Write-Host "  backend" -ForegroundColor $GREEN -NoNewline; Write-Host "         Start only the backend service"
    Write-Host "  frontend" -ForegroundColor $GREEN -NoNewline; Write-Host "        Start only the frontend service"
    Write-Host "  db" -ForegroundColor $GREEN -NoNewline; Write-Host "              Start only the database service"
    Write-Host "  redis" -ForegroundColor $GREEN -NoNewline; Write-Host "           Start only the Redis service"
    Write-Host "  setup-auth" -ForegroundColor $GREEN -NoNewline; Write-Host "     Set up database with test users"
    Write-Host "  celery" -ForegroundColor $GREEN -NoNewline; Write-Host "          Start only the Celery worker"
    Write-Host "  dev" -ForegroundColor $GREEN -NoNewline; Write-Host "             Start backend and frontend in development mode (without Docker)"
    Write-Host "  status" -ForegroundColor $GREEN -NoNewline; Write-Host "          Check the status of all services"
    Write-Host "  stop" -ForegroundColor $GREEN -NoNewline; Write-Host "            Stop all running services"
    Write-Host "  list" -ForegroundColor $GREEN -NoNewline; Write-Host "            List all available components"
    Write-Host "  help" -ForegroundColor $GREEN -NoNewline; Write-Host "            Display this help message"
    Write-Host
    Write-Host "Examples:"
    Write-Host "  .\run.ps1 all         # Start all services"
    Write-Host "  .\run.ps1 backend     # Start only the backend"
    Write-Host "  .\run.ps1 dev         # Start backend and frontend in development mode"
    Write-Host "  .\run.ps1 stop        # Stop all services"
}

# Function to list all components
function List-Components {
    Write-Host "algosuite_test_3 Components:" -ForegroundColor $BLUE
    Write-Host "  Backend (FastAPI)" -ForegroundColor $GREEN
    Write-Host "    - API server for AlgoSuite"
    Write-Host "    - Runs on port 8000"
    Write-Host "    - API documentation available at http://localhost:8000/api/docs"
    Write-Host
    Write-Host "  Frontend (React + TypeScript)" -ForegroundColor $GREEN
    Write-Host "    - Web interface for AlgoSuite"
    Write-Host "    - Runs on port 5173"
    Write-Host "    - Available at http://localhost:5173"
    Write-Host
    Write-Host "  Database (PostgreSQL + pgvector)" -ForegroundColor $GREEN
    Write-Host "    - Stores application data"
    Write-Host "    - Runs on port 5432"
    Write-Host
    Write-Host "  Redis" -ForegroundColor $GREEN
    Write-Host "    - Used for caching and as message broker for Celery"
    Write-Host "    - Runs on port 6379"
    Write-Host
    Write-Host "  Celery Worker" -ForegroundColor $GREEN
    Write-Host "    - Handles background tasks"
    Write-Host
    Write-Host "  Authentication" -ForegroundColor $GREEN
    Write-Host "    - Authentication is now handled directly by the backend"
    Write-Host "    - Uses PostgreSQL database for user management"
    Write-Host "    - Default admin user: admin@example.com / admin123"
}

# Function to check service status
function Check-Status {
    Write-Host "Checking service status..." -ForegroundColor $BLUE

    # Check Docker services
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Write-Host "Docker services:" -ForegroundColor $YELLOW
        docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}" | Select-String -Pattern 'algosuite_test_3|backend|frontend|db|redis|keycloak|celery'
    } else {
        Write-Host "Docker not found. Cannot check Docker service status." -ForegroundColor $RED
    }

    # Check if backend is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "Backend:" -ForegroundColor $GREEN -NoNewline; Write-Host " Running on port 8000"
        } else {
            Write-Host "Backend:" -ForegroundColor $RED -NoNewline; Write-Host " Not running"
        }
    } catch {
        Write-Host "Backend:" -ForegroundColor $RED -NoNewline; Write-Host " Not running"
    }

    # Check if frontend is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "Frontend:" -ForegroundColor $GREEN -NoNewline; Write-Host " Running on port 5173"
        } else {
            Write-Host "Frontend:" -ForegroundColor $RED -NoNewline; Write-Host " Not running"
        }
    } catch {
        Write-Host "Frontend:" -ForegroundColor $RED -NoNewline; Write-Host " Not running"
    }

    # Check if database is running
    try {
        $result = docker exec algosuite_test_3-db-1 psql -U postgres -c "SELECT 1" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database:" -ForegroundColor $GREEN -NoNewline; Write-Host " Running on port 5432"
        } else {
            Write-Host "Database:" -ForegroundColor $RED -NoNewline; Write-Host " Not running"
        }
    } catch {
        Write-Host "Database:" -ForegroundColor $RED -NoNewline; Write-Host " Not running"
    }

    # Check if Redis is running
    try {
        $result = docker exec algosuite_test_3-redis-1 redis-cli ping 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Redis:" -ForegroundColor $GREEN -NoNewline; Write-Host " Running on port 6379"
        } else {
            Write-Host "Redis:" -ForegroundColor $RED -NoNewline; Write-Host " Not running"
        }
    } catch {
        Write-Host "Redis:" -ForegroundColor $RED -NoNewline; Write-Host " Not running"
    }

    # Authentication is now handled by the backend, no need to check Keycloak
}

# Function to start all services using docker-compose
function Start-All {
    Write-Host "Starting all algosuite_test_3 services..." -ForegroundColor $BLUE

    # Start the database first
    docker-compose up -d db

    # Wait a moment for the database to be ready
    Start-Sleep -Seconds 5

    # Start the remaining services
    docker-compose up -d

    # Set up authentication with test users
    Write-Host "Setting up authentication with test users..." -ForegroundColor $YELLOW
    Setup-Auth

    Write-Host "All services started successfully!" -ForegroundColor $GREEN
    Write-Host "Frontend: http://localhost:5173"
    Write-Host "Backend API: http://localhost:8000/api"
    Write-Host "API Documentation: http://localhost:8000/api/docs"
    Write-Host "Test Users:"
    Write-Host "  - Regular User: email='test@example.com', password='password123'"
    Write-Host "  - Admin User: email='admin@example.com', password='admin123'"
}

# Function to start only the backend service
function Start-Backend {
    Write-Host "Starting backend service..." -ForegroundColor $BLUE
    docker-compose up -d backend
    Write-Host "Backend service started successfully!" -ForegroundColor $GREEN
    Write-Host "API: http://localhost:8000/api"
    Write-Host "API Documentation: http://localhost:8000/api/docs"
}

# Function to start only the frontend service
function Start-Frontend {
    Write-Host "Starting frontend service..." -ForegroundColor $BLUE
    docker-compose up -d frontend
    Write-Host "Frontend service started successfully!" -ForegroundColor $GREEN
    Write-Host "Frontend: http://localhost:5173"
}

# Function to start only the database service
function Start-DB {
    Write-Host "Starting database service..." -ForegroundColor $BLUE
    docker-compose up -d db
    Write-Host "Database service started successfully!" -ForegroundColor $GREEN
    Write-Host "PostgreSQL running on port 5432"
}

# Function to start only the Redis service
function Start-Redis {
    Write-Host "Starting Redis service..." -ForegroundColor $BLUE
    docker-compose up -d redis
    Write-Host "Redis service started successfully!" -ForegroundColor $GREEN
    Write-Host "Redis running on port 6379"
}

# Function to set up authentication with test users
function Setup-Auth {
    Write-Host "Setting up authentication with test users..." -ForegroundColor $BLUE

    # Start the database first if it's not already running
    $dbRunning = docker ps | Select-String -Pattern "algosuite_test_3-db-1"
    if (-not $dbRunning) {
        Write-Host "Starting database service first..." -ForegroundColor $YELLOW
        docker-compose up -d db
        Start-Sleep -Seconds 5
    }

    # Run the authentication setup script
    Write-Host "Running authentication setup script..." -ForegroundColor $YELLOW
    try {
        docker exec -it algosuite_test_3-backend-1 python scripts/setup_auth.py
    } catch {
        Write-Host "Setup script not found or failed. Using default users." -ForegroundColor $YELLOW
    }

    Write-Host "Authentication setup completed!" -ForegroundColor $GREEN
}

# Function to start only the Celery worker
function Start-Celery {
    Write-Host "Starting Celery worker..." -ForegroundColor $BLUE
    docker-compose up -d celery_worker
    Write-Host "Celery worker started successfully!" -ForegroundColor $GREEN
}

# Function to start backend and frontend in development mode (without Docker)
function Start-Dev {
    Write-Host "Starting services in development mode..." -ForegroundColor $BLUE

    # Start database and Redis with Docker
    Write-Host "Starting database and Redis with Docker..." -ForegroundColor $YELLOW
    docker-compose up -d db redis

    # Start backend in a new terminal
    Write-Host "Starting backend..." -ForegroundColor $YELLOW
    $backendJob = Start-Job -ScriptBlock {
        Set-Location backend
        & .\.venv\Scripts\Activate.ps1
        python main.py
    }

    # Start frontend in a new terminal
    Write-Host "Starting frontend..." -ForegroundColor $YELLOW
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location algosuite
        npm run dev
    }

    Write-Host "Development environment started!" -ForegroundColor $GREEN
    Write-Host "Backend: http://localhost:8000/api"
    Write-Host "Frontend: http://localhost:5173"
    Write-Host "Press Ctrl+C to stop all services"

    # Wait for user to press Ctrl+C
    try {
        Wait-Job -Job $backendJob, $frontendJob
    } finally {
        Stop-Job -Job $backendJob, $frontendJob
        Remove-Job -Job $backendJob, $frontendJob -Force
        Write-Host "Stopping development services..." -ForegroundColor $RED
    }
}

# Function to stop all services
function Stop-All {
    Write-Host "Stopping all services..." -ForegroundColor $BLUE
    docker-compose down
    Write-Host "All services stopped successfully!" -ForegroundColor $GREEN
}

# Main script logic
$command = $args[0]

switch ($command) {
    "all" { Start-All }
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    "db" { Start-DB }
    "redis" { Start-Redis }
    "setup-auth" { Setup-Auth }
    "celery" { Start-Celery }
    "dev" { Start-Dev }
    "status" { Check-Status }
    "stop" { Stop-All }
    "list" { List-Components }
    "help" { Show-Help }
    default {
        Write-Host "Invalid option: $command" -ForegroundColor $RED
        Write-Host "Use '.\run.ps1 help' to see available options"
        exit 1
    }
}

exit 0