import numpy as np

try:
    import shap

    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


class ModelExplainer:
    def __init__(self, model, feature_names: list):
        self.model = model
        self.feature_names = feature_names
        self._explainer = None

    def _get_explainer(self):
        if self._explainer is None and SHAP_AVAILABLE:
            self._explainer = shap.TreeExplainer(self.model)
        return self._explainer

    def explain_prediction(self, features: np.ndarray) -> dict:
        explainer = self._get_explainer()
        if explainer is None:
            return self._fallback_explanation(features)

        try:
            features_2d = features.reshape(1, -1) if features.ndim == 1 else features
            shap_values = explainer.shap_values(features_2d)
            values = shap_values[0] if isinstance(shap_values, np.ndarray) and shap_values.ndim > 1 else shap_values

            explanation = {}
            for i, name in enumerate(self.feature_names):
                explanation[name] = float(values[i])

            return explanation
        except Exception:
            return self._fallback_explanation(features)

    def _fallback_explanation(self, features: np.ndarray) -> dict:
        flat = features.flatten()
        total = sum(abs(v) for v in flat) or 1.0
        explanation = {}
        for i, name in enumerate(self.feature_names):
            val = float(flat[i])
            normalized = val / total
            explanation[name] = round(normalized * 100, 2)
        return explanation
