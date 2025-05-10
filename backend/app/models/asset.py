from enum import Enum
from sqlalchemy import Column, String, Text, Enum as SQLAlchemyEnum, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class AssetType(str, Enum):
    """Enum for asset types"""
    SERVER = "server"
    WEBSITE = "website"
    DATABASE = "database"
    APPLICATION = "application"
    ENDPOINT = "endpoint"
    CONTAINER = "container"
    NETWORK_DEVICE = "network_device"
    CLOUD_RESOURCE = "cloud_resource"
    OTHER = "other"

    def __str__(self):
        """Return the lowercase string value of the enum"""
        return self.value


class Asset(BaseModel):
    """Asset model"""

    name = Column(String, nullable=False, index=True)
    asset_type = Column(
        String,  # Use a string column instead of an enum
        nullable=False,
        index=True,
        default="server"  # Default to lowercase "server"
    )
    description = Column(Text, nullable=True)
    asset_metadata = Column(JSON, nullable=True)
    attack_surface_id = Column(String, ForeignKey("attacksurface.id"), nullable=False, index=True)

    # Relationships
    attack_surface = relationship("AttackSurface", back_populates="assets")
