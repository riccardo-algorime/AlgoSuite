# External Access Setup Guide

This guide explains how to configure AlgoSuite for access from external IP addresses, resolving the "ERR_CONNECTION_REFUSED" login issues.

## Problem Description

When accessing AlgoSuite from an external IP address (not localhost), login fails with:
- "Failed to fetch" error
- "ERR_CONNECTION_REFUSED" message
- Console errors showing attempts to connect to "localhost:8000"

## Root Cause

The frontend was hardcoded to use `localhost:8000` for API calls, which only works when accessing from the same machine.

## Solution Overview

The application now includes:
1. **Dynamic API URL detection** based on the current host
2. **Flexible environment configuration** for different deployment scenarios
3. **Enhanced CORS configuration** for external access
4. **Improved Docker configuration** for network accessibility

## Configuration Options

### Option 1: Automatic Detection (Recommended)

The application automatically detects the API URL based on the current host:
- If accessing via `localhost` or `127.0.0.1` → uses `http://localhost:8000/api`
- If accessing via external IP → uses `http://[external-ip]:8000/api`

No configuration needed - this works out of the box.

### Option 2: Manual Configuration

Set the `VITE_API_BASE_URL` environment variable to override automatic detection:

#### For Development (.env.development)
```bash
# Set this to your server's IP or domain
VITE_API_BASE_URL=http://192.168.1.100:8000/api
# or
VITE_API_BASE_URL=http://your-domain.com:8000/api
```

#### For Production (.env.production)
```bash
VITE_API_BASE_URL=https://api.your-domain.com/api
```

#### For Docker Compose
```yaml
services:
  frontend:
    environment:
      - VITE_API_BASE_URL=http://your-server-ip:8000/api
```

## Deployment Instructions

### 1. Using Docker Compose (Recommended)

```bash
# Start the application
docker-compose up -d

# The application will be accessible at:
# - Frontend: http://your-server-ip:5173
# - Backend API: http://your-server-ip:8000/api
```

### 2. Manual Deployment

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend
```bash
cd algosuite
npm install

# For development
npm run dev

# For production
npm run build
npm run preview
```

## Network Configuration

### Firewall Rules

Ensure the following ports are open:
- **5173**: Frontend application
- **8000**: Backend API

### Docker Network

The application uses Docker's default bridge network. Both services are configured to bind to `0.0.0.0` to accept external connections.

## Troubleshooting

### 1. Check API URL Detection

Open browser console and look for "Auth initialization" log:
```javascript
{
  hasToken: false,
  hasRefreshToken: false,
  hasUser: false,
  apiBaseUrl: "http://192.168.1.100:8000/api",  // Should match your setup
  hostInfo: {
    protocol: "http:",
    hostname: "192.168.1.100",
    port: "5173"
  }
}
```

### 2. Verify Backend Accessibility

Test the backend directly:
```bash
curl http://your-server-ip:8000/api/v1/auth/login
```

### 3. Check CORS Configuration

If you see CORS errors, verify the `CORS_ORIGINS` environment variable includes your frontend URL:
```bash
export CORS_ORIGINS="http://your-server-ip:5173,http://localhost:5173"
```

### 4. Network Connectivity

Ensure both frontend and backend containers can communicate:
```bash
# Check if backend is accessible from frontend container
docker exec -it algosuite_test_3-frontend-1 curl http://backend:8000/api/health
```

## Security Considerations

### Development
- CORS allows all origins in development mode
- Use HTTP for local development

### Production
- Configure specific allowed origins in `CORS_ORIGINS`
- Use HTTPS with proper SSL certificates
- Consider using a reverse proxy (nginx, Apache)
- Implement proper firewall rules

## Environment Variables Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | Frontend API base URL | Auto-detected | `http://192.168.1.100:8000/api` |
| `CORS_ORIGINS` | Backend allowed origins | `http://localhost:5173` | `http://192.168.1.100:5173` |
| `NODE_ENV` | Environment mode | `development` | `production` |

## Testing External Access

1. **Find your server's IP address:**
   ```bash
   ip addr show
   # or
   hostname -I
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access from external device:**
   - Open browser on another device
   - Navigate to `http://[server-ip]:5173`
   - Try logging in

4. **Verify in browser console:**
   - Check for "Login attempt to:" log showing correct API URL
   - Ensure no "localhost" references in API calls
