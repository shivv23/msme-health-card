from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


class MSMERegisterRequest(BaseModel):
    gst_number: str = Field(..., min_length=15, max_length=15, examples=["27AABCU9603R1ZM"])
    business_name: str = Field(..., max_length=255)
    business_type: str = Field(..., pattern=r"^(Manufacturing|Services|Trading|Other)$")
    industry_sector: str = Field(..., max_length=100)
    registration_date: date
    state: str = Field(..., max_length=100)
    city: str = Field(..., max_length=100)
    employee_count: int = Field(..., ge=0)
    annual_turnover: Decimal = Field(..., ge=0)


class MSMEResponse(BaseModel):
    id: int
    gst_number: str
    business_name: str
    business_type: str
    industry_sector: str
    registration_date: date
    state: str
    city: str
    employee_count: int
    annual_turnover: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MSMEListResponse(BaseModel):
    total: int
    msme_list: List[MSMEResponse]
