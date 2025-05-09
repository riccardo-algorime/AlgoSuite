from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from jose import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.token import TokenPayload
from app.schemas.user import User

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SecurityService:
    """
    Service for security-related operations like password hashing and JWT token management
    """

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against a hash
        """
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """
        Hash a password
        """
        return pwd_context.hash(password)

    def create_access_token(
        self, subject: Union[str, Any], expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT access token
        """
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode = {"exp": expire, "sub": str(subject)}
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )
        return encoded_jwt

    def decode_token(self, token: str) -> Dict[str, Any]:
        """
        Decode and validate JWT token
        """
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            return payload
        except jwt.JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def create_user_response(self, user_id: str, email: str, is_active: bool, is_superuser: bool, full_name: str) -> User:
        """
        Create a User response object
        """
        return User(
            id=user_id,
            email=email,
            is_active=is_active,
            is_superuser=is_superuser,
            full_name=full_name
        )


# Create a singleton instance
security_service = SecurityService()
