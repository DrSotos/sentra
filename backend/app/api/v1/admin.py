from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.database import get_db
from app.models.anomaly import AuditLog
from app.models.user import User
from app.api.deps import require_role

router = APIRouter()

@router.get("/system/health")
async def system_health(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "error"
        
    return {
        "status": "online",
        "database": db_status,
        "version": "0.1.0"
    }

@router.get("/audit-logs")
async def get_audit_logs(db: AsyncSession = Depends(get_db), _: User = Depends(require_role("admin"))):
    result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100))
    return result.scalars().all()
