from datetime import datetime
from typing import Dict, Optional, Any

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.asset import AssetType


# Shared properties
class AssetBase(BaseModel):
    name: str
    asset_type: AssetType = AssetType.SERVER
    description: Optional[str] = None
    asset_metadata: Optional[Dict[str, Any]] = None
    attack_surface_id: str


# Properties to receive via API on creation
class AssetCreate(BaseModel):
    name: str
    asset_type: str = "server"  # Accept as string to handle case issues
    description: Optional[str] = None
    asset_metadata: Optional[Dict[str, Any]] = None
    # attack_surface_id is not required in the request body as it's taken from the URL path

    # Validate and convert asset_type to lowercase
    @field_validator('asset_type')
    @classmethod
    def lowercase_asset_type(cls, v):
        if isinstance(v, str):
            lowercased = v.lower()
            return lowercased
        return v


# Properties to receive via API on update
class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[AssetType] = None
    description: Optional[str] = None
    asset_metadata: Optional[Dict[str, Any]] = None


# Properties shared by models stored in DB
class AssetInDBBase(AssetBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Additional properties to return via API
class Asset(AssetInDBBase):
    pass
