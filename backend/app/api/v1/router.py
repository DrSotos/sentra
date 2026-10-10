from fastapi import APIRouter
from app.api.v1 import auth, users, stations, measurements, analytics, alerts, admin, ws

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(stations.router, prefix="/stations", tags=["stations"])
api_router.include_router(measurements.router, prefix="/measurements", tags=["measurements"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(ws.router, prefix="/ws", tags=["websocket"])
