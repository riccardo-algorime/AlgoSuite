import pytest
from datetime import datetime, UTC
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.user import User
from app.api.v1.endpoints.projects import get_projects, get_project


@pytest.mark.asyncio
async def test_get_projects_function(db: Session, test_user: User, test_projects):
    """Test the get_projects function with real data"""
    # Call the function
    result = await get_projects(0, 100, db, test_user)

    # Assertions
    assert len(result) == 2  # Should only return projects owned by the test user

    # Verify project details
    for project in result:
        assert project.created_by == test_user.id
        assert project.name.startswith("Test Project")
        assert project.description.startswith("Description for test project")


@pytest.mark.asyncio
async def test_get_project_function_success(db: Session, test_user: User, test_projects):
    """Test the get_project function with a successful retrieval"""
    # Get the first project that belongs to the test user
    user_project = next(p for p in test_projects if p.created_by == test_user.id)

    # Call the function
    result = await get_project(user_project.id, db, test_user)

    # Assertions
    assert result.id == user_project.id
    assert result.name == user_project.name
    assert result.description == user_project.description
    assert result.created_by == test_user.id


@pytest.mark.asyncio
async def test_get_project_function_not_found(db: Session, test_user: User):
    """Test the get_project function when the project is not found"""
    # Call the function with a non-existent project ID
    with pytest.raises(HTTPException) as exc_info:
        await get_project("non-existent-project-id", db, test_user)

    # Verify the exception details
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Project not found"


@pytest.mark.asyncio
async def test_get_project_function_forbidden(db: Session, test_user: User, test_projects):
    """Test the get_project function when the project belongs to another user"""
    # Get the project that belongs to another user
    other_project = next(p for p in test_projects if p.created_by != test_user.id)

    # Call the function with the other user's project ID
    with pytest.raises(HTTPException) as exc_info:
        await get_project(other_project.id, db, test_user)

    # Verify the exception details
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Not enough permissions to access this project"
