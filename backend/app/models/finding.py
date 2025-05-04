from sqlalchemy import Column, String, Text, Enum, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import BaseModel
from app.schemas.scan import Severity


class Finding(BaseModel):
    """Finding model"""
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(
        Enum(Severity), 
        nullable=False, 
        index=True,
        default=Severity.LOW
    )
    cvss_score = Column(Float, nullable=True)
    cve_ids = Column(JSON, nullable=True)  # List of CVE IDs
    affected_components = Column(JSON, nullable=True)  # List of affected components
    remediation = Column(Text, nullable=True)
    references = Column(JSON, nullable=True)  # List of reference URLs
    scan_id = Column(String, ForeignKey("scan.id"), nullable=False)
    
    # Relationships
    scan = relationship("Scan", back_populates="findings")
    scan_result = relationship("ScanResult", back_populates="findings", secondary="scan_result_finding")
