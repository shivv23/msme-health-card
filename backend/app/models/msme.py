from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import Integer, String, Date, DateTime, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class MSME(Base):
    __tablename__ = "msmes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    gst_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_type: Mapped[str] = mapped_column(String(50), nullable=False)
    industry_sector: Mapped[str] = mapped_column(String(100), nullable=False)
    registration_date: Mapped[date] = mapped_column(Date, nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    employee_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    annual_turnover: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
