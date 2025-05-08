from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base

# Use SQLite in-memory database for testing
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine with SQLite
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create test sessionmaker
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def setup_test_db():
    """
    Set up the test database
    """
    # Create all tables in the in-memory database
    Base.metadata.create_all(bind=test_engine)


def teardown_test_db():
    """
    Tear down the test database
    """
    # Drop all tables
    Base.metadata.drop_all(bind=test_engine)


def get_test_db():
    """
    Get a test database session
    """
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()
