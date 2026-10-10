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
