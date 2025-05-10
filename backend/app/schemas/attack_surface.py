from datetime import datetime
from typing import Dict, Optional, Any, List, TYPE_CHECKING, ForwardRef

from pydantic import BaseModel, Field, ConfigDict, validator, model_validator

from app.models.attack_surface import SurfaceType

if TYPE_CHECKING:
    from app.schemas.asset import Asset


# Shared properties
class AttackSurfaceBase(BaseModel):
    project_id: str
    surface_type: SurfaceType = SurfaceType.WEB
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


# Properties to receive via API on creation
class AttackSurfaceCreate(BaseModel):
    # project_id is not required in the request body as it's taken from the URL path
    surface_type: str = "web"  # Accept as string to handle case issues
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

    # Validate and convert surface_type to lowercase
    @validator('surface_type')
    def lowercase_surface_type(cls, v):
        print(f"Pydantic validator received surface_type: {v}, type: {type(v)}")
        if isinstance(v, str):
            lowercased = v.lower()
            print(f"Pydantic validator converted to lowercase: {lowercased}")
            return lowercased
        print(f"Pydantic validator returning non-string value as-is: {v}")
        return v


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


# Attack Surface with relationships
class AttackSurfaceWithAssets(AttackSurface):
    assets: List["Asset"] = []
