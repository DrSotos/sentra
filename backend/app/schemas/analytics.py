from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class AnomalyDetectionRequest(BaseModel):
    station_id: str
    metrics: List[str]
    from_time: Optional[datetime] = None
    to_time: Optional[datetime] = None

class AnomalyResponse(BaseModel):
    detected_at: datetime
    metric_name: str
    value: Optional[float] = None
    baseline_mean: Optional[float] = None
    deviation_factor: Optional[float] = None
    anomaly_score: float
    severity: str
    explanation: Optional[str] = None
    recommended_action: Optional[str] = None
    confidence: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class ForecastRequest(BaseModel):
    station_id: str
    metric: str
    periods: int = 24

class ForecastPoint(BaseModel):
    time: datetime
    value: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    station_id: str
    metric: str
    forecast: List[ForecastPoint]

class PolicyBriefResponse(BaseModel):
    report_id: str
    generated_at: datetime
    executive_summary: str
    who_compliance_status: Dict[str, Any]
    station_rankings: List[Dict[str, Any]]
    key_recommendations: List[str]
    disclaimer: str

class ScenarioSimulationRequest(BaseModel):
    station_id: str
    traffic_reduction_pct: float = 20.0        # 0% to 60%
    green_canopy_increase_pct: float = 10.0     # 0% to 40%
    ev_transit_share_pct: float = 25.0          # 0% to 100%

class ScenarioSimulationResponse(BaseModel):
    station_id: str
    station_name: str
    city: str
    baseline_pm25: float
    simulated_pm25: float
    pm25_reduction_pct: float
    baseline_no2: float
    simulated_no2: float
    no2_reduction_pct: float
    health_impact_index: str
    prevented_admissions_annual: int
    who_compliance_reached: bool
    policy_feasibility_score: float
    scientific_summary: str

class CitizenAdvisoryResponse(BaseModel):
    overall_aqi_label: str
    dominant_pollutant: str
    color_code: str
    outdoor_sports_advice: str
    vulnerable_groups_advice: str
    indoor_ventilation_advice: str
    who_alert_active: bool
    city_summaries: List[Dict[str, Any]]
