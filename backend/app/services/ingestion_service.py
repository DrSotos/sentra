import httpx
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.station import Station
from app.models.measurement import Measurement
from app.models.anomaly import Alert

class LiveDataIngestionService:
    """
    Fetches real-world, live air quality & atmospheric telemetry
    from the European Copernicus / Open-Meteo Open Data APIs.
    """
    AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
    WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

    async def fetch_station_telemetry(self, lat: float, lon: float) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Fetch real-world air quality
            aq_resp = await client.get(
                self.AIR_QUALITY_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "pm10,pm2_5,nitrogen_dioxide,ozone",
                    "timezone": "auto"
                }
            )
            aq_data = aq_resp.json() if aq_resp.status_code == 200 else {}
            aq_current = aq_data.get("current", {})

            # 2. Fetch real-world weather
            weather_resp = await client.get(
                self.WEATHER_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m",
                    "timezone": "auto"
                }
            )
            weather_data = weather_resp.json() if weather_resp.status_code == 200 else {}
            weather_current = weather_data.get("current", {})

            return {
                "pm25": aq_current.get("pm2_5"),
                "pm10": aq_current.get("pm10"),
                "no2": aq_current.get("nitrogen_dioxide"),
                "o3": aq_current.get("ozone"),
                "temperature": weather_current.get("temperature_2m"),
                "humidity": weather_current.get("relative_humidity_2m"),
            }

    async def ingest_all_stations(self, db: AsyncSession) -> List[Dict[str, Any]]:
        result = await db.execute(select(Station).where(Station.is_active == True))
        stations = result.scalars().all()

        ingested = []
        now = datetime.utcnow()

        for station in stations:
            try:
                metrics = await self.fetch_station_telemetry(station.latitude, station.longitude)
                measurement = Measurement(
                    time=now,
                    station_id=station.station_id,
                    pm25=metrics.get("pm25"),
                    pm10=metrics.get("pm10"),
                    no2=metrics.get("no2"),
                    o3=metrics.get("o3"),
                    temperature=metrics.get("temperature"),
                    humidity=metrics.get("humidity"),
                    data_source="Copernicus CAMS (Open-Meteo)"
                )
                db.add(measurement)
                
                # Check for critical WHO threshold alert
                pm25_val = metrics.get("pm25")
                if pm25_val and pm25_val >= 35.0:
                    alert = Alert(
                        station_id=station.station_id,
                        alert_type="WHO_THRESHOLD_EXCEEDED",
                        severity="high" if pm25_val < 50 else "critical",
                        message=f"Real-time PM2.5 reached {pm25_val} µg/m³ at {station.name} (exceeds WHO 24h limit of 15 µg/m³)",
                        is_resolved=False
                    )
                    db.add(alert)

                ingested.append({
                    "station_id": station.station_id,
                    "station_name": station.name,
                    "city": station.city,
                    "metrics": metrics,
                    "timestamp": now.isoformat()
                })
            except Exception as e:
                print(f"[SENTRA Ingestion] Error for {station.station_id}: {e}")

        await db.commit()
        return ingested

ingestion_service = LiveDataIngestionService()

