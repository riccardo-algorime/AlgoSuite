from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.schemas.token import Token
from app.schemas.user import UserCreate
from app.services.keycloak import keycloak_service

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str


@router.post("", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest) -> Any:
    """
    Register a new user in Keycloak
    """
    try:
        # Split full name into first and last name
        name_parts = request.full_name.split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # Create user in Keycloak
        user_id = keycloak_service.create_user(
            email=request.email,
            username=request.email,  # Use email as username
            password=request.password,
            first_name=first_name,
            last_name=last_name,
            enabled=True,
            email_verified=True
        )
        
        return {"detail": "User registered successfully", "user_id": user_id}
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
