import asyncio
import random
from datetime import date, timedelta, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.config import settings
from app.database import Base
from app.models.msme import MSME
from app.models.health_score import HealthScore
from app.models.credit_assessment import CreditAssessment
from app.services.data_aggregator import DataAggregatorService
from app.services.scoring_engine import ScoringEngine
from app.services.credit_recommender import CreditRecommender

STATES_CITIES = [
    ("Maharashtra", "Mumbai"), ("Maharashtra", "Pune"), ("Maharashtra", "Nagpur"),
    ("Karnataka", "Bengaluru"), ("Karnataka", "Mysuru"), ("Karnataka", "Hubballi"),
    ("Tamil Nadu", "Chennai"), ("Tamil Nadu", "Coimbatore"), ("Tamil Nadu", "Madurai"),
    ("Gujarat", "Ahmedabad"), ("Gujarat", "Surat"), ("Gujarat", "Vadodara"),
    ("Delhi", "New Delhi"), ("Delhi", "Noida"), ("Delhi", "Gurugram"),
    ("Uttar Pradesh", "Lucknow"), ("Uttar Pradesh", "Kanpur"), ("Uttar Pradesh", "Agra"),
    ("Rajasthan", "Jaipur"), ("Rajasthan", "Jodhpur"),
    ("West Bengal", "Kolkata"), ("West Bengal", "Howrah"),
    ("Telangana", "Hyderabad"), ("Telangana", "Warangal"),
    ("Madhya Pradesh", "Bhopal"), ("Madhya Pradesh", "Indore"),
    ("Punjab", "Ludhiana"), ("Punjab", "Amritsar"),
    ("Haryana", "Faridabad"), ("Haryana", "Panipat"),
    ("Kerala", "Kochi"), ("Kerala", "Thiruvananthapuram"),
    ("Odisha", "Bhubaneswar"), ("Odisha", "Cuttack"),
    ("Bihar", "Patna"), ("Bihar", "Gaya"),
    ("Assam", "Guwahati"), ("Chhattisgarh", "Raipur"),
    ("Jharkhand", "Ranchi"), ("Goa", "Panaji"),
]

INDUSTRY_SECTORS = [
    "Automotive Components", "Textiles & Garments", "Food Processing",
    "Pharmaceuticals", "IT Services", "Electronics Manufacturing",
    "Chemicals & Dyes", "Plastics & Polymers", "Metal Fabrication",
    "Packaging Solutions", "Agricultural Equipment", "Construction Materials",
    "Paper & Stationery", "Rubber Products", "Glass & Ceramics",
    "Wood & Furniture", "Printing & Publishing", "Leather Goods",
    "Engineering Services", "Logistics & Warehousing",
]

BUSINESS_NAMES = [
    "Shanti Industries", "Ganesh Manufacturing Co", "Patel Engineering Works",
    "Sharma Textiles Pvt Ltd", "Kumar Food Products", "Reddy Pharma Solutions",
    "Singh Steel Fabricators", "Joshi IT Services", "Verma Electronics",
    "Agarwal Chemical Works", "Mehta Plastics Ltd", "Rao Metal Industries",
    "Iyer Packaging Solutions", "Gupta Agro Equipment", "Desai Building Materials",
    "Kapoor Paper Mills", "Nair Rubber Industries", "Choudhary Glass Works",
    "Mishra Wood Products", "Tiwari Printing House", "Jain Leather Exports",
    "Srivastava Engineering", "Bhatt Logistics Pvt", "Chandra Agro Industries",
    "Pandey Food Processing", "Saxena Chemical Industries", "Bhatt Textiles",
    "Malhotra Steel Pipes", "Khatri Garment House", "Bansal Auto Parts",
    "Sinha Engineering Co", "Tripathi Pharma Labs", "Kulkarni Electronics",
    "Pillai IT Solutions", "Menon Chemical Works", "Namboodiri Spices",
    "Thakur Manufacturing", "Rawat Construction Materials", "Chauhan Metal Works",
    "Dixit Paper Products", "Vyas Rubber Industries", "Dave Packaging Co",
    "Shukla Agro Industries", "Tandon Engineering Works", "Kapil Food Products",
    "Bhardwaj Textile Mills", "Goswami Pharma", "Lal IT Services",
    "Saraswat Electronics", "Upadhyaya Chemicals",
]

GST_STATE_CODES = {
    "Maharashtra": 27, "Karnataka": 29, "Tamil Nadu": 33, "Gujarat": 24,
    "Delhi": 7, "Uttar Pradesh": 9, "Rajasthan": 8, "West Bengal": 19,
    "Telangana": 36, "Madhya Pradesh": 23, "Punjab": 3, "Haryana": 6,
    "Kerala": 32, "Odisha": 21, "Bihar": 10, "Assam": 18,
    "Chhattisgarh": 22, "Jharkhand": 20, "Goa": 30,
}


def generate_gst_number(state: str, index: int) -> str:
    code = GST_STATE_CODES.get(state, 27)
    pan = f"AABC{'U' if index % 2 == 0 else 'P'}{1000 + index:04d}R1ZM"
    return f"{code:02d}{pan}Z{chr(65 + index % 26)}"


async def seed():
    connect_args = {}
    engine_kwargs = {"echo": False}
    if settings.is_sqlite:
        connect_args = {"check_same_thread": False}
        engine_kwargs["connect_args"] = connect_args
    else:
        engine_kwargs.update({"pool_size": 5, "max_overflow": 5})

    engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)
    session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    aggregator = DataAggregatorService()
    scoring = ScoringEngine()
    recommender = CreditRecommender()

    random.seed(42)

    async with session_maker() as session:
        for i in range(50):
            state, city = STATES_CITIES[i % len(STATES_CITIES)]
            gst = generate_gst_number(state, i)
            name = BUSINESS_NAMES[i]
            btype = random.choice(["Manufacturing", "Services", "Trading", "Other"])
            sector = INDUSTRY_SECTORS[i % len(INDUSTRY_SECTORS)]
            reg_date = date(2010, 1, 1) + timedelta(days=random.randint(0, 4000))
            emp_count = random.randint(5, 400)
            turnover = Decimal(str(round(random.uniform(500000, 20000000), 2)))

            msme = MSME(
                gst_number=gst,
                business_name=name,
                business_type=btype,
                industry_sector=sector,
                registration_date=reg_date,
                state=state,
                city=city,
                employee_count=emp_count,
                annual_turnover=turnover,
            )
            session.add(msme)
            await session.flush()

            raw_data = await aggregator.aggregate_all(gst)
            raw_data["employee_count"] = emp_count

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
            session.add(health)
            await session.flush()

            credit = recommender.recommend(
                health_score=score_result["overall_score"],
                annual_turnover=float(turnover),
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
            session.add(assessment)

            print(f"  [{i+1:2d}/50] {name} | GST: {gst} | Score: {score_result['overall_score']:5.1f} | {score_result['risk_category']:5s} | Amount: Rs.{credit['recommended_amount']:>12,.2f}")

        await session.commit()

    print(f"\nSeeding complete: 50 MSMEs, 50 health scores, 50 credit assessments created.")
    await engine.dispose()


async def seed_if_empty():
    connect_args = {}
    engine_kwargs = {"echo": False}
    if settings.is_sqlite:
        connect_args = {"check_same_thread": False}
        engine_kwargs["connect_args"] = connect_args
    else:
        engine_kwargs.update({"pool_size": 5, "max_overflow": 5})

    engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)
    session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with session_maker() as session:
        result = await session.execute(select(MSME).limit(1))
        if result.scalar_one_or_none():
            await engine.dispose()
            return

    print("Database empty, seeding 50 MSMEs...")
    await seed()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
