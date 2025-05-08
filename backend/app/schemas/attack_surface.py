from datetime import datetime
from typing import Dict, Optional, Any

from pydantic import BaseModel, Field, ConfigDict

from app.models.attack_surface import SurfaceType


# Shared properties
class AttackSurfaceBase(BaseModel):
    project_id: str
    surface_type: SurfaceType = SurfaceType.WEB
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


# Properties to receive via API on creation
class AttackSurfaceCreate(AttackSurfaceBase):
    pass


# Properties to receive via API on update
class AttackSurfaceUpdate(BaseModel):
    surface_type: Optional[SurfaceType] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


# Properties shared by models stored in DB
class AttackSurfaceInDBBase(AttackSurfaceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Additional properties to return via API
class AttackSurface(AttackSurfaceInDBBase):
    pass
