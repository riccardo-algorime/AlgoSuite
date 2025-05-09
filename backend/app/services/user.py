import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate, User
from app.services.security import security_service


# Default admin user for initial setup
DEFAULT_ADMIN = {
    "id": "test-user-id",
    "email": "admin@example.com",
    "password": "admin123",
    "full_name": "Admin User",
    "is_active": True,
    "is_superuser": True
}


class UserService:
    """
    Service for user management
    """

    def _model_to_dict(self, db_user: UserModel) -> Dict[str, Any]:
        """
        Convert SQLAlchemy model to dict
        """
        return {
            "id": db_user.id,
            "email": db_user.email,
            "hashed_password": db_user.hashed_password,
            "full_name": db_user.full_name,
            "is_active": db_user.is_active,
            "is_superuser": db_user.is_superuser,
            "created_at": db_user.created_at,
            "updated_at": db_user.updated_at
        }

    def get_by_id(self, db: Session, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a user by ID
        """
        # Check if user exists in the database
        db_user = db.query(UserModel).filter(UserModel.id == user_id).first()

        if db_user:
            # Convert SQLAlchemy model to dict
            return self._model_to_dict(db_user)

        # If user doesn't exist but has a valid token, create a placeholder user
        if user_id:
            # Generate user data
            email = f"user-{user_id[:8]}@example.com"
            hashed_password = security_service.get_password_hash("password123")
            full_name = f"User {user_id[:8]}"

            # Create a new user in the database
            db_user = UserModel(
                id=user_id,
                email=email,
                hashed_password=hashed_password,
                full_name=full_name,
                is_active=True,
                is_superuser=False
            )

            try:
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                print(f"Created new user in database: {user_id}")
                return self._model_to_dict(db_user)
            except Exception as e:
                db.rollback()
                print(f"Error creating user in database: {str(e)}")
                return None

        return None

    def get_by_email(self, db: Session, email: str) -> Optional[Dict[str, Any]]:
        """
        Get a user by email
        """
        # Check if user exists in the database
        db_user = db.query(UserModel).filter(UserModel.email == email).first()

        if db_user:
            return self._model_to_dict(db_user)

        # Special case for default admin user if not in database yet
        if email == DEFAULT_ADMIN["email"]:
            # Create the admin user in the database
            return self._ensure_admin_user(db)

        return None

    def _ensure_admin_user(self, db: Session) -> Dict[str, Any]:
        """
        Ensure the default admin user exists in the database
        """
        # Check if admin user already exists
        admin = db.query(UserModel).filter(UserModel.email == DEFAULT_ADMIN["email"]).first()
        if admin:
            return self._model_to_dict(admin)

        # Create admin user
        hashed_password = security_service.get_password_hash(DEFAULT_ADMIN["password"])
        admin_user = UserModel(
            id=DEFAULT_ADMIN["id"],
            email=DEFAULT_ADMIN["email"],
            hashed_password=hashed_password,
            full_name=DEFAULT_ADMIN["full_name"],
            is_active=DEFAULT_ADMIN["is_active"],
            is_superuser=DEFAULT_ADMIN["is_superuser"]
        )

        try:
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"Created default admin user in database")
            return self._model_to_dict(admin_user)
        except Exception as e:
            db.rollback()
            print(f"Error creating admin user in database: {str(e)}")
            # Return a mock admin user as fallback
            return {
                "id": DEFAULT_ADMIN["id"],
                "email": DEFAULT_ADMIN["email"],
                "hashed_password": hashed_password,
                "full_name": DEFAULT_ADMIN["full_name"],
                "is_active": DEFAULT_ADMIN["is_active"],
                "is_superuser": DEFAULT_ADMIN["is_superuser"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get all users with pagination
        """
        # Ensure admin user exists
        self._ensure_admin_user(db)

        # Get all users from database
        db_users = db.query(UserModel).offset(skip).limit(limit).all()
        return [self._model_to_dict(user) for user in db_users]

    def create(self, db: Session, user_in: UserCreate) -> Dict[str, Any]:
        """
        Create a new user
        """
        # Check if user with this email already exists
        existing_user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = security_service.get_password_hash(user_in.password)

        # Create user in database
        db_user = UserModel(
            id=user_id,
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            is_active=user_in.is_active if user_in.is_active is not None else True,
            is_superuser=user_in.is_superuser if user_in.is_superuser is not None else False
        )

        try:
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            print(f"Created new user in database: {user_id}")
            return self._model_to_dict(db_user)
        except Exception as e:
            db.rollback()
            print(f"Error creating user in database: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user: {str(e)}",
            )

    def update(self, db: Session, user_id: str, user_in: UserUpdate) -> Optional[Dict[str, Any]]:
        """
        Update a user
        """
        # Get user from database
        db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            return None

        # Update user fields
        update_data = user_in.model_dump(exclude_unset=True)

        # Hash password if it's being updated
        if "password" in update_data:
            hashed_password = security_service.get_password_hash(update_data["password"])
            db_user.hashed_password = hashed_password
            del update_data["password"]

        # Update user attributes
        for field, value in update_data.items():
            setattr(db_user, field, value)

        db_user.updated_at = datetime.utcnow()

        try:
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return self._model_to_dict(db_user)
        except Exception as e:
            db.rollback()
            print(f"Error updating user in database: {str(e)}")
            return None

    def authenticate(self, db: Session, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate a user
        """
        user = self.get_by_email(db, email=email)
        if not user:
            return None

        if not security_service.verify_password(password, user["hashed_password"]):
            return None

        return user

    def is_active(self, user: Dict[str, Any]) -> bool:
        """
        Check if user is active
        """
        return user["is_active"]

    def is_superuser(self, user: Dict[str, Any]) -> bool:
        """
        Check if user is a superuser
        """
        return user["is_superuser"]


# Create a singleton instance
user_service = UserService()
