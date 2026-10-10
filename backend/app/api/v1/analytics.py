from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
import pandas as pd
import uuid
from datetime import datetime
from app.database import get_db
from app.models.measurement import Measurement
from app.models.station import Station
from app.models.user import User
from app.schemas.analytics import (
    AnomalyDetectionRequest, AnomalyResponse,
    ForecastRequest, ForecastResponse,
    PolicyBriefResponse,
    ScenarioSimulationRequest, ScenarioSimulationResponse,
    CitizenAdvisoryResponse
)
from app.api.deps import get_current_user, require_role
from app.services.ml_service import AnomalyDetector, TrendForecaster, PolicyScenarioSimulator
from app.services.ingestion_service import ingestion_service
from app.api.v1.ws import manager

router = APIRouter()
anomaly_detector = AnomalyDetector()
forecaster = TrendForecaster()
simulator = PolicyScenarioSimulator()

@router.post("/anomalies", response_model=List[AnomalyResponse])
async def run_anomaly_detection(
    req: AnomalyDetectionRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("researcher"))
):
    stmt = select(Measurement).where(Measurement.station_id == req.station_id)
    if req.from_time:
        stmt = stmt.where(Measurement.time >= req.from_time)
    if req.to_time:
        stmt = stmt.where(Measurement.time <= req.to_time)
    
    result = await db.execute(stmt)
    measurements = result.scalars().all()
    
    if not measurements:
        return []
        
    df = pd.DataFrame([m.__dict__ for m in measurements])
    df = df.set_index('time').sort_index()
    
    anomalies = anomaly_detector.detect(df, req.metrics)

    # Broadcast to WebSocket clients if critical anomalies found
    critical_count = sum(1 for a in anomalies if a.get("severity") in ["high", "critical"])
    if critical_count > 0:
        await manager.broadcast({
            "type": "ANOMALY_ALERT",
            "station_id": req.station_id,
            "critical_count": critical_count,
            "top_anomaly": anomalies[0] if anomalies else None,
            "timestamp": datetime.utcnow().isoformat()
        })

    return anomalies

@router.get("/anomalies")
async def list_anomalies(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    from app.models.anomaly import Anomaly
    result = await db.execute(select(Anomaly).limit(100))
    return result.scalars().all()

@router.post("/forecast", response_model=ForecastResponse)
async def run_forecast(
    req: ForecastRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("researcher"))
):
    stmt = select(Measurement).where(Measurement.station_id == req.station_id).order_by(Measurement.time)
    result = await db.execute(stmt)
    measurements = result.scalars().all()
    
    if not measurements:
        raise HTTPException(status_code=400, detail="Not enough data for this station")
        
    df = pd.DataFrame([m.__dict__ for m in measurements])
    df = df.set_index('time')
    
    forecast = forecaster.forecast(df, req.metric, req.periods)
    
    return ForecastResponse(
        station_id=req.station_id,
        metric=req.metric,
        forecast=forecast
    )

@router.post("/ingest-live")
async def trigger_live_ingestion(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("researcher"))
):
    """
    Triggers live ingestion from European Copernicus Open-Meteo API.
    """
    ingested = await ingestion_service.ingest_all_stations(db)
    
    # Broadcast live telemetry update to connected frontend dashboards
    await manager.broadcast({
        "type": "TELEMETRY_UPDATED",
        "stations_updated": len(ingested),
        "data": ingested,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {
        "status": "success",
        "message": f"Successfully ingested live data for {len(ingested)} European stations.",
        "ingested": ingested
    }

@router.get("/report/policy-brief", response_model=PolicyBriefResponse)
async def get_policy_brief(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Generates a formal EU Horizon Europe Environmental Policy Brief.
    """
    m_res = await db.execute(select(Measurement).order_by(Measurement.time.desc()).limit(500))
    measurements = m_res.scalars().all()
    
    s_res = await db.execute(select(Station))
    stations = s_res.scalars().all()

    station_stats = {}
    for s in stations:
        station_stats[s.station_id] = {"name": s.name, "city": s.city, "pm25_values": []}

    for m in measurements:
        if m.station_id in station_stats and m.pm25 is not None:
            station_stats[m.station_id]["pm25_values"].append(m.pm25)

    rankings = []
    who_limit = 15.0  # WHO 24h PM2.5 guideline
    exceedance_stations = []

    for sid, data in station_stats.items():
        vals = data["pm25_values"]
        avg_pm25 = round(sum(vals) / len(vals), 1) if vals else 0.0
        compliant = avg_pm25 <= who_limit
        if not compliant:
            exceedance_stations.append(data["name"])
        rankings.append({
            "station": data["name"],
            "city": data["city"],
            "avg_pm25": avg_pm25,
            "who_compliant": compliant,
            "air_quality_index": "Good" if avg_pm25 < 15 else "Moderate" if avg_pm25 < 35 else "Unhealthy"
        })

    rankings.sort(key=lambda x: x["avg_pm25"])

    summary = (
        f"This policy brief synthesizes territorial air quality observations across {len(stations)} European metropolitan zones. "
        f"Current network mean PM2.5 is {round(sum(r['avg_pm25'] for r in rankings)/len(rankings), 1) if rankings else 0} µg/m³. "
        f"{len(exceedance_stations)} station(s) ({', '.join(exceedance_stations) if exceedance_stations else 'None'}) exceed "
        "the World Health Organization 24-hour guideline (15 µg/m³)."
    )

    recommendations = [
        "Implement dynamic Low Emission Zone (LEZ) controls during predicted morning inversion hours.",
        "Expand urban green canopy corridors in zones demonstrating consecutive particulate matter spikes.",
        "Calibrate IoT municipal monitoring stations against Copernicus atmospheric reference models bi-weekly.",
        "Accelerate public transit subsidies on days forecasted with Poor/Unhealthy air quality index."
    ]

    return PolicyBriefResponse(
        report_id=f"SENTRA-PB-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}",
        generated_at=datetime.utcnow(),
        executive_summary=summary,
        who_compliance_status={
            "who_pm25_threshold": 15.0,
            "compliant_stations_count": len([r for r in rankings if r["who_compliant"]]),
            "non_compliant_stations_count": len([r for r in rankings if not r["who_compliant"]]),
            "status": "ATTENTION_REQUIRED" if exceedance_stations else "COMPLIANT"
        },
        station_rankings=rankings,
        key_recommendations=recommendations,
        disclaimer="EU Horizon Europe Research Prototype (TRL 5). Prepared according to European Environment Agency guidelines."
    )

@router.post("/simulate", response_model=ScenarioSimulationResponse)
async def run_scenario_simulation(
    req: ScenarioSimulationRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Runs What-If Policy Intervention Scenario Simulation.
    """
    st_res = await db.execute(select(Station).where(Station.station_id == req.station_id))
    station = st_res.scalars().first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    # Get recent measurements baseline for this station
    m_res = await db.execute(
        select(Measurement).where(Measurement.station_id == req.station_id).order_by(Measurement.time.desc()).limit(48)
    )
    measurements = m_res.scalars().all()
    
    pm25_vals = [m.pm25 for m in measurements if m.pm25 is not None]
    no2_vals = [m.no2 for m in measurements if m.no2 is not None]

    base_pm25 = float(sum(pm25_vals) / len(pm25_vals)) if pm25_vals else 18.0
    base_no2 = float(sum(no2_vals) / len(no2_vals)) if no2_vals else 32.0

    res = simulator.simulate(
        baseline_pm25=base_pm25,
        baseline_no2=base_no2,
        traffic_reduction=req.traffic_reduction_pct,
        green_canopy=req.green_canopy_increase_pct,
        ev_transit=req.ev_transit_share_pct
    )

    return ScenarioSimulationResponse(
        station_id=station.station_id,
        station_name=station.name,
        city=station.city or "Unknown",
        **res
    )

@router.get("/citizen-advisory", response_model=CitizenAdvisoryResponse)
async def get_citizen_advisory(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Public Citizen Health & Sports Advisory.
    """
    s_res = await db.execute(select(Station).where(Station.is_active == True))
    stations = s_res.scalars().all()

    # Get latest measurements per station
    city_summaries = []
    max_pm25 = 0.0

    for s in stations:
        m_res = await db.execute(
            select(Measurement).where(Measurement.station_id == s.station_id).order_by(Measurement.time.desc()).limit(1)
        )
        latest = m_res.scalars().first()
        pm25 = latest.pm25 if latest and latest.pm25 else 12.0
        max_pm25 = max(max_pm25, pm25)
        
        city_summaries.append({
            "station_id": s.station_id,
            "station_name": s.name,
            "city": s.city,
            "pm25": round(pm25, 1),
            "temp": round(latest.temperature if latest and latest.temperature else 20.0, 1),
            "status": "Good" if pm25 < 15 else "Moderate" if pm25 < 35 else "Poor"
        })

    if max_pm25 < 15:
        overall_label = "Εξαιρετική Ποιότητα Αέρα (European AQI Level 1)"
        color_code = "#10b981"
        sports_advice = "🟢 Ιδανικές συνθήκες για όλες τις υπαίθριες αθλητικές δραστηριότητες και τρέξιμο."
        vulnerable_advice = "🟢 Ασφαλές περιβάλλον για ευάλωτες ομάδες (παιδιά, άτομα τρίτης ηλικίας, ασθματικούς)."
        ventilation_advice = "🪟 Ελεύθερος φυσικός αερισμός κατοικιών καθ' όλη τη διάρκεια της ημέρας."
        alert = False
    elif max_pm25 < 35:
        overall_label = "Μέτρια Ποιότητα Αέρα (European AQI Level 2)"
        color_code = "#f59e0b"
        sports_advice = "🟡 Ασφαλής υπαίθρια άθληση για υγιή άτομα. Ευαίσθητοι αθλητές συνιστάται να επιλέξουν απογευματινές ώρες."
        vulnerable_advice = "🟡 Άτομα με αναπνευστικές παθήσεις καλό είναι να αποφεύγουν παρατεταμένη έντονη κόπωση κοντά σε κεντρικές λεωφόρους."
        ventilation_advice = "🪟 Συνιστάται αερισμός νωρίς το πρωί πριν τις ώρες κυκλοφοριακής αιχμής."
        alert = False
    else:
        overall_label = "Επιβαρυμένη Ποιότητα Αέρα (European AQI Level 3 / Alert)"
        color_code = "#ef4444"
        sports_advice = "🔴 Περιορίστε την έντονη υπαίθρια σωματική άσκηση σε υπαίθριους χώρους."
        vulnerable_advice = "🔴 Άτομα με άσθμα, καρδιαγγειακά νοσήματα και παιδιά πρέπει να παραμείνουν σε εσωτερικούς χώρους."
        ventilation_advice = "🪟 Διατηρήστε τα παράθυρα κλειστά κατά τις ώρες αιχμής, χρήση καθαριστή αέρα."
        alert = True

    return CitizenAdvisoryResponse(
        overall_aqi_label=overall_label,
        dominant_pollutant="PM2.5 (Fine Particulate Matter)",
        color_code=color_code,
        outdoor_sports_advice=sports_advice,
        vulnerable_groups_advice=vulnerable_advice,
        indoor_ventilation_advice=ventilation_advice,
        who_alert_active=alert,
        city_summaries=city_summaries
    )
