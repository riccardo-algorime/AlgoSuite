from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.db import get_db
from app.schemas.user import User, UserCreate, UserUpdate

router = APIRouter()


@router.get("", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get list of users
    """
    # This is a placeholder - actual implementation would use a service
    return []


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create new user
    """
    # This is a placeholder - actual implementation would use a service
    return {
        "id": "placeholder-id",
        "email": user_in.email,
        "is_active": True,
        "is_superuser": False,
    }


@router.get("/me", response_model=User)
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    """
    Get current user
    """
    return current_user


@router.get("/{user_id}", response_model=User)
async def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific user by id
    """
    # This is a placeholder - actual implementation would use a service
    return {
        "id": user_id,
        "email": "user@example.com",
        "is_active": True,
        "is_superuser": False,
    }
