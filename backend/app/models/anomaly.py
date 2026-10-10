import uuid
from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    measurement_id = Column(BigInteger, ForeignKey("measurements.id"))
    station_id = Column(String, ForeignKey("stations.station_id"))
    detected_at = Column(DateTime, default=datetime.utcnow)
    metric_name = Column(String, nullable=False)
    anomaly_score = Column(Float)
    severity = Column(String)  # low/medium/high/critical
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    station_id = Column(String, ForeignKey("stations.station_id"))
    alert_type = Column(String)
    severity = Column(String)
    message = Column(String)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    ip_address = Column(String)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
