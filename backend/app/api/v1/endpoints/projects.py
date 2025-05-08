from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.db import get_db
from app.models.project import Project
from app.models.attack_surface import AttackSurface
from app.schemas.project import Project as ProjectSchema
from app.schemas.attack_surface import AttackSurface as AttackSurfaceSchema
from app.schemas.user import User

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