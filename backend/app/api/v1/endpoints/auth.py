from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.token import Token
from app.schemas.user import User
from app.services.keycloak import keycloak_service

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    token_data = keycloak_service.get_token(
        form_data.username,
        form_data.password,
        client_id=form_data.client_id
    )

    return {
        "access_token": token_data["access_token"],
        "token_type": "bearer",
        "refresh_token": token_data.get("refresh_token", ""),
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str) -> Any:
    """
    Refresh access token
    """
    token_data = keycloak_service.refresh_token(refresh_token)

    return {
        "access_token": token_data["access_token"],
        "token_type": "bearer",
        "refresh_token": token_data.get("refresh_token", ""),
    }


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(refresh_token: str) -> Any:
    """
    Logout user
    """
    keycloak_service.logout(refresh_token)
    return {"detail": "Successfully logged out"}


@router.get("/me", response_model=User)
async def get_current_user(current_user: User = Depends(keycloak_service.get_current_user)) -> Any:
    """
    Get current user
    """
    return current_user
