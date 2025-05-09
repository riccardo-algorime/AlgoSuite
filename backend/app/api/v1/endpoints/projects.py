from app.schemas.project import Project as ProjectSchema, ProjectCreate
from typing import List
import uuid
import json
from datetime import datetime, UTC

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.db import get_db
from app.models.project import Project
from app.models.attack_surface import AttackSurface, SurfaceType
from app.models.user import User as UserModel
from app.schemas.project import Project as ProjectSchema
from app.schemas.attack_surface import AttackSurface as AttackSurfaceSchema, AttackSurfaceCreate
from app.schemas.user import User
from app.services.user import user_service
from app.services.security import security_service

router = APIRouter()

@router.get("", response_model=List[ProjectSchema])
async def get_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get list of projects for the current user
    """
    # Query the database for projects created by the current user
    projects = (
        db.query(Project)
        .filter(Project.created_by == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return projects


@router.get("/{project_id}", response_model=ProjectSchema)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific project by ID
    """
    # Query the database for the project with the given ID
    project = db.query(Project).filter(Project.id == project_id).first()

    # Check if the project exists
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if the project belongs to the current user
    if project.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this project"
        )

    return project


@router.get("/{project_id}/attack-surfaces/", response_model=List[AttackSurfaceSchema])
async def get_project_attack_surfaces(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get list of attack surfaces for a specific project
    """
    # Query the database for the project with the given ID
    project = db.query(Project).filter(Project.id == project_id).first()

    # Check if the project exists
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if the project belongs to the current user
    if project.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this project"
        )

    # Query the database for attack surfaces associated with the project
    attack_surfaces = (
        db.query(AttackSurface)
        .filter(AttackSurface.project_id == project_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return attack_surfaces


@router.get("/{project_id}/attack-surfaces/{surface_id}", response_model=AttackSurfaceSchema)
async def get_project_attack_surface(
    project_id: str,
    surface_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific attack surface by ID for a specific project
    """
    # Query the database for the project with the given ID
    project = db.query(Project).filter(Project.id == project_id).first()

    # Check if the project exists
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if the project belongs to the current user
    if project.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this project"
        )

    # Query the database for the specific attack surface
    attack_surface = (
        db.query(AttackSurface)
        .filter(
            AttackSurface.id == surface_id,
            AttackSurface.project_id == project_id
        )
        .first()
    )

    # Check if the attack surface exists
    if not attack_surface:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attack surface not found"
        )

    return attack_surface


@router.post("/{project_id}/attack-surfaces/", response_model=AttackSurfaceSchema, status_code=status.HTTP_201_CREATED)
async def create_attack_surface(
    project_id: str,
    surface_in: AttackSurfaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new attack surface for a specific project
    """
    try:
        # Query the database for the project with the given ID
        project = db.query(Project).filter(Project.id == project_id).first()

        # Check if the project exists
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check if the project belongs to the current user
        if project.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this project"
            )

        # Create the attack surface
        # Set the project_id from the URL path parameter
        # Ensure surface_type is properly handled as an enum value

        # Debug what we received
        print(f"Received surface_type: {surface_in.surface_type}, type: {type(surface_in.surface_type)}")
        print(f"Raw surface_type value: {repr(surface_in.surface_type)}")

        # Force lowercase for the surface type
        if isinstance(surface_in.surface_type, str):
            # Convert string to lowercase
            raw_surface_type = surface_in.surface_type.lower()
            print(f"Converted string to lowercase: {raw_surface_type}")
        else:
            # If it's an enum or something else, convert to string and lowercase
            raw_surface_type = str(surface_in.surface_type).lower()
            print(f"Converted non-string to lowercase: {raw_surface_type}")

        # Debug the converted value
        print(f"Converted to lowercase: {raw_surface_type}")

        # Map to valid enum values
        surface_type_map = {
            'web': SurfaceType.WEB,
            'api': SurfaceType.API,
            'mobile': SurfaceType.MOBILE,
            'network': SurfaceType.NETWORK,
            'cloud': SurfaceType.CLOUD,
            'iot': SurfaceType.IOT,
            'other': SurfaceType.OTHER
        }

        # Get the enum value from the map or default to WEB
        if raw_surface_type in surface_type_map:
            surface_type = surface_type_map[raw_surface_type]
            print(f"Mapped to enum value: {surface_type}, value: {surface_type.value}")
        else:
            print(f"Invalid surface type: {raw_surface_type}, using default WEB")
            surface_type = SurfaceType.WEB

        # Create the attack surface with the properly mapped enum value
        # Ensure we're using the enum value, not the string representation

        # Double-check that we have a valid enum instance
        if not isinstance(surface_type, SurfaceType):
            print(f"WARNING: surface_type is not a SurfaceType enum instance: {surface_type}, type: {type(surface_type)}")
            # Try to convert it to a valid enum instance
            try:
                if isinstance(surface_type, str):
                    # Try to get the enum by name (case-insensitive)
                    for enum_val in SurfaceType:
                        if enum_val.name.lower() == surface_type.lower():
                            surface_type = enum_val
                            break
                    else:
                        # If not found by name, try to get by value
                        for enum_val in SurfaceType:
                            if enum_val.value.lower() == surface_type.lower():
                                surface_type = enum_val
                                break
                        else:
                            # Default to WEB if all else fails
                            surface_type = SurfaceType.WEB
            except Exception as e:
                print(f"Error converting surface_type to enum: {e}")
                surface_type = SurfaceType.WEB

        # Get the surface type value
        if hasattr(surface_type, 'value'):
            # If it's an enum, get the value
            print(f"Final surface_type for database: {surface_type}, type: {type(surface_type)}, value: {surface_type.value}")
            surface_type_value = surface_type.value.lower()
        else:
            # If it's already a string, just use it
            print(f"Final surface_type for database: {surface_type}, type: {type(surface_type)}")
            surface_type_value = str(surface_type).lower()

        print(f"Using direct string value for surface_type: {surface_type_value}")

        # Create the attack surface using raw SQL to bypass SQLAlchemy's enum handling
        attack_surface_id = str(uuid.uuid4())
        created_at = datetime.now(UTC)
        updated_at = created_at

        # Create the attack surface directly using the model
        # Use the lowercase string value directly
        attack_surface = AttackSurface(
            id=attack_surface_id,
            project_id=project_id,
            surface_type=surface_type_value,  # Use the lowercase string value
            description=surface_in.description,
            config=surface_in.config,
            created_at=created_at,
            updated_at=updated_at
        )

        # Add the attack surface to the session
        db.add(attack_surface)

        # Commit the transaction
        db.commit()

        # Refresh the attack surface to get the latest data from the database
        db.refresh(attack_surface)

        # Debug what's being sent to the database
        print(f"Creating attack surface with surface_type: {attack_surface.surface_type}")

        return attack_surface
    except Exception as e:
        # Rollback the transaction in case of error
        db.rollback()
        # Log the error with more details
        print(f"Error creating attack surface: {str(e)}")
        print(f"Surface type received: {surface_in.surface_type}, type: {type(surface_in.surface_type)}")
        print(f"Available SurfaceType values: {[t.value for t in SurfaceType]}")

        # Print the full request data for debugging
        print(f"Full request data: project_id={project_id}, surface_in={surface_in.model_dump()}")

        import traceback
        traceback.print_exc()
        # Return a more helpful error message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create attack surface: {str(e)}"
        )


@router.post("", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new project for the current user
    """
    try:
        # Check if the user exists in the database
        db_user = db.query(UserModel).filter(UserModel.id == current_user.id).first()

        # If user doesn't exist in the database, create it
        if not db_user:
            print(f"User {current_user.id} not found in database, creating...")
            # Create a new user in the database with the authenticated user's ID
            db_user = UserModel(
                id=current_user.id,
                email=current_user.email,
                hashed_password=security_service.get_password_hash("password123"),  # Default password
                full_name=current_user.full_name or f"User {current_user.id[:8]}",
                is_active=current_user.is_active,
                is_superuser=current_user.is_superuser
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            print(f"Created user {db_user.id} in database")

        # Create the project
        project = Project(**project_in.model_dump(), created_by=current_user.id)
        db.add(project)
        db.commit()
        db.refresh(project)
        return project
    except Exception as e:
        # Rollback the transaction in case of error
        db.rollback()
        # Log the error
        print(f"Error creating project: {str(e)}")
        # Return a more helpful error message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )