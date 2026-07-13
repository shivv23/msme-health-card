from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.msme import MSME
from app.schemas.msme import MSMERegisterRequest, MSMEResponse, MSMEListResponse

router = APIRouter(prefix="/api/v1/msme", tags=["MSME"])


@router.post("/register", response_model=MSMEResponse, status_code=201)
async def register_msme(payload: MSMERegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(MSME).where(MSME.gst_number == payload.gst_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="MSME with this GST number already exists")

    msme = MSME(
        gst_number=payload.gst_number,
        business_name=payload.business_name,
        business_type=payload.business_type,
        industry_sector=payload.industry_sector,
        registration_date=payload.registration_date,
        state=payload.state,
        city=payload.city,
        employee_count=payload.employee_count,
        annual_turnover=payload.annual_turnover,
    )
    db.add(msme)
    await db.commit()
    await db.refresh(msme)
    return msme


@router.get("/list", response_model=MSMEListResponse)
async def list_msme(
    skip: int = 0,
    limit: int = 20,
    state: Optional[str] = None,
    business_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(MSME)
    count_query = select(func.count(MSME.id))

    if state:
        query = query.where(MSME.state == state)
        count_query = count_query.where(MSME.state == state)
    if business_type:
        query = query.where(MSME.business_type == business_type)
        count_query = count_query.where(MSME.business_type == business_type)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset(skip).limit(limit).order_by(MSME.id.desc())
    result = await db.execute(query)
    msme_list = result.scalars().all()

    return MSMEListResponse(total=total, msme_list=msme_list)


@router.get("/{gst_number}", response_model=MSMEResponse)
async def get_msme(gst_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MSME).where(MSME.gst_number == gst_number))
    msme = result.scalar_one_or_none()
    if not msme:
        raise HTTPException(status_code=404, detail="MSME not found")
    return msme
