from typing import List
from uuid import uuid4
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.db import get_db
from app.models.project import Project
from app.models.attack_surface import AttackSurface
from app.models.asset import Asset
from app.schemas.user import User
from app.schemas.asset import Asset as AssetSchema, AssetCreate, AssetUpdate

router = APIRouter()


@router.get("/{attack_surface_id}/assets/", response_model=List[AssetSchema])
async def get_attack_surface_assets(
    project_id: str,
    attack_surface_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get list of assets for a specific attack surface
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

    # Query the database for the attack surface
    attack_surface = (
        db.query(AttackSurface)
        .filter(
            AttackSurface.id == attack_surface_id,
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

    # Query the database for assets associated with the attack surface
    assets = (
        db.query(Asset)
        .filter(Asset.attack_surface_id == attack_surface_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return assets


@router.get("/{attack_surface_id}/assets/{asset_id}", response_model=AssetSchema)
async def get_asset(
    project_id: str,
    attack_surface_id: str,
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific asset by ID
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

    # Query the database for the attack surface
    attack_surface = (
        db.query(AttackSurface)
        .filter(
            AttackSurface.id == attack_surface_id,
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

    # Query the database for the specific asset
    asset = (
        db.query(Asset)
        .filter(
            Asset.id == asset_id,
            Asset.attack_surface_id == attack_surface_id
        )
        .first()
    )

    # Check if the asset exists
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    return asset


@router.post("/{attack_surface_id}/assets/", response_model=AssetSchema, status_code=status.HTTP_201_CREATED)
async def create_asset(
    project_id: str,
    attack_surface_id: str,
    asset_in: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new asset for a specific attack surface
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

        # Query the database for the attack surface
        attack_surface = (
            db.query(AttackSurface)
            .filter(
                AttackSurface.id == attack_surface_id,
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

        # Create the asset
        asset = Asset(
            id=str(uuid4()),
            name=asset_in.name,
            asset_type=asset_in.asset_type.lower(),
            description=asset_in.description,
            asset_metadata=asset_in.asset_metadata,
            attack_surface_id=attack_surface_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        # Add the asset to the session
        db.add(asset)

        # Commit the transaction
        db.commit()

        # Refresh the asset to get the latest data from the database
        db.refresh(asset)

        return asset
    except Exception as e:
        # Rollback the transaction in case of error
        db.rollback()
        # Return a more helpful error message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create asset: {str(e)}"
        )


@router.put("/{attack_surface_id}/assets/{asset_id}", response_model=AssetSchema)
async def update_asset(
    project_id: str,
    attack_surface_id: str,
    asset_id: str,
    asset_in: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update an existing asset
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

        # Query the database for the attack surface
        attack_surface = (
            db.query(AttackSurface)
            .filter(
                AttackSurface.id == attack_surface_id,
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

        # Query the database for the specific asset
        asset = (
            db.query(Asset)
            .filter(
                Asset.id == asset_id,
                Asset.attack_surface_id == attack_surface_id
            )
            .first()
        )

        # Check if the asset exists
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found"
            )

        # Update the asset fields if provided
        if asset_in.name is not None:
            asset.name = asset_in.name
        if asset_in.asset_type is not None:
            asset.asset_type = asset_in.asset_type.lower()
        if asset_in.description is not None:
            asset.description = asset_in.description
        if asset_in.asset_metadata is not None:
            asset.asset_metadata = asset_in.asset_metadata

        # Update the updated_at timestamp
        asset.updated_at = datetime.now(timezone.utc)

        # Commit the transaction
        db.commit()

        # Refresh the asset to get the latest data from the database
        db.refresh(asset)

        return asset
    except Exception as e:
        # Rollback the transaction in case of error
        db.rollback()
        # Return a more helpful error message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update asset: {str(e)}"
        )


@router.delete("/{attack_surface_id}/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    project_id: str,
    attack_surface_id: str,
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete an existing asset
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

        # Query the database for the attack surface
        attack_surface = (
            db.query(AttackSurface)
            .filter(
                AttackSurface.id == attack_surface_id,
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

        # Query the database for the specific asset
        asset = (
            db.query(Asset)
            .filter(
                Asset.id == asset_id,
                Asset.attack_surface_id == attack_surface_id
            )
            .first()
        )

        # Check if the asset exists
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found"
            )

        # Delete the asset
        db.delete(asset)

        # Commit the transaction
        db.commit()

        return None
    except Exception as e:
        # Rollback the transaction in case of error
        db.rollback()
        # Return a more helpful error message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete asset: {str(e)}"
        )
