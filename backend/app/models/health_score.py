from datetime import datetime
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class HealthScore(Base):
    __tablename__ = "health_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    msme_id: Mapped[int] = mapped_column(Integer, ForeignKey("msmes.id"), nullable=False, index=True)
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)
    revenue_stability: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    payment_discipline: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    compliance_health: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    employment_strength: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    digital_presence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cash_flow_quality: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_category: Mapped[str] = mapped_column(String(10), nullable=False)
    strengths: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    shap_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    data_sources_used: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    assessment_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False, default="1.0.0")
