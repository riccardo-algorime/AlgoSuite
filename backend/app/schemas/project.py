from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from pydantic import BaseModel, Field, ConfigDict

if TYPE_CHECKING:
    from app.schemas.attack_surface import AttackSurface


# Shared properties
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


# Properties to receive via API on creation
class ProjectCreate(ProjectBase):
    pass


# Properties to receive via API on update
class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


# Properties shared by models stored in DB
class ProjectInDBBase(ProjectBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Additional properties to return via API
class Project(ProjectInDBBase):
    pass


# Project with relationships
class ProjectWithRelationships(Project):
    attack_surfaces: List["AttackSurface"] = []
