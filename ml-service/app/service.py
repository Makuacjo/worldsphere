"""Model loading, prediction, and dataset-derived insights."""
from __future__ import annotations

import os
import json

import joblib
import pandas as pd

import common as C


class Model:
    def __init__(self) -> None:
        self.pipe = None
        self.df: pd.DataFrame | None = None
        self.meta: dict | None = None
        self.load()

    def load(self) -> None:
        if all(os.path.exists(p) for p in (C.MODEL_PATH, C.DATASET_PATH, C.META_PATH)):
            self.pipe = joblib.load(C.MODEL_PATH)
            self.df = pd.read_csv(C.DATASET_PATH)
            with open(C.META_PATH) as fh:
                self.meta = json.load(fh)

    @property
    def ready(self) -> bool:
        return self.pipe is not None and self.df is not None and self.meta is not None

    def predict(self, payload: dict) -> dict:
        row = pd.DataFrame([{f: payload[f] for f in C.FEATURE_ORDER}])[C.FEATURE_ORDER]
        proba = self.pipe.predict_proba(row)[0]
        classes = list(self.pipe.classes_)
        probs = [{"category": c, "probability": float(p)} for c, p in zip(classes, proba)]
        # Order LC → CR for a consistent chart.
        probs.sort(key=lambda x: C.CATEGORIES.index(x["category"]) if x["category"] in C.CATEGORIES else 99)
        top = max(probs, key=lambda x: x["probability"])
        return {
            "predicted_category": top["category"],
            "category_label": C.CATEGORY_LABELS.get(top["category"], top["category"]),
            "probabilities": probs,
        }

    def insights(self) -> dict:
        df = self.df
        assert df is not None and self.meta is not None

        def dist(col: str) -> dict[str, int]:
            return {str(k): int(v) for k, v in df[col].value_counts().items()}

        def buckets(col: str, edges: list[float], labels: list[str]) -> list[dict]:
            out = []
            for i, label in enumerate(labels):
                sub = df[(df[col] >= edges[i]) & (df[col] < edges[i + 1])]
                rate = float(sub["category"].isin(list(C.HIGH_RISK)).mean()) if len(sub) else 0.0
                out.append({"bucket": label, "species_count": int(len(sub)), "high_risk_rate": rate})
            return out

        avg_range = {str(k): float(v) for k, v in df.groupby("category")["range_size_km2"].mean().items()}

        return {
            "total_species": int(len(df)),
            "category_distribution": dist("category"),
            "class_distribution": dist("class"),
            "population_trend_distribution": dist("population_trend"),
            "feature_importance": self.meta["feature_importance"],
            "model_accuracy": float(self.meta["accuracy"]),
            "average_range_size_by_category": avg_range,
            "risk_by_generation_length": buckets(
                "generation_length_years", [0, 5, 10, 20, 1e9], ["0–5y", "5–10y", "10–20y", "20y+"]
            ),
            "risk_by_range_size": buckets(
                "range_size_km2", [0, 1000, 10000, 100000, 1e12], ["<1k km²", "1k–10k", "10k–100k", "100k+"]
            ),
        }
