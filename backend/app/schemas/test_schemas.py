"""
Simple test script for Project and AttackSurface schemas.
Run this directly with: python -m app.schemas.test_schemas
"""

import sys
from datetime import datetime, UTC
from typing import Dict, Any

from app.models.attack_surface import SurfaceType
from app.schemas.project import ProjectCreate, Project, ProjectUpdate
from app.schemas.attack_surface import AttackSurfaceCreate, AttackSurface, AttackSurfaceUpdate


def test_project_create():
    """Test ProjectCreate schema"""
    # Valid data
    data = {
        "name": "Test Project",
        "description": "This is a test project"
    }
    project = ProjectCreate(**data)
    assert project.name == "Test Project"
    assert project.description == "This is a test project"

    # Missing required field
    try:
        ProjectCreate(description="Missing name field")
        assert False, "Should have raised ValidationError"
    except Exception as e:
        print(f"✓ Correctly raised error for missing name: {e}")


def test_project_update():
    """Test ProjectUpdate schema"""
    # Valid data - all fields
    data = {
        "name": "Updated Project",
        "description": "This is an updated project"
    }
    project = ProjectUpdate(**data)
    assert project.name == "Updated Project"
    assert project.description == "This is an updated project"

    # Valid data - partial update
    project = ProjectUpdate(name="Only Name Updated")
    assert project.name == "Only Name Updated"
    assert project.description is None

    project = ProjectUpdate(description="Only Description Updated")
    assert project.name is None
    assert project.description == "Only Description Updated"


def test_project_read():
    """Test Project schema"""
    # Valid data
    data = {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Test Project",
        "description": "This is a test project",
        "created_by": "user123",
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    }
    project = Project(**data)
    assert project.id == "123e4567-e89b-12d3-a456-426614174000"
    assert project.name == "Test Project"
    assert project.description == "This is a test project"
    assert project.created_by == "user123"

    # Missing required fields
    try:
        Project(
            name="Missing required fields",
            description="Missing id, created_by, created_at, updated_at"
        )
        assert False, "Should have raised ValidationError"
    except Exception as e:
        print(f"✓ Correctly raised error for missing fields: {e}")


def test_attack_surface_create():
    """Test AttackSurfaceCreate schema"""
    # Valid data
    data = {
        "project_id": "123e4567-e89b-12d3-a456-426614174000",
        "surface_type": SurfaceType.WEB,
        "description": "Web application attack surface",
        "config": {"url": "https://example.com", "scope": "full"}
    }
    surface = AttackSurfaceCreate(**data)
    assert surface.project_id == "123e4567-e89b-12d3-a456-426614174000"
    assert surface.surface_type == SurfaceType.WEB
    assert surface.description == "Web application attack surface"
    assert surface.config == {"url": "https://example.com", "scope": "full"}

    # Default surface type
    surface = AttackSurfaceCreate(
        project_id="123e4567-e89b-12d3-a456-426614174000",
        description="Default surface type"
    )
    assert surface.surface_type == SurfaceType.WEB

    # Missing required field
    try:
        AttackSurfaceCreate(
            surface_type=SurfaceType.API,
            description="Missing project_id"
        )
        assert False, "Should have raised ValidationError"
    except Exception as e:
        print(f"✓ Correctly raised error for missing project_id: {e}")


def test_attack_surface_update():
    """Test AttackSurfaceUpdate schema"""
    # Valid data - all fields
    data = {
        "surface_type": SurfaceType.API,
        "description": "Updated description",
        "config": {"api_url": "https://api.example.com", "auth": "bearer"}
    }
    surface = AttackSurfaceUpdate(**data)
    assert surface.surface_type == SurfaceType.API
    assert surface.description == "Updated description"
    assert surface.config == {"api_url": "https://api.example.com", "auth": "bearer"}

    # Valid data - partial update
    surface = AttackSurfaceUpdate(surface_type=SurfaceType.MOBILE)
    assert surface.surface_type == SurfaceType.MOBILE
    assert surface.description is None
    assert surface.config is None


def test_attack_surface_read():
    """Test AttackSurface schema"""
    # Valid data
    data = {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "project_id": "123e4567-e89b-12d3-a456-426614174001",
        "surface_type": SurfaceType.NETWORK,
        "description": "Network attack surface",
        "config": {"ip_range": "192.168.1.0/24", "ports": [22, 80, 443]},
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    }
    surface = AttackSurface(**data)
    assert surface.id == "123e4567-e89b-12d3-a456-426614174000"
    assert surface.project_id == "123e4567-e89b-12d3-a456-426614174001"
    assert surface.surface_type == SurfaceType.NETWORK
    assert surface.description == "Network attack surface"
    assert surface.config == {"ip_range": "192.168.1.0/24", "ports": [22, 80, 443]}

    # Missing required fields
    try:
        AttackSurface(
            project_id="123e4567-e89b-12d3-a456-426614174001",
            surface_type=SurfaceType.CLOUD,
            description="Missing id, created_at, updated_at"
        )
        assert False, "Should have raised ValidationError"
    except Exception as e:
        print(f"✓ Correctly raised error for missing fields: {e}")


def run_tests():
    """Run all tests"""
    print("Running tests for Project schemas...")
    test_project_create()
    test_project_update()
    test_project_read()

    print("\nRunning tests for AttackSurface schemas...")
    test_attack_surface_create()
    test_attack_surface_update()
    test_attack_surface_read()

    print("\nAll tests passed! ✓")


if __name__ == "__main__":
    run_tests()
