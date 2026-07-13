import csv
import io
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.msme import MSME
from app.models.health_score import HealthScore
from app.models.credit_assessment import CreditAssessment
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/v1/export", tags=["Export"])


@router.get("/csv")
async def export_all_csv(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MSME, HealthScore, CreditAssessment)
        .outerjoin(HealthScore, HealthScore.msme_id == MSME.id)
        .outerjoin(CreditAssessment, CreditAssessment.health_score_id == HealthScore.id)
        .order_by(MSME.id)
    )
    rows = result.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "GST Number", "Business Name", "Business Type", "Industry Sector",
        "State", "City", "Employees", "Annual Turnover",
        "Overall Score", "Risk Category", "Revenue Stability",
        "Payment Discipline", "Compliance Health", "Employment Strength",
        "Digital Presence", "Cash Flow Quality",
        "Credit Eligible", "Recommended Amount", "Recommended Tenure (Months)",
        "Recommended Rate", "Confidence Score",
    ])

    for msme, health, credit in rows:
        writer.writerow([
            msme.id,
            msme.gst_number,
            msme.business_name,
            msme.business_type,
            msme.industry_sector,
            msme.state,
            msme.city,
            msme.employee_count,
            float(msme.annual_turnover),
            health.overall_score if health else "",
            health.risk_category if health else "",
            health.revenue_stability if health else "",
            health.payment_discipline if health else "",
            health.compliance_health if health else "",
            health.employment_strength if health else "",
            health.digital_presence if health else "",
            health.cash_flow_quality if health else "",
            credit.eligibility if credit else "",
            float(credit.recommended_amount) if credit else "",
            credit.recommended_tenure_months if credit else "",
            credit.recommended_rate if credit else "",
            credit.confidence_score if credit else "",
        ])

    output.seek(0)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=msme_export_{timestamp}.csv"},
    )


@router.get("/csv/{msme_id}")
async def export_single_csv(
    msme_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    msme_result = await db.execute(select(MSME).where(MSME.id == msme_id))
    msme = msme_result.scalar_one_or_none()
    if not msme:
        raise HTTPException(status_code=404, detail="MSME not found")

    health_result = await db.execute(
        select(HealthScore)
        .where(HealthScore.msme_id == msme_id)
        .order_by(HealthScore.assessment_date.desc())
    )
    health = health_result.scalars().first()

    credit_result = await db.execute(
        select(CreditAssessment)
        .where(CreditAssessment.msme_id == msme_id)
        .order_by(CreditAssessment.assessment_date.desc())
    )
    credit = credit_result.scalars().first()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Field", "Value"])
    writer.writerow(["MSME ID", msme.id])
    writer.writerow(["GST Number", msme.gst_number])
    writer.writerow(["Business Name", msme.business_name])
    writer.writerow(["Business Type", msme.business_type])
    writer.writerow(["Industry Sector", msme.industry_sector])
    writer.writerow(["State", msme.state])
    writer.writerow(["City", msme.city])
    writer.writerow(["Employees", msme.employee_count])
    writer.writerow(["Annual Turnover", float(msme.annual_turnover)])
    writer.writerow(["Created At", msme.created_at.isoformat() if msme.created_at else ""])
    if health:
        writer.writerow([])
        writer.writerow(["--- Health Assessment ---", ""])
        writer.writerow(["Overall Score", health.overall_score])
        writer.writerow(["Risk Category", health.risk_category])
        writer.writerow(["Revenue Stability", health.revenue_stability])
        writer.writerow(["Payment Discipline", health.payment_discipline])
        writer.writerow(["Compliance Health", health.compliance_health])
        writer.writerow(["Employment Strength", health.employment_strength])
        writer.writerow(["Digital Presence", health.digital_presence])
        writer.writerow(["Cash Flow Quality", health.cash_flow_quality])
        writer.writerow(["Assessment Date", health.assessment_date.isoformat() if health.assessment_date else ""])
    if credit:
        writer.writerow([])
        writer.writerow(["--- Credit Assessment ---", ""])
        writer.writerow(["Eligible", credit.eligibility])
        writer.writerow(["Recommended Amount", float(credit.recommended_amount)])
        writer.writerow(["Tenure (Months)", credit.recommended_tenure_months])
        writer.writerow(["Interest Rate", credit.recommended_rate])
        writer.writerow(["Confidence Score", credit.confidence_score])

    output.seek(0)
    filename = f"msme_{msme.gst_number}_report.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/pdf/{msme_id}")
async def generate_pdf_report(
    msme_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    msme_result = await db.execute(select(MSME).where(MSME.id == msme_id))
    msme = msme_result.scalar_one_or_none()
    if not msme:
        raise HTTPException(status_code=404, detail="MSME not found")

    health_result = await db.execute(
        select(HealthScore)
        .where(HealthScore.msme_id == msme_id)
        .order_by(HealthScore.assessment_date.desc())
    )
    health = health_result.scalars().first()

    credit_result = await db.execute(
        select(CreditAssessment)
        .where(CreditAssessment.msme_id == msme_id)
        .order_by(CreditAssessment.assessment_date.desc())
    )
    credit = credit_result.scalars().first()

    report = {
        "title": "MSME Financial Health Report",
        "generated_at": datetime.utcnow().isoformat(),
        "msme": {
            "id": msme.id,
            "gst_number": msme.gst_number,
            "business_name": msme.business_name,
            "business_type": msme.business_type,
            "industry_sector": msme.industry_sector,
            "state": msme.state,
            "city": msme.city,
            "employee_count": msme.employee_count,
            "annual_turnover": float(msme.annual_turnover),
        },
        "health_assessment": None,
        "credit_assessment": None,
    }

    if health:
        report["health_assessment"] = {
            "overall_score": health.overall_score,
            "risk_category": health.risk_category,
            "dimensions": {
                "revenue_stability": health.revenue_stability,
                "payment_discipline": health.payment_discipline,
                "compliance_health": health.compliance_health,
                "employment_strength": health.employment_strength,
                "digital_presence": health.digital_presence,
                "cash_flow_quality": health.cash_flow_quality,
            },
            "strengths": health.strengths,
            "weaknesses": health.weaknesses,
            "assessment_date": health.assessment_date.isoformat() if health.assessment_date else None,
        }

    if credit:
        report["credit_assessment"] = {
            "eligible": credit.eligibility,
            "recommended_amount": float(credit.recommended_amount),
            "tenure_months": credit.recommended_tenure_months,
            "interest_rate": credit.recommended_rate,
            "confidence_score": credit.confidence_score,
            "risk_factors": credit.risk_factors,
        }

    return report
