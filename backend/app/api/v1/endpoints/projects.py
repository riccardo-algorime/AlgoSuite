from app.schemas.project import Project as ProjectSchema, ProjectCreate
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.db import get_db
from app.models.project import Project
from app.models.attack_surface import AttackSurface
from app.models.user import User as UserModel
from app.schemas.project import Project as ProjectSchema
from app.schemas.attack_surface import AttackSurface as AttackSurfaceSchema
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