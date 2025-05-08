# Import all models here for Alembic to detect them
from app.models.base import BaseModel  # noqa
from app.models.user import User  # noqa
from app.models.scan import Scan  # noqa
from app.models.finding import Finding  # noqa
from app.models.scan_result import ScanResult  # noqa
from app.models.project import Project  # noqa
from app.models.attack_surface import AttackSurface  # noqa