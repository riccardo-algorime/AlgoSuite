from sqlalchemy import Column, String, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.base import BaseModel


# Association table for many-to-many relationship between ScanResult and Finding
scan_result_finding = Table(
    "scan_result_finding",
    Base.metadata,
    Column("scan_result_id", String, ForeignKey("scanresult.id"), primary_key=True),
    Column("finding_id", String, ForeignKey("finding.id"), primary_key=True)
)


class ScanResult(BaseModel):
    """Scan result model"""
    
    scan_id = Column(String, ForeignKey("scan.id"), nullable=False, unique=True)
    high_count = Column(Integer, default=0, nullable=False)
    medium_count = Column(Integer, default=0, nullable=False)
    low_count = Column(Integer, default=0, nullable=False)
    info_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    scan = relationship("Scan", back_populates="result")
    findings = relationship(
        "Finding", 
        back_populates="scan_result", 
        secondary=scan_result_finding
    )
    
    @property
    def summary(self):
        """Return summary of findings by severity"""
        return {
            "high": self.high_count,
            "medium": self.medium_count,
            "low": self.low_count,
            "info": self.info_count
        }
