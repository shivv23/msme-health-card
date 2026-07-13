from decimal import Decimal
from typing import Dict, Any


class CreditRecommender:
    MAX_AMOUNT_RATIO = 0.25
    MIN_AMOUNT = 100000.0
    MAX_AMOUNT = 50000000.0

    def recommend(self, health_score: float, annual_turnover: float, risk_category: str) -> Dict[str, Any]:
        eligible = health_score >= 40

        base_amount = annual_turnover * self.MAX_AMOUNT_RATIO
        score_multiplier = health_score / 100.0
        amount = base_amount * (0.5 + 0.5 * score_multiplier)
        amount = max(self.MIN_AMOUNT, min(self.MAX_AMOUNT, amount))

        if health_score >= 70:
            tenure = 60
            rate = 9.0
        elif health_score >= 55:
            tenure = 48
            rate = 11.0
        elif health_score >= 40:
            tenure = 36
            rate = 13.5
        else:
            tenure = 12
            rate = 16.0

        confidence = min(0.95, health_score / 100 * 0.8 + 0.15)

        risk_factors = []
        if health_score < 50:
            risk_factors.append("Low overall health score")
        if health_score < 40:
            risk_factors.append("High risk category")
        if risk_category == "Amber":
            risk_factors.append("Moderate risk requires monitoring")
        if risk_category == "Red":
            risk_factors.append("Significant financial concerns")

        return {
            "recommended_amount": round(amount, 2),
            "recommended_tenure_months": tenure,
            "recommended_rate": rate,
            "eligibility": eligible,
            "confidence_score": round(confidence, 3),
            "risk_factors": {"factors": risk_factors, "risk_level": risk_category},
        }
