from enum import Enum
from sqlalchemy import Column, String, Text, Enum as SQLAlchemyEnum, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class SurfaceType(str, Enum):
    """Enum for attack surface types"""
    WEB = "web"
    API = "api"
    MOBILE = "mobile"
    NETWORK = "network"
    CLOUD = "cloud"
    IOT = "iot"
    OTHER = "other"

    def __str__(self):
        """Return the lowercase string value of the enum"""
        return self.value


class AttackSurface(BaseModel):
    """Attack Surface model"""

    project_id = Column(String, ForeignKey("project.id"), nullable=False, index=True)
    surface_type = Column(
        String,  # Use a string column instead of an enum
        nullable=False,
        index=True,
        default="web"  # Default to lowercase "web"
    )
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=True)

    # Relationships
    project = relationship("Project", back_populates="attack_surfaces")
    assets = relationship("Asset", back_populates="attack_surface", cascade="all, delete-orphan")
