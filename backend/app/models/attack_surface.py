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


class AttackSurface(BaseModel):
    """Attack Surface model"""
    
    project_id = Column(String, ForeignKey("project.id"), nullable=False, index=True)
    surface_type = Column(
        SQLAlchemyEnum(SurfaceType),
        nullable=False,
        index=True,
        default=SurfaceType.WEB
    )
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="attack_surfaces")
