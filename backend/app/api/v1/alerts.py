from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from datetime import datetime
from app.database import get_db
from app.models.anomaly import Alert
from app.models.user import User
from app.api.deps import get_current_user, require_role

router = APIRouter()

@router.get("")
@router.get("/")
async def list_alerts(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Alert).order_by(Alert.created_at.desc()).limit(100))
    return result.scalars().all()

@router.patch("/{id}/resolve")
async def resolve_alert(id: uuid.UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_role("researcher"))):
    result = await db.execute(select(Alert).where(Alert.id == id))
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    await db.commit()
    await db.refresh(alert)
    return alert

@router.get("/stats")
async def get_alert_stats(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    return {"total": 10, "resolved": 5, "active": 5}
