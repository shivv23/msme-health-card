from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.msme import MSME
from app.models.health_score import HealthScore
from app.models.credit_assessment import CreditAssessment
from app.schemas.health import (
    DashboardStats,
    RiskDistribution,
    TopMSMEResponse,
    RecentAssessmentResponse,
)

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_msme_result = await db.execute(select(func.count(MSME.id)))
    total_msme = total_msme_result.scalar() or 0

    total_assess_result = await db.execute(select(func.count(HealthScore.id)))
    total_assessments = total_assess_result.scalar() or 0

    avg_score_result = await db.execute(select(func.avg(HealthScore.overall_score)))
    avg_score = avg_score_result.scalar() or 0.0

    green_result = await db.execute(
        select(func.count(HealthScore.id)).where(HealthScore.risk_category == "Green")
    )
    green_count = green_result.scalar() or 0

    amber_result = await db.execute(
        select(func.count(HealthScore.id)).where(HealthScore.risk_category == "Amber")
    )
    amber_count = amber_result.scalar() or 0

    red_result = await db.execute(
        select(func.count(HealthScore.id)).where(HealthScore.risk_category == "Red")
    )
    red_count = red_result.scalar() or 0

    avg_turnover_result = await db.execute(select(func.avg(MSME.annual_turnover)))
    avg_turnover = float(avg_turnover_result.scalar() or 0)

    eligible_result = await db.execute(
        select(func.count(CreditAssessment.id)).where(CreditAssessment.eligibility == True)
    )
    total_eligible = eligible_result.scalar() or 0

    return DashboardStats(
        total_msme=total_msme,
        total_assessments=total_assessments,
        avg_score=round(float(avg_score), 1),
        green_count=green_count,
        amber_count=amber_count,
        red_count=red_count,
        avg_turnover=round(avg_turnover, 2),
        total_eligible=total_eligible,
    )


@router.get("/risk-distribution", response_model=RiskDistribution)
async def get_risk_distribution(db: AsyncSession = Depends(get_db)):
    total_result = await db.execute(select(func.count(HealthScore.id)))
    total = total_result.scalar() or 1

    green_result = await db.execute(
        select(func.count(HealthScore.id)).where(HealthScore.risk_category == "Green")
    )
    green = green_result.scalar() or 0

    amber_result = await db.execute(
        select(func.count(HealthScore.id)).where(HealthScore.risk_category == "Amber")
    )
    amber = amber_result.scalar() or 0

    red_result = await db.execute(
        select(func.count(HealthScore.id)).where(HealthScore.risk_category == "Red")
    )
    red = red_result.scalar() or 0

    return RiskDistribution(
        green=green,
        amber=amber,
        red=red,
        green_pct=round(green / total * 100, 1),
        amber_pct=round(amber / total * 100, 1),
        red_pct=round(red / total * 100, 1),
    )


@router.get("/top-msmes", response_model=list[TopMSMEResponse])
async def get_top_msme(limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HealthScore, MSME)
        .join(MSME, MSME.id == HealthScore.msme_id)
        .order_by(HealthScore.overall_score.desc())
        .limit(limit)
    )
    rows = result.all()
    return [
        TopMSMEResponse(
            msme_id=msme.id,
            business_name=msme.business_name,
            gst_number=msme.gst_number,
            overall_score=hs.overall_score,
            risk_category=hs.risk_category,
            annual_turnover=float(msme.annual_turnover),
        )
        for hs, msme in rows
    ]


@router.get("/recent-assessments", response_model=list[RecentAssessmentResponse])
async def get_recent_assessments(limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HealthScore, MSME, CreditAssessment)
        .join(MSME, MSME.id == HealthScore.msme_id)
        .outerjoin(CreditAssessment, CreditAssessment.health_score_id == HealthScore.id)
        .order_by(HealthScore.assessment_date.desc())
        .limit(limit)
    )
    rows = result.all()
    return [
        RecentAssessmentResponse(
            msme_id=msme.id,
            business_name=msme.business_name,
            gst_number=msme.gst_number,
            overall_score=hs.overall_score,
            risk_category=hs.risk_category,
            recommended_amount=float(credit.recommended_amount) if credit else 0.0,
            assessment_date=hs.assessment_date,
        )
        for hs, msme, credit in rows
    ]
