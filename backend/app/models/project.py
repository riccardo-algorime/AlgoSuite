from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Project(BaseModel):
    """Project model"""
    
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_by = Column(String, ForeignKey("user.id"), nullable=False)
    
    # Relationships
    user = relationship("User", backref="projects")
    attack_surfaces = relationship("AttackSurface", back_populates="project", cascade="all, delete-orphan")
