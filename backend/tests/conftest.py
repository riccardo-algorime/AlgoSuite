import pytest
from datetime import datetime, UTC
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import uuid
import json

from app.app import app
from app.db.test_session import setup_test_db, teardown_test_db, get_test_db
from app.models.user import User
from app.models.project import Project
from app.models.attack_surface import AttackSurface, SurfaceType
from app.schemas.user import User as UserSchema


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """
    Set up the test database before all tests and tear it down after all tests
    """
    setup_test_db()
    yield
    teardown_test_db()


@pytest.fixture
def db():
    """
    Get a test database session
    """
    db_generator = get_test_db()
    db = next(db_generator)
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    """
    Test client fixture
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_user(db: Session):
    """
    Create a test user in the database
    """
    # Generate a unique user ID and email for each test
    user_id = str(uuid.uuid4())
    unique_email = f"test-{user_id}@example.com"

    user = User(
        id=user_id,
        email=unique_email,
        hashed_password="hashed_password",  # In a real app, this would be properly hashed
        full_name="Test User",
        is_active=True,
        is_superuser=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Return a Pydantic model for the user
    return UserSchema(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        full_name=user.full_name
    )


@pytest.fixture
def test_projects(db: Session, test_user: UserSchema):
    """
    Create test projects in the database
    """
    projects = []

    # Create two test projects
    for i in range(2):
        project_id = str(uuid.uuid4())
        project = Project(
            id=project_id,
            name=f"Test Project {i+1}",
            description=f"Description for test project {i+1}",
            created_by=test_user.id,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )
        db.add(project)
        projects.append(project)

    # Create a project owned by another user
    other_user_id = str(uuid.uuid4())
    other_email = f"other-{other_user_id}@example.com"
    other_user = User(
        id=other_user_id,
        email=other_email,
        hashed_password="hashed_password",
        full_name="Other User",
        is_active=True,
        is_superuser=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(other_user)

    other_project = Project(
        id=str(uuid.uuid4()),
        name="Other User's Project",
        description="This project belongs to another user",
        created_by=other_user_id,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(other_project)
    projects.append(other_project)

    db.commit()

    for project in projects:
        db.refresh(project)

    return projects


@pytest.fixture
def test_attack_surfaces(db: Session, test_projects):
    """
    Create test attack surfaces in the database
    """
    attack_surfaces = []

    # Create attack surfaces for the first project (owned by test_user)
    user_project = next(p for p in test_projects if p.name == "Test Project 1")

    # Web attack surface
    web_surface = AttackSurface(
        id=str(uuid.uuid4()),
        project_id=user_project.id,
        surface_type=SurfaceType.WEB,
        description="Web application attack surface",
        config=json.dumps({"url": "https://example.com", "scope": "full"}),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(web_surface)
    attack_surfaces.append(web_surface)

    # API attack surface
    api_surface = AttackSurface(
        id=str(uuid.uuid4()),
        project_id=user_project.id,
        surface_type=SurfaceType.API,
        description="API attack surface",
        config=json.dumps({"api_url": "https://api.example.com", "auth": "bearer"}),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(api_surface)
    attack_surfaces.append(api_surface)

    # Create an attack surface for the second project (also owned by test_user)
    second_user_project = next(p for p in test_projects if p.name == "Test Project 2")
    network_surface = AttackSurface(
        id=str(uuid.uuid4()),
        project_id=second_user_project.id,
        surface_type=SurfaceType.NETWORK,
        description="Network attack surface",
        config=json.dumps({"ip_range": "192.168.1.0/24", "ports": [22, 80, 443]}),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(network_surface)
    attack_surfaces.append(network_surface)

    # Create an attack surface for the project owned by another user
    other_project = next(p for p in test_projects if p.name == "Other User's Project")
    other_surface = AttackSurface(
        id=str(uuid.uuid4()),
        project_id=other_project.id,
        surface_type=SurfaceType.CLOUD,
        description="Cloud attack surface",
        config=json.dumps({"provider": "aws", "region": "us-west-2"}),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(other_surface)
    attack_surfaces.append(other_surface)

    db.commit()

    for surface in attack_surfaces:
        db.refresh(surface)

    return attack_surfaces
