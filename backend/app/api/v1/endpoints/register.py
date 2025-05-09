from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.dependencies.db import get_db
from app.schemas.token import Token
from app.schemas.user import UserCreate, User
from app.services.user import user_service

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)) -> Any:
    """
    Register a new user
    """
    try:
        # Create user in database
        user_create = UserCreate(
            email=request.email,
            full_name=request.full_name,
            password=request.password,
            is_active=True,
            is_superuser=False
        )

        user = user_service.create(db, user_create)

        # Return user data
        return User(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            is_active=user["is_active"],
            is_superuser=user["is_superuser"]
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        if "already exists" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )
