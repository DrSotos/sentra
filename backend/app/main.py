import asyncio
import random
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.router import api_router
from app.config import settings
from app.database import engine, AsyncSessionLocal
from app.models.base import Base
from app.models.user import Role, User, UserRole
from app.models.station import Station
from app.models.measurement import Measurement
from app.models.anomaly import Anomaly, Alert, AuditLog
from app.utils.security import get_password_hash


async def seed_data():
    async with AsyncSessionLocal() as db:
        # Create roles
        db_roles = {}
        for role_name in ["admin", "researcher", "viewer"]:
            result = await db.execute(select(Role).where(Role.name == role_name))
            role = result.scalars().first()
            if not role:
                role = Role(name=role_name, description=f"{role_name.capitalize()} role")
                db.add(role)
                await db.flush()
            db_roles[role_name] = role
        await db.commit()

        # Create default users
        users_data = [
            ("admin@sentra.eu", "admin123", "Admin User", "SENTRA Consortium", "admin"),
            ("researcher@sentra.eu", "research123", "Researcher User", "SENTRA Lab", "researcher"),
            ("viewer@sentra.eu", "viewer123", "Viewer User", "Public", "viewer"),
        ]

        for email, pwd, name, org, role_name in users_data:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalars().first()
            if not user:
                user = User(
                    email=email,
                    hashed_password=get_password_hash(pwd),
                    full_name=name,
                    organization=org,
                )
                db.add(user)
                await db.flush()

                db.add(UserRole(user_id=user.id, role_id=db_roles[role_name].id))
        await db.commit()

        # Create demo stations
        stations = [
            ("ATH01", "Athens Center", "Athens", "GR", 37.9838, 23.7275, "EEA"),
            ("BER01", "Berlin Mitte", "Berlin", "DE", 52.5200, 13.4050, "EEA"),
            ("AMS01", "Amsterdam Central", "Amsterdam", "NL", 52.3676, 4.9041, "EEA"),
            ("PAR01", "Paris 1er", "Paris", "FR", 48.8566, 2.3522, "EEA"),
            ("STO01", "Stockholm City", "Stockholm", "SE", 59.3293, 18.0686, "EEA"),
        ]

        station_ids = []
        for sid, name, city, cc, lat, lon, source in stations:
            result = await db.execute(select(Station).where(Station.station_id == sid))
            if not result.scalars().first():
                db.add(Station(
                    station_id=sid, name=name, city=city,
                    country_code=cc, latitude=lat, longitude=lon,
                    data_source=source,
                ))
            station_ids.append(sid)
        await db.commit()

        # Seed measurements for the past 7 days (one per hour per station)
        result = await db.execute(select(Measurement).limit(1))
        if not result.scalars().first():
            now = datetime.utcnow()
            measurements = []
            for sid in station_ids:
                base_pm25 = random.uniform(8, 25)
                base_temp = random.uniform(12, 28)
                for i in range(168):  # 7 days * 24 hours
                    t = now - timedelta(hours=i)
                    hour = t.hour
                    # Simulate realistic daily patterns
                    rush_factor = 1.5 if hour in (7, 8, 9, 17, 18, 19) else 1.0
                    night_factor = 0.7 if hour in range(0, 6) else 1.0
                    temp_factor = 1.0 + 0.2 * (hour - 12) / 12  # warmer midday

                    measurements.append(Measurement(
                        time=t,
                        station_id=sid,
                        pm25=round(base_pm25 * rush_factor * night_factor + random.gauss(0, 3), 2),
                        pm10=round((base_pm25 * 1.6) * rush_factor * night_factor + random.gauss(0, 5), 2),
                        no2=round(random.uniform(10, 60) * rush_factor, 2),
                        o3=round(random.uniform(20, 80) * night_factor, 2),
                        temperature=round(base_temp * temp_factor + random.gauss(0, 1.5), 2),
                        humidity=round(random.uniform(35, 85), 2),
                        noise_db=round(random.uniform(35, 75) * rush_factor, 2),
                        data_source="seed",
                    ))
            db.add_all(measurements)
            await db.commit()
            print(f"[SENTRA] Seeded {len(measurements)} measurements for {len(station_ids)} stations.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[SENTRA] Database tables created.")

    # Seed demo data
    try:
        await seed_data()
        print("[SENTRA] Seed data loaded.")
    except Exception as e:
        print(f"[SENTRA] Seed error (non-fatal): {e}")

    # Fetch initial live Copernicus telemetry
    try:
        from app.services.ingestion_service import ingestion_service
        async with AsyncSessionLocal() as db:
            await ingestion_service.ingest_all_stations(db)
            print("[SENTRA] Initial live Copernicus air quality data fetched.")
    except Exception as e:
        print(f"[SENTRA] Live ingestion notice: {e}")

    # Start automated background ingestion loop (every 30 min)
    async def periodic_ingestion():
        while True:
            await asyncio.sleep(1800)  # 30 minutes
            try:
                from app.services.ingestion_service import ingestion_service
                async with AsyncSessionLocal() as db:
                    await ingestion_service.ingest_all_stations(db)
                    print("[SENTRA Scheduler] Automated 30-min Copernicus telemetry ingestion completed.")
            except Exception as ex:
                print(f"[SENTRA Scheduler] Ingestion error: {ex}")

    ingestion_task = asyncio.create_task(periodic_ingestion())

    yield

    ingestion_task.cancel()


app = FastAPI(
    title="SENTRA API",
    description="Smart Environmental Network for Territorial Resilience Analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:80",
    ],
    allow_origin_regex=r"^https?://localhost(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "SENTRA API"}
