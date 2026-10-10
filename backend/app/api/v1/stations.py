from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.database import get_db
from app.models.station import Station
from app.models.user import User
from app.schemas.station import StationCreate, StationResponse, StationUpdate
from app.api.deps import get_current_user, require_role

router = APIRouter()

@router.get("", response_model=List[StationResponse])
@router.get("/", response_model=List[StationResponse])
async def list_stations(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Station))
    return result.scalars().all()

@router.get("/{station_id}", response_model=StationResponse)
async def get_station(station_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Station).where(Station.station_id == station_id))
    station = result.scalars().first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station

@router.post("", response_model=StationResponse)
@router.post("/", response_model=StationResponse)
async def create_station(data: StationCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role("researcher"))):
    station = Station(**data.model_dump())
    db.add(station)
    try:
        await db.commit()
        await db.refresh(station)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return station

@router.patch("/{station_id}", response_model=StationResponse)
async def update_station(station_id: str, data: StationUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role("researcher"))):
    result = await db.execute(select(Station).where(Station.station_id == station_id))
    station = result.scalars().first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(station, k, v)
        
    await db.commit()
    await db.refresh(station)
    return station

@router.delete("/{station_id}")
async def delete_station(station_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(require_role("admin"))):
    result = await db.execute(select(Station).where(Station.station_id == station_id))
    station = result.scalars().first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    await db.delete(station)
    await db.commit()
    return {"message": "Station deleted"}
