from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.dependencies.db import get_db
from app.schemas.health import HealthCheck

router = APIRouter()


@router.get("", response_model=HealthCheck)
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint to verify API and database connection
    """
    # Check database connection
    db_status = True
    try:
        # Execute a simple query
        db.execute(text("SELECT 1"))
    except Exception as e:
        print(f"Database connection error: {e}")
        db_status = False

    return {
        "status": "ok",
        "api_version": "v1",
        "database_connected": db_status
    }
