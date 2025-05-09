from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_active_user, get_current_active_superuser
from app.api.dependencies.db import get_db
from app.models.user import User as UserModel
from app.schemas.user import User, UserCreate, UserUpdate
from app.services.user import user_service
from app.services.security import security_service

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
    # Only superusers can list all users
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    users = user_service.get_all(db, skip=skip, limit=limit)
    return [
        User(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            is_active=user["is_active"],
            is_superuser=user["is_superuser"]
        )
        for user in users
    ]


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """
    Create new user (superuser only)
    """
    # Only superusers can create users through this endpoint
    user = user_service.create(db, user_in)
    return User(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        is_active=user["is_active"],
        is_superuser=user["is_superuser"]
    )


@router.get("/me", response_model=User)
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    """
    Get current user
    """
    return current_user


@router.post("/ensure-in-db", response_model=User)
async def ensure_user_in_db(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Ensure the current user exists in the database
    """
    # Check if user exists in the database
    db_user = db.query(UserModel).filter(UserModel.id == current_user.id).first()

    # If user doesn't exist, create it
    if not db_user:
        print(f"Creating user {current_user.id} in database...")
        db_user = UserModel(
            id=current_user.id,
            email=current_user.email,
            hashed_password=security_service.get_password_hash("password123"),
            full_name=current_user.full_name or f"User {current_user.id[:8]}",
            is_active=current_user.is_active,
            is_superuser=current_user.is_superuser
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"User {db_user.id} created successfully")
    else:
        print(f"User {db_user.id} already exists in database")

    return current_user


@router.put("/me", response_model=User)
async def update_current_user(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update current user
    """
    user = user_service.update(db, user_id=current_user.id, user_in=user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return User(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        is_active=user["is_active"],
        is_superuser=user["is_superuser"]
    )


@router.get("/{user_id}", response_model=User)
async def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific user by id
    """
    # Users can only access their own data unless they are superusers
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    user = user_service.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return User(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        is_active=user["is_active"],
        is_superuser=user["is_superuser"]
    )
