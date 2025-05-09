#!/usr/bin/env python3
"""
Script to set up authentication with test users.

This script:
1. Creates test users in the database
2. Sets up roles and permissions

Usage:
    python setup_auth.py
"""

import os
import sys
import uuid
from datetime import datetime

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.services.security import security_service
    from app.db.session import SessionLocal
    from app.models.user import User
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're running this script from the backend directory")
    sys.exit(1)

# Test users to create
TEST_USERS = [
    {
        "email": "admin@example.com",
        "password": "admin123",
        "full_name": "Admin User",
        "is_active": True,
        "is_superuser": True
    },
    {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User",
        "is_active": True,
        "is_superuser": False
    }
]

def setup_users():
    """
    Set up test users in the database
    """
    print("Setting up test users...")
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Create each test user
        for user_data in TEST_USERS:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing_user:
                print(f"User {user_data['email']} already exists, skipping")
                continue
            
            # Hash the password
            hashed_password = security_service.get_password_hash(user_data["password"])
            
            # Create the user
            user = User(
                id=str(uuid.uuid4()),
                email=user_data["email"],
                hashed_password=hashed_password,
                full_name=user_data["full_name"],
                is_active=user_data["is_active"],
                is_superuser=user_data["is_superuser"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(user)
            print(f"Created user: {user_data['email']}")
        
        # Commit the changes
        db.commit()
        print("Test users created successfully")
    
    except Exception as e:
        db.rollback()
        print(f"Error creating test users: {e}")
    finally:
        db.close()

def main():
    """
    Main function
    """
    try:
        setup_users()
        print("Authentication setup completed successfully")
    except Exception as e:
        print(f"Error during authentication setup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
