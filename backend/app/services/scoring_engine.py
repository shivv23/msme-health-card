import numpy as np
from typing import Dict, Any, List

from app.ml.model import load_model, FEATURE_NAMES
from app.ml.explainer import ModelExplainer
from app.config import settings
from app.utils.helpers import risk_category_from_score


class ScoringEngine:
    WEIGHTS = {
        "revenue_stability": 0.25,
        "payment_discipline": 0.20,
        "compliance_health": 0.20,
        "cash_flow_quality": 0.15,
        "employment_strength": 0.10,
        "digital_presence": 0.10,
    }

    def __init__(self):
        self.model, self.feature_names = load_model(settings.ML_MODEL_PATH)
        self.explainer = ModelExplainer(self.model, self.feature_names)
        self._version = "1.0.0"

    def _clamp(self, val: float) -> float:
        return max(0.0, min(100.0, val))

    def _compute_revenue_stability(self, data: Dict[str, Any]) -> float:
        monthly_rev = data.get("monthly_revenue", 0)
        growth = data.get("revenue_growth", 0)
        rev_score = min(100, (monthly_rev / 50000) * 20)
        growth_score = max(0, min(100, 50 + growth * 200))
        return self._clamp(0.6 * rev_score + 0.4 * growth_score)

    def _compute_payment_discipline(self, data: Dict[str, Any]) -> float:
        return self._clamp(data.get("payment_regularity", 50))

    def _compute_compliance_health(self, data: Dict[str, Any]) -> float:
        tax = data.get("tax_compliance_score", 50)
        filing = data.get("return_filing_regularity", 50)
        pf = data.get("pf_compliance", 50)
        return self._clamp(0.4 * tax + 0.35 * filing + 0.25 * pf)

    def _compute_employment_strength(self, data: Dict[str, Any]) -> float:
        emp = data.get("employee_count", 0)
        pf = data.get("pf_compliance", 0)
        emp_score = min(100, emp * 2)
        return self._clamp(0.6 * emp_score + 0.4 * pf)

    def _compute_digital_presence(self, data: Dict[str, Any]) -> float:
        ratio = data.get("digital_transaction_ratio", 0)
        txn = data.get("avg_monthly_transactions", 0)
        txn_score = min(100, txn / 20)
        return self._clamp(0.6 * ratio * 100 + 0.4 * txn_score)

    def _compute_cash_flow_quality(self, data: Dict[str, Any]) -> float:
        cfr = data.get("cash_flow_ratio", 0.5)
        invoices = data.get("invoice_count", 0)
        inv_score = min(100, invoices / 5)
        return self._clamp(0.7 * cfr * 100 + 0.3 * inv_score)

    def compute_score(self, msme_data: Dict[str, Any]) -> Dict[str, Any]:
        dimensions = {
            "revenue_stability": self._compute_revenue_stability(msme_data),
            "payment_discipline": self._compute_payment_discipline(msme_data),
            "compliance_health": self._compute_compliance_health(msme_data),
            "employment_strength": self._compute_employment_strength(msme_data),
            "digital_presence": self._compute_digital_presence(msme_data),
            "cash_flow_quality": self._compute_cash_flow_quality(msme_data),
        }

        overall = sum(self.WEIGHTS[dim] * score for dim, score in dimensions.items())
        overall = self._clamp(overall)

        features = np.array([
            msme_data.get("monthly_revenue", 0),
            msme_data.get("revenue_growth", 0),
            msme_data.get("avg_monthly_transactions", 0),
            msme_data.get("payment_regularity", 50),
            msme_data.get("tax_compliance_score", 50),
            msme_data.get("employee_count", 10),
            msme_data.get("pf_compliance", 50),
            msme_data.get("digital_transaction_ratio", 0.5),
            msme_data.get("invoice_count", 50),
            msme_data.get("return_filing_regularity", 50),
            msme_data.get("cash_flow_ratio", 0.5),
        ])

        shap_values = self.explainer.explain_prediction(features)

        strengths = []
        weaknesses = []
        for dim, score in dimensions.items():
            if score >= 70:
                strengths.append({"dimension": dim, "score": round(score, 1)})
            elif score < 50:
                weaknesses.append({"dimension": dim, "score": round(score, 1)})

        data_sources = msme_data.get("data_sources", {})

        return {
            "overall_score": round(overall, 1),
            "dimensions": {k: round(v, 1) for k, v in dimensions.items()},
            "risk_category": risk_category_from_score(overall),
            "strengths": strengths,
            "weaknesses": weaknesses,
            "shap_values": shap_values,
            "data_sources_used": data_sources,
            "model_version": self._version,
        }
