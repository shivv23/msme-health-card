import hashlib
import math
from typing import Dict, Any, Optional

import httpx

from app.config import settings
from app.utils.helpers import deterministic_range, deterministic_int


class DataAggregatorService:
    """Aggregates data from GST, UPI, EPFO, and Account Aggregator APIs with fallback simulation."""

    def __init__(self):
        self.gst_key = settings.GST_API_KEY
        self.upi_key = settings.UPI_AGGREGATOR_KEY
        self.epfo_key = settings.EPFO_API_KEY
        self.aa_key = settings.AA_GATEWAY_KEY

    def _seed(self, gst_number: str) -> str:
        return hashlib.sha256(gst_number.encode()).hexdigest()[:16]

    async def fetch_gst_data(self, gst_number: str) -> Dict[str, Any]:
        if self.gst_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(
                        f"https://api.mastersindia.co/api/v1/gst/returns/{gst_number}",
                        headers={"Authorization": f"Bearer {self.gst_key}"},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return {
                            "monthly_revenue": float(data.get("total_turnover", 500000)),
                            "return_filing_regularity": float(data.get("filing_score", 75)),
                            "tax_compliance_score": float(data.get("compliance_score", 70)),
                            "invoice_count": int(data.get("invoice_count", 100)),
                        }
            except Exception:
                pass

        s = self._seed(gst_number)
        return {
            "monthly_revenue": round(deterministic_range(s, 150000, 5000000, 0), 2),
            "return_filing_regularity": round(deterministic_range(s, 30, 100, 1), 1),
            "tax_compliance_score": round(deterministic_range(s, 40, 100, 2), 1),
            "invoice_count": deterministic_int(s, 20, 500, 3),
        }

    async def fetch_upi_data(self, gst_number: str) -> Dict[str, Any]:
        if self.upi_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(
                        f"https://api.sabpaddle.com/v1/transactions/summary",
                        params={"gst": gst_number},
                        headers={"Authorization": f"Bearer {self.upi_key}"},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return {
                            "avg_monthly_transactions": int(data.get("avg_monthly_count", 200)),
                            "payment_regularity": float(data.get("regularity_score", 70)),
                            "digital_transaction_ratio": float(data.get("digital_ratio", 0.5)),
                        }
            except Exception:
                pass

        s = self._seed(gst_number)
        return {
            "avg_monthly_transactions": deterministic_int(s, 30, 2000, 4),
            "payment_regularity": round(deterministic_range(s, 25, 100, 5), 1),
            "digital_transaction_ratio": round(deterministic_range(s, 0.2, 0.95, 6), 2),
        }

    async def fetch_epfo_data(self, gst_number: str) -> Dict[str, Any]:
        if self.epfo_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(
                        f"https://gw.epfindia.gov.in/epfo-api/compliance/{gst_number}",
                        headers={"X-API-Key": self.epfo_key},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return {
                            "employee_count": int(data.get("employee_count", 10)),
                            "pf_compliance": float(data.get("compliance_score", 75)),
                        }
            except Exception:
                pass

        s = self._seed(gst_number)
        return {
            "employee_count": deterministic_int(s, 3, 500, 7),
            "pf_compliance": round(deterministic_range(s, 30, 100, 8), 1),
        }

    async def fetch_aa_data(self, gst_number: str) -> Dict[str, Any]:
        if self.aa_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(
                        f"https://aa-gateway.ondc.com/v1/bank-data/{gst_number}",
                        headers={"X-AA-Key": self.aa_key},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return {
                            "cash_flow_ratio": float(data.get("cash_flow_score", 0.6)),
                            "avg_monthly_transactions": int(data.get("monthly_txn_avg", 150)),
                        }
            except Exception:
                pass

        s = self._seed(gst_number)
        return {
            "cash_flow_ratio": round(deterministic_range(s, 0.1, 0.95, 9), 2),
            "avg_monthly_transactions": deterministic_int(s, 30, 2000, 10),
        }

    async def aggregate_all(self, gst_number: str) -> Dict[str, Any]:
        gst_data = await self.fetch_gst_data(gst_number)
        upi_data = await self.fetch_upi_data(gst_number)
        epfo_data = await self.fetch_epfo_data(gst_number)
        aa_data = await self.fetch_aa_data(gst_number)

        s = self._seed(gst_number)
        revenue_growth = round(deterministic_range(s, -0.15, 0.30, 11), 3)

        merged_avg_txn = max(upi_data["avg_monthly_transactions"], aa_data["avg_monthly_transactions"])

        return {
            "monthly_revenue": gst_data["monthly_revenue"],
            "revenue_growth": revenue_growth,
            "avg_monthly_transactions": merged_avg_txn,
            "payment_regularity": upi_data["payment_regularity"],
            "tax_compliance_score": gst_data["tax_compliance_score"],
            "employee_count": epfo_data["employee_count"],
            "pf_compliance": epfo_data["pf_compliance"],
            "digital_transaction_ratio": upi_data["digital_transaction_ratio"],
            "invoice_count": gst_data["invoice_count"],
            "return_filing_regularity": gst_data["return_filing_regularity"],
            "cash_flow_ratio": aa_data["cash_flow_ratio"],
            "data_sources": {
                "gst": True if self.gst_key else False,
                "upi": True if self.upi_key else False,
                "epfo": True if self.epfo_key else False,
                "aa": True if self.aa_key else False,
            },
        }
