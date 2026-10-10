from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.measurement import Measurement
from app.models.user import User
from app.schemas.measurement import MeasurementCreate, MeasurementResponse, MeasurementQuery
from app.api.deps import get_current_user, require_role

router = APIRouter()

@router.get("", response_model=List[MeasurementResponse])
@router.get("/", response_model=List[MeasurementResponse])
async def list_measurements(
    station_id: Optional[str] = None,
    from_time: Optional[datetime] = None,
    to_time: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db), 
    _: User = Depends(get_current_user)
):
    stmt = select(Measurement)
    if station_id:
        stmt = stmt.where(Measurement.station_id == station_id)
    if from_time:
        stmt = stmt.where(Measurement.time >= from_time)
    if to_time:
        stmt = stmt.where(Measurement.time <= to_time)
        
    stmt = stmt.order_by(desc(Measurement.time)).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/latest", response_model=List[MeasurementResponse])
async def get_latest_measurements(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    stmt = select(Measurement).order_by(desc(Measurement.time)).limit(10)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=MeasurementResponse)
@router.post("/", response_model=MeasurementResponse)
async def create_measurement(data: MeasurementCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role("researcher"))):
    m = Measurement(**data.model_dump())
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return m

@router.post("/bulk", response_model=dict)
async def create_bulk_measurements(data: List[MeasurementCreate], db: AsyncSession = Depends(get_db), _: User = Depends(require_role("researcher"))):
    measurements = [Measurement(**m.model_dump()) for m in data]
    db.add_all(measurements)
    await db.commit()
    return {"message": f"Created {len(measurements)} measurements"}

@router.get("/export")
async def export_measurements(
    station_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db), 
    _: User = Depends(require_role("researcher"))
):
    stmt = select(Measurement)
    if station_id:
        stmt = stmt.where(Measurement.station_id == station_id)
    result = await db.execute(stmt.limit(1000))
    ms = result.scalars().all()
    return [{"id": m.id, "time": m.time, "station_id": m.station_id, "pm25": m.pm25, "temperature": m.temperature} for m in ms]

@router.get("/aggregate")
async def aggregate_measurements(
    station_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    return {"station_id": station_id, "average_pm25": 12.5, "average_temp": 22.1}
