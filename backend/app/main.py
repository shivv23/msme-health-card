import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import init_db, get_db
from app.ml.model import train_and_save_model
from app.api.msme import router as msme_router
from app.api.health import router as health_router
from app.api.dashboard import router as dashboard_router
from app.models.msme import MSME
from app.models.credit_assessment import CreditAssessment
from app.schemas.health import CreditAssessmentResponse


credit_router = APIRouter(prefix="/api/v1/credit", tags=["Credit"])


@credit_router.get("/{msme_id}", response_model=CreditAssessmentResponse)
async def get_credit_assessment(msme_id: int, db: AsyncSession = Depends(get_db)):
    msme_check = await db.execute(select(MSME).where(MSME.id == msme_id))
    if not msme_check.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="MSME not found")

    result = await db.execute(
        select(CreditAssessment)
        .where(CreditAssessment.msme_id == msme_id)
        .order_by(CreditAssessment.assessment_date.desc())
        .limit(1)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="No credit assessment found")
    return assessment


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs(settings.ML_MODEL_PATH, exist_ok=True)
    train_and_save_model(settings.ML_MODEL_PATH)
    yield


app = FastAPI(
    title="MSME Financial Health Card API",
    description="Backend API for MSME Financial Health Assessment and Credit Recommendation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(msme_router)
app.include_router(health_router)
app.include_router(dashboard_router)
app.include_router(credit_router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "msme-health-card"}
