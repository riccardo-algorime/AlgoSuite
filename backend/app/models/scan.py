from sqlalchemy import Column, String, Text, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import BaseModel
from app.schemas.scan import ScanType, ScanStatus


class Scan(BaseModel):
    """Scan model"""
    
    target = Column(String, nullable=False, index=True)
    scan_type = Column(
        Enum(ScanType), 
        nullable=False, 
        index=True,
        default=ScanType.VULNERABILITY
    )
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=True)
    status = Column(
        Enum(ScanStatus), 
        nullable=False, 
        index=True,
        default=ScanStatus.PENDING
    )
    created_by = Column(String, ForeignKey("user.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="scans")
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    result = relationship(
        "ScanResult", 
        back_populates="scan", 
        uselist=False, 
        cascade="all, delete-orphan"
    )
