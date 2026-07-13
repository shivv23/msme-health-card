from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class HealthScoreResponse(BaseModel):
    id: int
    msme_id: int
    overall_score: float
    revenue_stability: float
    payment_discipline: float
    compliance_health: float
    employment_strength: float
    digital_presence: float
    cash_flow_quality: float
    risk_category: str
    strengths: Optional[dict] = None
    weaknesses: Optional[dict] = None
    shap_values: Optional[dict] = None
    data_sources_used: Optional[dict] = None
    assessment_date: datetime
    model_version: str

    model_config = {"from_attributes": True}


class HealthScoreHistoryResponse(BaseModel):
    msme_id: int
    business_name: str
    history: List[HealthScoreResponse]


class CreditAssessmentResponse(BaseModel):
    id: int
    msme_id: int
    health_score_id: int
    recommended_amount: float
    recommended_tenure_months: int
    recommended_rate: float
    eligibility: bool
    confidence_score: float
    risk_factors: Optional[dict] = None
    assessment_date: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_msme: int
    total_assessments: int
    avg_score: float
    green_count: int
    amber_count: int
    red_count: int
    avg_turnover: float
    total_eligible: int


class RiskDistribution(BaseModel):
    green: int
    amber: int
    red: int
    green_pct: float
    amber_pct: float
    red_pct: float


class TopMSMEResponse(BaseModel):
    msme_id: int
    business_name: str
    gst_number: str
    overall_score: float
    risk_category: str
    annual_turnover: float


class RecentAssessmentResponse(BaseModel):
    msme_id: int
    business_name: str
    gst_number: str
    overall_score: float
    risk_category: str
    recommended_amount: float
    assessment_date: datetime
