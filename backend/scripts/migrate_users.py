#!/usr/bin/env python3
"""
Script to migrate users from Keycloak to PostgreSQL database.

This script:
1. Connects to Keycloak and retrieves all users
2. Connects to PostgreSQL and creates corresponding user records
3. Sets a default password for all migrated users (they'll need to reset it)

Usage:
    python migrate_users.py

Environment variables:
    DATABASE_URL: PostgreSQL connection string
    KEYCLOAK_URL: Keycloak server URL
    KEYCLOAK_REALM: Keycloak realm name
    KEYCLOAK_CLIENT_ID: Keycloak client ID
    KEYCLOAK_CLIENT_SECRET: Keycloak client secret
    KEYCLOAK_ADMIN_USERNAME: Keycloak admin username
    KEYCLOAK_ADMIN_PASSWORD: Keycloak admin password
"""

import os
import sys
import uuid
from datetime import datetime
import logging
from typing import List, Dict, Any

# Try different import paths for keycloak
try:
    from keycloak import KeycloakAdmin
except ImportError:
    try:
        from python_keycloak import KeycloakAdmin
    except ImportError:
        print("Could not import KeycloakAdmin. Please install either 'keycloak' or 'python-keycloak' package.")
        sys.exit(1)

import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Get environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
KEYCLOAK_ADMIN_USERNAME = os.getenv("KEYCLOAK_ADMIN_USERNAME")
KEYCLOAK_ADMIN_PASSWORD = os.getenv("KEYCLOAK_ADMIN_PASSWORD")

# Default password for migrated users (they should reset this)
DEFAULT_PASSWORD = "ChangeMe123!"
HASHED_DEFAULT_PASSWORD = pwd_context.hash(DEFAULT_PASSWORD)


def get_keycloak_users() -> List[Dict[str, Any]]:
    """
    Get all users from Keycloak
    """
    logger.info(f"Connecting to Keycloak at {KEYCLOAK_URL}")
    
    # Initialize Keycloak Admin client
    keycloak_admin = KeycloakAdmin(
        server_url=KEYCLOAK_URL,
        username=KEYCLOAK_ADMIN_USERNAME,
        password=KEYCLOAK_ADMIN_PASSWORD,
        realm_name=KEYCLOAK_REALM,
        verify=True
    )
    
    # Get all users
    users = keycloak_admin.get_users({})
    logger.info(f"Found {len(users)} users in Keycloak")
    
    return users


def migrate_users_to_db(users: List[Dict[str, Any]]) -> None:
    """
    Migrate users from Keycloak to PostgreSQL
    """
    logger.info(f"Connecting to PostgreSQL at {DATABASE_URL}")
    
    # Create SQLAlchemy engine and session
    engine = sa.create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Get user table metadata
    metadata = sa.MetaData()
    user_table = sa.Table('user', metadata, autoload_with=engine)
    
    # Count of migrated and skipped users
    migrated_count = 0
    skipped_count = 0
    
    try:
        # Process each user
        for user in users:
            # Check if user already exists in database
            existing_user = session.query(user_table).filter(
                user_table.c.email == user.get('email')
            ).first()
            
            if existing_user:
                logger.info(f"User {user.get('email')} already exists in database, skipping")
                skipped_count += 1
                continue
            
            # Get user attributes
            user_id = user.get('id')
            email = user.get('email')
            first_name = user.get('firstName', '')
            last_name = user.get('lastName', '')
            full_name = f"{first_name} {last_name}".strip()
            is_active = user.get('enabled', True)
            
            # Check for required fields
            if not email:
                logger.warning(f"User {user_id} has no email, skipping")
                skipped_count += 1
                continue
            
            # Insert user into database
            now = datetime.utcnow()
            session.execute(
                user_table.insert().values(
                    id=user_id,
                    email=email,
                    hashed_password=HASHED_DEFAULT_PASSWORD,
                    full_name=full_name,
                    is_active=is_active,
                    is_superuser=False,  # Default to non-superuser
                    created_at=now,
                    updated_at=now
                )
            )
            
            logger.info(f"Migrated user {email}")
            migrated_count += 1
        
        # Commit all changes
        session.commit()
        logger.info(f"Migration complete: {migrated_count} users migrated, {skipped_count} users skipped")
    
    except Exception as e:
        session.rollback()
        logger.error(f"Error during migration: {str(e)}")
        raise
    finally:
        session.close()


def main():
    """
    Main function
    """
    # Check environment variables
    if not all([DATABASE_URL, KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_ADMIN_USERNAME, KEYCLOAK_ADMIN_PASSWORD]):
        logger.error("Missing required environment variables")
        sys.exit(1)
    
    try:
        # Get users from Keycloak
        users = get_keycloak_users()
        
        # Migrate users to PostgreSQL
        migrate_users_to_db(users)
        
        logger.info("Migration completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
