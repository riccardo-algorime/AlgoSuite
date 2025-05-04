from fastapi import APIRouter

from app.api.v1.endpoints import health, users, scans, auth, register
from app.core.config import settings

api_router = APIRouter(prefix=settings.API_V1_STR)

# Include routers from endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(register.router, prefix="/register", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
