#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display help message
show_help() {
    echo -e "${BLUE}algosuite_test_3 Runner Script${NC}"
    echo -e "This script helps you run algosuite_test_3 components individually or all at once."
    echo
    echo -e "Usage: ./run.sh [OPTION]"
    echo
    echo -e "Options:"
    echo -e "  ${GREEN}all${NC}             Start all components using docker-compose"
    echo -e "  ${GREEN}backend${NC}         Start only the backend service"
    echo -e "  ${GREEN}frontend${NC}        Start only the frontend service"
    echo -e "  ${GREEN}db${NC}              Start only the database service"
    echo -e "  ${GREEN}redis${NC}           Start only the Redis service"
    echo -e "  ${GREEN}keycloak${NC}        Start only the Keycloak service"
    echo -e "  ${GREEN}setup-auth${NC}     Set up Keycloak realm, clients, and test users"
    echo -e "  ${GREEN}celery${NC}          Start only the Celery worker"
    echo -e "  ${GREEN}dev${NC}             Start backend and frontend in development mode (without Docker)"
    echo -e "  ${GREEN}status${NC}          Check the status of all services"
    echo -e "  ${GREEN}stop${NC}            Stop all running services"
    echo -e "  ${GREEN}list${NC}            List all available components"
    echo -e "  ${GREEN}help${NC}            Display this help message"
    echo
    echo -e "Examples:"
    echo -e "  ./run.sh all         # Start all services"
    echo -e "  ./run.sh backend     # Start only the backend"
    echo -e "  ./run.sh dev         # Start backend and frontend in development mode"
    echo -e "  ./run.sh stop        # Stop all services"
}

# Function to list all components
list_components() {
    echo -e "${BLUE}algosuite_test_3 Components:${NC}"
    echo -e "  ${GREEN}Backend (FastAPI)${NC}"
    echo -e "    - API server for AlgoSuite"
    echo -e "    - Runs on port 8000"
    echo -e "    - API documentation available at http://localhost:8000/api/docs"
    echo
    echo -e "  ${GREEN}Frontend (React + TypeScript)${NC}"
    echo -e "    - Web interface for AlgoSuite"
    echo -e "    - Runs on port 5173"
    echo -e "    - Available at http://localhost:5173"
    echo
    echo -e "  ${GREEN}Database (PostgreSQL + pgvector)${NC}"
    echo -e "    - Stores application data"
    echo -e "    - Runs on port 5432"
    echo
    echo -e "  ${GREEN}Redis${NC}"
    echo -e "    - Used for caching and as message broker for Celery"
    echo -e "    - Runs on port 6379"
    echo
    echo -e "  ${GREEN}Celery Worker${NC}"
    echo -e "    - Handles background tasks"
    echo
    echo -e "  ${GREEN}Keycloak${NC}"
    echo -e "    - Authentication and authorization server"
    echo -e "    - Runs on port 8080"
    echo -e "    - Admin console available at http://localhost:8080/admin"
    echo -e "    - Default admin credentials: admin/admin"
}

# Function to check service status
check_status() {
    echo -e "${BLUE}Checking service status...${NC}"

    # Check Docker services
    if command -v docker &> /dev/null; then
        echo -e "${YELLOW}Docker services:${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E 'algosuite_test_3|backend|frontend|db|redis|keycloak|celery'
    else
        echo -e "${RED}Docker not found. Cannot check Docker service status.${NC}"
    fi

    # Check if backend is running (using curl instead of lsof)
    if curl -s http://localhost:8000/api/health > /dev/null; then
        echo -e "${GREEN}Backend:${NC} Running on port 8000"
    else
        echo -e "${RED}Backend:${NC} Not running"
    fi

    # Check if frontend is running (using curl instead of lsof)
    if curl -s http://localhost:5173 > /dev/null; then
        echo -e "${GREEN}Frontend:${NC} Running on port 5173"
    else
        echo -e "${RED}Frontend:${NC} Not running"
    fi

    # Check if database is running (using docker exec instead of lsof)
    if docker exec algosuite_test_3-db-1 psql -U postgres -c "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}Database:${NC} Running on port 5432"
    else
        echo -e "${RED}Database:${NC} Not running"
    fi

    # Check if Redis is running (using docker exec instead of lsof)
    if docker exec algosuite_test_3-redis-1 redis-cli ping &> /dev/null; then
        echo -e "${GREEN}Redis:${NC} Running on port 6379"
    else
        echo -e "${RED}Redis:${NC} Not running"
    fi

    # Check if Keycloak is running (using curl instead of lsof)
    if curl -s http://localhost:8080 > /dev/null; then
        echo -e "${GREEN}Keycloak:${NC} Running on port 8080"
    else
        echo -e "${RED}Keycloak:${NC} Not running"
    fi
}

# Function to start all services using docker-compose
start_all() {
    echo -e "${BLUE}Starting all algosuite_test_3 services...${NC}"

    # Start the database first
    docker-compose up -d db

    # Wait a moment for the database to be ready
    sleep 5

    # Create the keycloak database if it doesn't exist
    echo -e "${YELLOW}Ensuring keycloak database exists...${NC}"
    docker exec algosuite_test_3-db-1 psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'keycloak'" | grep -q 1 || \
    docker exec algosuite_test_3-db-1 psql -U postgres -c "CREATE DATABASE keycloak;"

    # Start the remaining services
    docker-compose up -d

    # Set up Keycloak realm and clients
    echo -e "${YELLOW}Setting up Keycloak realm and clients...${NC}"
    setup_keycloak

    echo -e "${GREEN}All services started successfully!${NC}"
    echo -e "Frontend: http://localhost:5173"
    echo -e "Backend API: http://localhost:8000/api"
    echo -e "API Documentation: http://localhost:8000/api/docs"
    echo -e "Keycloak Admin: http://localhost:8080/admin (admin/admin)"
    echo -e "Test Users:"
    echo -e "  - Regular User: username='test', password='password'"
    echo -e "  - Admin User: username='admin', password='admin'"
}

# Function to start only the backend service
start_backend() {
    echo -e "${BLUE}Starting backend service...${NC}"
    docker-compose up -d backend
    echo -e "${GREEN}Backend service started successfully!${NC}"
    echo -e "API: http://localhost:8000/api"
    echo -e "API Documentation: http://localhost:8000/api/docs"
}

# Function to start only the frontend service
start_frontend() {
    echo -e "${BLUE}Starting frontend service...${NC}"
    docker-compose up -d frontend
    echo -e "${GREEN}Frontend service started successfully!${NC}"
    echo -e "Frontend: http://localhost:5173"
}

# Function to start only the database service
start_db() {
    echo -e "${BLUE}Starting database service...${NC}"
    docker-compose up -d db
    echo -e "${GREEN}Database service started successfully!${NC}"
    echo -e "PostgreSQL running on port 5432"
}

# Function to start only the Redis service
start_redis() {
    echo -e "${BLUE}Starting Redis service...${NC}"
    docker-compose up -d redis
    echo -e "${GREEN}Redis service started successfully!${NC}"
    echo -e "Redis running on port 6379"
}

# Function to start only the Keycloak service
start_keycloak() {
    echo -e "${BLUE}Starting Keycloak service...${NC}"

    # Start the database first if it's not already running
    if ! docker ps | grep -q algosuite_test_3-db-1; then
        echo -e "${YELLOW}Starting database service first...${NC}"
        docker-compose up -d db
        sleep 5
    fi

    # Create the keycloak database if it doesn't exist
    echo -e "${YELLOW}Ensuring keycloak database exists...${NC}"
    docker exec algosuite_test_3-db-1 psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'keycloak'" | grep -q 1 || \
    docker exec algosuite_test_3-db-1 psql -U postgres -c "CREATE DATABASE keycloak;"

    # Start Keycloak
    docker-compose up -d keycloak

    echo -e "${GREEN}Keycloak service started successfully!${NC}"
    echo -e "Keycloak Admin: http://localhost:8080/admin (admin/admin)"
}

# Function to set up Keycloak realm and clients
setup_keycloak() {
    echo -e "${BLUE}Setting up Keycloak realm and clients...${NC}"

    # Check if Keycloak is running
    if ! curl -s http://localhost:8080 > /dev/null; then
        echo -e "${YELLOW}Keycloak is not running. Starting Keycloak...${NC}"
        start_keycloak

        # Wait for Keycloak to be ready
        echo -e "${YELLOW}Waiting for Keycloak to be ready...${NC}"
        for i in {1..150}; do
            if curl -s http://localhost:8080 > /dev/null; then
                echo -e "${GREEN}Keycloak is ready!${NC}"
                break
            fi
            echo -n "."
            sleep 2
            if [ $i -eq 150 ]; then
                echo -e "${RED}Timed out waiting for Keycloak to start.${NC}"
                exit 1
            fi
        done
    fi

    # Run the Keycloak setup script
    echo -e "${YELLOW}Running Keycloak setup script...${NC}"
    python scripts/setup_keycloak.py

    echo -e "${GREEN}Keycloak setup completed!${NC}"
}

# Function to start only the Celery worker
start_celery() {
    echo -e "${BLUE}Starting Celery worker...${NC}"
    docker-compose up -d celery_worker
    echo -e "${GREEN}Celery worker started successfully!${NC}"
}

# Function to start backend and frontend in development mode (without Docker)
start_dev() {
    echo -e "${BLUE}Starting services in development mode...${NC}"

    # Start database and Redis with Docker
    echo -e "${YELLOW}Starting database and Redis with Docker...${NC}"
    docker-compose up -d db redis

    # Start backend in a new terminal
    echo -e "${YELLOW}Starting backend...${NC}"
    cd backend && source .venv/bin/activate && python main.py &
    BACKEND_PID=$!

    # Start frontend in a new terminal
    echo -e "${YELLOW}Starting frontend...${NC}"
    cd algosuite && npm run dev &
    FRONTEND_PID=$!

    echo -e "${GREEN}Development environment started!${NC}"
    echo -e "Backend: http://localhost:8000/api"
    echo -e "Frontend: http://localhost:5173"
    echo -e "Press Ctrl+C to stop all services"

    # Wait for user to press Ctrl+C
    trap "kill $BACKEND_PID $FRONTEND_PID; echo -e '${RED}Stopping development services...${NC}'; exit" INT
    wait
}

# Function to stop all services
stop_all() {
    echo -e "${BLUE}Stopping all services...${NC}"
    docker-compose down
    echo -e "${GREEN}All services stopped successfully!${NC}"
}

# Main script logic
case "$1" in
    all)
        start_all
        ;;
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    db)
        start_db
        ;;
    redis)
        start_redis
        ;;
    keycloak)
        start_keycloak
        ;;
    setup-auth)
        setup_keycloak
        ;;
    celery)
        start_celery
        ;;
    dev)
        start_dev
        ;;
    status)
        check_status
        ;;
    stop)
        stop_all
        ;;
    list)
        list_components
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Invalid option: $1${NC}"
        echo -e "Use './run.sh help' to see available options"
        exit 1
        ;;
esac

exit 0
