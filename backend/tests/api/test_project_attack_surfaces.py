import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.schemas.user import User
from app.api.v1.endpoints.projects import get_project_attack_surfaces


@pytest.mark.asyncio
async def test_get_project_attack_surfaces_success(db: Session, test_user: User, test_projects, test_attack_surfaces):
    """Test the get_project_attack_surfaces function with a successful retrieval"""
    # Get the first project that belongs to the test user
    user_project = next(p for p in test_projects if p.name == "Test Project 1")

    # Call the function
    result = await get_project_attack_surfaces(user_project.id, 0, 100, db, test_user)

    # Assertions
    assert len(result) == 2  # Should return 2 attack surfaces for the first project
    
    # Verify attack surface details
    for surface in result:
        assert surface.project_id == user_project.id
        assert surface.surface_type in ["web", "api"]
        assert surface.description in ["Web application attack surface", "API attack surface"]


@pytest.mark.asyncio
async def test_get_project_attack_surfaces_empty(db: Session, test_user: User, test_projects):
    """Test the get_project_attack_surfaces function when there are no attack surfaces"""
    # Create a new project without attack surfaces
    from app.models.project import Project
    from datetime import datetime, UTC
    import uuid
    
    new_project = Project(
        id=str(uuid.uuid4()),
        name="Test Project Without Surfaces",
        description="This project has no attack surfaces",
        created_by=test_user.id,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Call the function
    result = await get_project_attack_surfaces(new_project.id, 0, 100, db, test_user)
    
    # Assertions
    assert len(result) == 0  # Should return an empty list


@pytest.mark.asyncio
async def test_get_project_attack_surfaces_not_found(db: Session, test_user: User):
    """Test the get_project_attack_surfaces function when the project is not found"""
    # Call the function with a non-existent project ID
    with pytest.raises(HTTPException) as exc_info:
        await get_project_attack_surfaces("non-existent-project-id", 0, 100, db, test_user)

    # Verify the exception details
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Project not found"


@pytest.mark.asyncio
async def test_get_project_attack_surfaces_forbidden(db: Session, test_user: User, test_projects):
    """Test the get_project_attack_surfaces function when the project belongs to another user"""
    # Get the project that belongs to another user
    other_project = next(p for p in test_projects if p.name == "Other User's Project")

    # Call the function with the other user's project ID
    with pytest.raises(HTTPException) as exc_info:
        await get_project_attack_surfaces(other_project.id, 0, 100, db, test_user)

    # Verify the exception details
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Not enough permissions to access this project"


@pytest.mark.asyncio
async def test_get_project_attack_surfaces_pagination(db: Session, test_user: User, test_projects, test_attack_surfaces):
    """Test the get_project_attack_surfaces function with pagination"""
    # Get the first project that belongs to the test user
    user_project = next(p for p in test_projects if p.name == "Test Project 1")

    # Call the function with pagination
    result = await get_project_attack_surfaces(user_project.id, 0, 1, db, test_user)

    # Assertions
    assert len(result) == 1  # Should return only 1 attack surface due to limit=1
    
    # Get the second page
    result_page_2 = await get_project_attack_surfaces(user_project.id, 1, 1, db, test_user)
    
    # Assertions
    assert len(result_page_2) == 1  # Should return the second attack surface
    assert result[0].id != result_page_2[0].id  # Should be different attack surfaces
