import hashlib
import math
from datetime import date, timedelta
from typing import Any, Dict, Optional


def deterministic_random(seed: str, index: int = 0) -> float:
    """Return a deterministic float in [0, 1) seeded from a string."""
    h = hashlib.sha256(f"{seed}:{index}".encode()).hexdigest()
    return int(h[:8], 16) / 0xFFFFFFFF


def deterministic_range(seed: str, low: float, high: float, index: int = 0) -> float:
    """Return a deterministic float in [low, high)."""
    return low + deterministic_random(seed, index) * (high - low)


def deterministic_int(seed: str, low: int, high: int, index: int = 0) -> int:
    return int(deterministic_range(seed, float(low), float(high) + 0.999, index))


def risk_category_from_score(score: float) -> str:
    if score >= 70:
        return "Green"
    elif score >= 40:
        return "Amber"
    return "Red"


def format_currency(amount: float) -> str:
    if amount >= 1e7:
        return f"₹{amount / 1e7:.2f} Cr"
    elif amount >= 1e5:
        return f"₹{amount / 1e5:.2f} L"
    return f"₹{amount:,.2f}"


def generate_gst_number(state_code: int, pan_suffix: str, index: int) -> str:
    pan = f"AABC{'U' if index % 2 == 0 else 'P'}{1000 + index:04d}{pan_suffix}"
    return f"{state_code:02d}{pan}Z{chr(65 + index % 26)}"
