from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class StationBase(BaseModel):
    name: str
    city: Optional[str] = None
    country_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    data_source: Optional[str] = None
    metadata_: Optional[dict] = None

class StationCreate(StationBase):
    station_id: str

class StationUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    country_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    data_source: Optional[str] = None
    metadata_: Optional[dict] = None
    is_active: Optional[bool] = None

class StationResponse(StationBase):
    station_id: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
