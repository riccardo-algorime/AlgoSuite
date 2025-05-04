from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any

from pydantic import BaseModel, Field, HttpUrl


class ScanType(str, Enum):
    VULNERABILITY = "vulnerability"
    NETWORK = "network"
    WEB = "web"
    API = "api"
    MOBILE = "mobile"
    CLOUD = "cloud"


class ScanStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# Shared properties
class ScanBase(BaseModel):
    target: str
    scan_type: ScanType
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


# Properties to receive via API on creation
class ScanCreate(ScanBase):
    pass


# Properties to receive via API on update
class ScanUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[ScanStatus] = None


# Properties shared by models stored in DB
class ScanInDBBase(ScanBase):
    id: str
    status: ScanStatus
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Additional properties to return via API
class Scan(ScanInDBBase):
    pass


# Finding severity
class Severity(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


# Finding model
class Finding(BaseModel):
    id: str
    title: str
    description: str
    severity: Severity
    cvss_score: Optional[float] = None
    cve_ids: Optional[List[str]] = None
    affected_components: Optional[List[str]] = None
    remediation: Optional[str] = None
    references: Optional[List[HttpUrl]] = None


# Scan result summary
class ScanResultSummary(BaseModel):
    high: int = 0
    medium: int = 0
    low: int = 0
    info: int = 0


# Scan result
class ScanResult(BaseModel):
    id: str
    scan_id: str
    findings: List[Finding]
    summary: ScanResultSummary
    completed_at: datetime
    
    class Config:
        from_attributes = True
