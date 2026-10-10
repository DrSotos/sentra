from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, JSON
from .base import Base

class Station(Base):
    __tablename__ = "stations"

    station_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String)
    country_code = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    data_source = Column(String)
    metadata_ = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
