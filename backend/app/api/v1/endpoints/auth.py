from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.core.config import settings
from app.schemas.token import Token
from app.schemas.user import User
from app.services.security import security_service
from app.services.user import user_service

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Authenticate user
    user = user_service.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user_service.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security_service.create_access_token(
        subject=user["id"], expires_delta=access_token_expires
    )

    # Create refresh token with longer expiry
    refresh_token_expires = timedelta(days=30)  # 30 days
    refresh_token = security_service.create_access_token(
        subject=user["id"], expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)) -> Any:
    """
    Refresh access token
    """
    try:
        # Decode refresh token
        payload = security_service.decode_token(refresh_token)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        user = user_service.get_by_id(db, user_id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user is active
        if not user_service.is_active(user):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user",
            )

        # Create new access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security_service.create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )

        # Create new refresh token
        refresh_token_expires = timedelta(days=30)  # 30 days
        new_refresh_token = security_service.create_access_token(
            subject=user.id, expires_delta=refresh_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "refresh_token": new_refresh_token,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate refresh token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout() -> Any:
    """
    Logout user

    Note: With JWT-based authentication, we don't need to invalidate tokens on the server.
    The client should simply remove the tokens from storage.
    For enhanced security, you could implement a token blacklist using Redis.
    """
    return {"detail": "Successfully logged out"}


@router.get("/me", response_model=User)
async def get_current_user(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user
    """
    return current_user
