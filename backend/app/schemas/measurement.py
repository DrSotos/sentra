from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class MeasurementBase(BaseModel):
    time: datetime
    station_id: str
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    o3: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    noise_db: Optional[float] = None
    data_source: Optional[str] = None

class MeasurementCreate(MeasurementBase):
    pass

class MeasurementResponse(MeasurementBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class MeasurementQuery(BaseModel):
    station_id: Optional[str] = None
    metric: Optional[str] = None
    from_time: Optional[datetime] = None
    to_time: Optional[datetime] = None
    resolution: Optional[str] = None
    limit: int = 100
    offset: int = 0
