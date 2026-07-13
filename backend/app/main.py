import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import init_db, async_session_maker
from app.ml.model import train_and_save_model
from app.api.msme import router as msme_router
from app.api.health import router as health_router
from app.api.dashboard import router as dashboard_router
from app.api.auth import router as auth_router
from app.api.notifications import router as notification_router
from app.api.exports import router as export_router
from app.api.analytics import router as analytics_router
from app.models.msme import MSME
from app.models.credit_assessment import CreditAssessment
from app.models.user import User
from app.schemas.health import CreditAssessmentResponse
from app.services.auth_service import hash_password


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


async def create_default_users(db: AsyncSession):
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none():
        return

    admin = User(
        email="admin@msme.com",
        full_name="System Admin",
        hashed_password=hash_password("admin123"),
        role="admin",
        phone=None,
        is_active=True,
    )
    officer = User(
        email="officer@msme.com",
        full_name="Credit Officer",
        hashed_password=hash_password("officer123"),
        role="officer",
        phone=None,
        is_active=True,
    )
    db.add(admin)
    db.add(officer)
    await db.commit()
    print("Default users created: admin@msme.com / officer@msme.com")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs(settings.ML_MODEL_PATH, exist_ok=True)
    train_and_save_model(settings.ML_MODEL_PATH)

    from seed_data import seed_if_empty
    await seed_if_empty()

    async with async_session_maker() as db:
        await create_default_users(db)

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
app.include_router(auth_router)
app.include_router(notification_router)
app.include_router(export_router)
app.include_router(analytics_router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "msme-health-card"}
