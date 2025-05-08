import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.schemas.user import User
from app.api.v1.endpoints.projects import get_project_attack_surface


@pytest.mark.asyncio
async def test_get_project_attack_surface_success(db: Session, test_user: User, test_projects, test_attack_surfaces):
    """Test the get_project_attack_surface function with a successful retrieval"""
    # Get the first project that belongs to the test user
    user_project = next(p for p in test_projects if p.name == "Test Project 1")
    
    # Get the first attack surface for that project
    attack_surface = next(s for s in test_attack_surfaces if s.project_id == user_project.id)

    # Call the function
    result = await get_project_attack_surface(user_project.id, attack_surface.id, db, test_user)

    # Assertions
    assert result.id == attack_surface.id
    assert result.project_id == user_project.id
    assert result.surface_type == attack_surface.surface_type
    assert result.description == attack_surface.description


@pytest.mark.asyncio
async def test_get_project_attack_surface_not_found(db: Session, test_user: User, test_projects):
    """Test the get_project_attack_surface function when the attack surface is not found"""
    # Get the first project that belongs to the test user
    user_project = next(p for p in test_projects if p.created_by == test_user.id)

    # Call the function with a non-existent attack surface ID
    with pytest.raises(HTTPException) as exc_info:
        await get_project_attack_surface(user_project.id, "non-existent-surface-id", db, test_user)

    # Verify the exception details
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Attack surface not found"


@pytest.mark.asyncio
async def test_get_project_attack_surface_project_not_found(db: Session, test_user: User):
    """Test the get_project_attack_surface function when the project is not found"""
    # Call the function with a non-existent project ID
    with pytest.raises(HTTPException) as exc_info:
        await get_project_attack_surface("non-existent-project-id", "some-surface-id", db, test_user)

    # Verify the exception details
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Project not found"


@pytest.mark.asyncio
async def test_get_project_attack_surface_forbidden(db: Session, test_user: User, test_projects, test_attack_surfaces):
    """Test the get_project_attack_surface function when the project belongs to another user"""
    # Get the project that belongs to another user
    other_project = next(p for p in test_projects if p.name == "Other User's Project")
    
    # Get an attack surface for that project
    other_surface = next(s for s in test_attack_surfaces if s.project_id == other_project.id)

    # Call the function with the other user's project ID and attack surface ID
    with pytest.raises(HTTPException) as exc_info:
        await get_project_attack_surface(other_project.id, other_surface.id, db, test_user)

    # Verify the exception details
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Not enough permissions to access this project"


@pytest.mark.asyncio
async def test_get_project_attack_surface_wrong_project(db: Session, test_user: User, test_projects, test_attack_surfaces):
    """Test the get_project_attack_surface function when the attack surface doesn't belong to the specified project"""
    # Get the first project that belongs to the test user
    user_project = next(p for p in test_projects if p.name == "Test Project 1")
    
    # Get an attack surface from the second project
    second_project = next(p for p in test_projects if p.name == "Test Project 2")
    second_project_surface = next(s for s in test_attack_surfaces if s.project_id == second_project.id)

    # Call the function with mismatched project ID and attack surface ID
    with pytest.raises(HTTPException) as exc_info:
        await get_project_attack_surface(user_project.id, second_project_surface.id, db, test_user)

    # Verify the exception details
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Attack surface not found"
