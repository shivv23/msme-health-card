from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.msme import MSME
from app.models.health_score import HealthScore
from app.models.credit_assessment import CreditAssessment
from app.schemas.health import (
    HealthScoreResponse,
    HealthScoreHistoryResponse,
    CreditAssessmentResponse,
)
from app.services.data_aggregator import DataAggregatorService
from app.services.scoring_engine import ScoringEngine
from app.services.credit_recommender import CreditRecommender

router = APIRouter(prefix="/api/v1/health", tags=["Health Assessment"])

aggregator = DataAggregatorService()


@router.post("/assess/{gst_number}", response_model=HealthScoreResponse)
async def assess_health(gst_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MSME).where(MSME.gst_number == gst_number))
    msme = result.scalar_one_or_none()
    if not msme:
        raise HTTPException(status_code=404, detail="MSME not found. Register first.")

    raw_data = await aggregator.aggregate_all(gst_number)

    scoring = ScoringEngine()
    score_result = scoring.compute_score(raw_data)

    health = HealthScore(
        msme_id=msme.id,
        overall_score=score_result["overall_score"],
        revenue_stability=score_result["dimensions"]["revenue_stability"],
        payment_discipline=score_result["dimensions"]["payment_discipline"],
        compliance_health=score_result["dimensions"]["compliance_health"],
        employment_strength=score_result["dimensions"]["employment_strength"],
        digital_presence=score_result["dimensions"]["digital_presence"],
        cash_flow_quality=score_result["dimensions"]["cash_flow_quality"],
        risk_category=score_result["risk_category"],
        strengths=score_result["strengths"],
        weaknesses=score_result["weaknesses"],
        shap_values=score_result["shap_values"],
        data_sources_used=score_result["data_sources_used"],
        model_version=score_result["model_version"],
    )
    db.add(health)
    await db.flush()

    recommender = CreditRecommender()
    credit = recommender.recommend(
        health_score=score_result["overall_score"],
        annual_turnover=float(msme.annual_turnover),
        risk_category=score_result["risk_category"],
    )

    assessment = CreditAssessment(
        msme_id=msme.id,
        health_score_id=health.id,
        recommended_amount=credit["recommended_amount"],
        recommended_tenure_months=credit["recommended_tenure_months"],
        recommended_rate=credit["recommended_rate"],
        eligibility=credit["eligibility"],
        confidence_score=credit["confidence_score"],
        risk_factors=credit["risk_factors"],
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(health)
    return health


@router.get("/{msme_id}", response_model=HealthScoreResponse)
async def get_latest_health(msme_id: int, db: AsyncSession = Depends(get_db)):
    msme_check = await db.execute(select(MSME).where(MSME.id == msme_id))
    if not msme_check.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="MSME not found")

    result = await db.execute(
        select(HealthScore)
        .where(HealthScore.msme_id == msme_id)
        .order_by(HealthScore.assessment_date.desc())
        .limit(1)
    )
    health = result.scalar_one_or_none()
    if not health:
        raise HTTPException(status_code=404, detail="No assessment found for this MSME")
    return health


@router.get("/{msme_id}/history", response_model=HealthScoreHistoryResponse)
async def get_health_history(msme_id: int, db: AsyncSession = Depends(get_db)):
    msme_result = await db.execute(select(MSME).where(MSME.id == msme_id))
    msme = msme_result.scalar_one_or_none()
    if not msme:
        raise HTTPException(status_code=404, detail="MSME not found")

    result = await db.execute(
        select(HealthScore)
        .where(HealthScore.msme_id == msme_id)
        .order_by(HealthScore.assessment_date.desc())
    )
    history = result.scalars().all()
    return HealthScoreHistoryResponse(
        msme_id=msme.id,
        business_name=msme.business_name,
        history=history,
    )

