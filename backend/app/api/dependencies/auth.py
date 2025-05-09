from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from pydantic import ValidationError

from app.api.dependencies.db import get_db
from app.core.config import settings
from app.models.user import User as UserModel
from app.schemas.user import User
from app.schemas.token import TokenPayload
from app.services.security import security_service
from app.services.user import user_service

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_PREFIX}{settings.API_V1_STR}/auth/login"
)


async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Validate access token and return current user
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT token
        payload = security_service.decode_token(token)
        token_data = TokenPayload(sub=payload.get("sub"), exp=payload.get("exp"))

        if token_data.sub is None:
            raise credentials_exception

        # Get user from database
        user = user_service.get_by_id(db, user_id=token_data.sub)
        if user is None:
            raise credentials_exception

        # Convert to Pydantic model
        return User(
            id=user["id"],
            email=user["email"],
            is_active=user["is_active"],
            is_superuser=user["is_superuser"],
            full_name=user["full_name"]
        )
    except (JWTError, ValidationError):
        raise credentials_exception


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Check if current user is active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )
    return current_user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Check if current user is a superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user
