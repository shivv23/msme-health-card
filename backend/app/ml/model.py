import os
import numpy as np
import joblib
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split

FEATURE_NAMES = [
    "monthly_revenue",
    "revenue_growth",
    "avg_transactions",
    "payment_regularity",
    "tax_compliance",
    "employee_count",
    "pf_compliance",
    "digital_ratio",
    "invoice_count",
    "return_filing_score",
    "cash_flow_ratio",
]


def generate_training_data(n_samples: int = 1000, seed: int = 42) -> tuple:
    np.random.seed(seed)

    X = np.column_stack([
        np.random.lognormal(mean=11, sigma=1.5, size=n_samples),          # monthly_revenue
        np.random.normal(0.05, 0.15, n_samples),                          # revenue_growth
        np.random.lognormal(mean=6, sigma=1.0, size=n_samples),           # avg_transactions
        np.clip(np.random.beta(5, 2, n_samples) * 100, 0, 100),          # payment_regularity
        np.clip(np.random.beta(6, 2, n_samples) * 100, 0, 100),          # tax_compliance
        np.random.lognormal(mean=2.5, sigma=1.0, size=n_samples),        # employee_count
        np.clip(np.random.beta(4, 2, n_samples) * 100, 0, 100),          # pf_compliance
        np.clip(np.random.beta(3, 3, n_samples), 0, 1),                  # digital_ratio
        np.random.lognormal(mean=4, sigma=1.0, size=n_samples),          # invoice_count
        np.clip(np.random.beta(5, 2, n_samples) * 100, 0, 100),          # return_filing_score
        np.clip(np.random.normal(0.6, 0.2, n_samples), 0, 1),            # cash_flow_ratio
    ])

    y = (
        0.20 * np.clip(X[:, 0] / np.percentile(X[:, 0], 95), 0, 1) * 100
        + 0.15 * X[:, 3]
        + 0.18 * X[:, 4]
        + 0.12 * np.clip(X[:, 5] / 100, 0, 1) * 100
        + 0.10 * X[:, 7] * 100
        + 0.10 * X[:, 9]
        + 0.15 * X[:, 10] * 100
        + np.random.normal(0, 5, n_samples)
    )
    y = np.clip(y, 0, 100)

    return X, y, FEATURE_NAMES


def train_and_save_model(model_path: str) -> None:
    from xgboost import XGBRegressor

    os.makedirs(model_path, exist_ok=True)
    model_file = os.path.join(model_path, "xgb_model.joblib")
    feature_file = os.path.join(model_path, "feature_names.joblib")

    if os.path.exists(model_file):
        return

    X, y, feature_names = generate_training_data(n_samples=500)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBRegressor(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective="reg:squarederror",
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    joblib.dump(model, model_file)
    joblib.dump(feature_names, feature_file)


def load_model(model_path: str):
    model_file = os.path.join(model_path, "xgb_model.joblib")
    feature_file = os.path.join(model_path, "feature_names.joblib")

    if not os.path.exists(model_file):
        train_and_save_model(model_path)

    model = joblib.load(model_file)
    feature_names = joblib.load(feature_file)
    return model, feature_names
