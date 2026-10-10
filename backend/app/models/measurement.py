from sqlalchemy import Column, BigInteger, DateTime, String, Float, ForeignKey
from .base import Base

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    time = Column(DateTime, index=True, nullable=False)
    station_id = Column(String, ForeignKey("stations.station_id"), nullable=False)
    pm25 = Column(Float)
    pm10 = Column(Float)
    no2 = Column(Float)
    o3 = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    noise_db = Column(Float)
    data_source = Column(String)
