from datetime import datetime
from decimal import Decimal
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, Boolean, Numeric, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CreditAssessment(Base):
    __tablename__ = "credit_assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    msme_id: Mapped[int] = mapped_column(Integer, ForeignKey("msmes.id"), nullable=False, index=True)
    health_score_id: Mapped[int] = mapped_column(Integer, ForeignKey("health_scores.id"), nullable=False)
    recommended_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    recommended_tenure_months: Mapped[int] = mapped_column(Integer, nullable=False)
    recommended_rate: Mapped[float] = mapped_column(Float, nullable=False)
    eligibility: Mapped[bool] = mapped_column(Boolean, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_factors: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    assessment_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
