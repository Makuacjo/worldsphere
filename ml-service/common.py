"""Shared constants, the synthetic dataset, and artifact paths for the ml-service.

The dataset is a synthetic, IUCN-style starter set — swap in real occurrence /
Red List data later without changing the API contract.
"""
from __future__ import annotations

import os
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS = os.path.join(ROOT, "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS, "model.joblib")
DATASET_PATH = os.path.join(ARTIFACTS, "dataset.csv")
META_PATH = os.path.join(ARTIFACTS, "meta.json")

# Feature domains — must match the frontend union types in conservationApi.ts.
CLASSES = ["Mammalia", "Aves", "Reptilia", "Amphibia", "Actinopterygii"]
HABITATS = ["Forest", "Grassland", "Wetland", "Marine", "Freshwater", "Desert", "Mountain"]
REGIONS = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"]
TRENDS = ["Decreasing", "Stable", "Increasing", "Unknown"]

CATEGORIES = ["LC", "NT", "VU", "EN", "CR"]
CATEGORY_LABELS = {
    "LC": "Least Concern",
    "NT": "Near Threatened",
    "VU": "Vulnerable",
    "EN": "Endangered",
    "CR": "Critically Endangered",
}
HIGH_RISK = {"VU", "EN", "CR"}

CATEGORICAL = ["class", "habitat", "region", "population_trend"]
NUMERIC = ["range_size_km2", "generation_length_years"]
FEATURE_ORDER = CATEGORICAL + NUMERIC


def generate_dataset(n: int = 600, seed: int = 42) -> pd.DataFrame:
    """Generate a synthetic species dataset with a plausible risk signal."""
    rng = np.random.default_rng(seed)

    cls = rng.choice(CLASSES, n)
    hab = rng.choice(HABITATS, n)
    reg = rng.choice(REGIONS, n)
    trend = rng.choice(TRENDS, n, p=[0.4, 0.3, 0.15, 0.15])
    range_km2 = np.round(rng.lognormal(mean=8.5, sigma=1.8, size=n)).astype(float)
    gen_len = np.round(rng.lognormal(mean=1.6, sigma=0.7, size=n), 1)

    # Latent threat score — higher means more threatened.
    score = np.zeros(n)
    score += (trend == "Decreasing") * 1.4 + (trend == "Unknown") * 0.5 - (trend == "Increasing") * 0.8
    score += (range_km2 < 5000) * 1.3 + (range_km2 < 500) * 1.1 - (range_km2 > 200000) * 0.8
    score += (gen_len > 12) * 1.0 + (gen_len > 20) * 0.7
    score += np.isin(hab, ["Marine", "Wetland", "Freshwater"]).astype(float) * 0.4
    score += np.isin(cls, ["Amphibia", "Reptilia"]).astype(float) * 0.5
    score += rng.normal(0, 0.6, n)

    cats = np.empty(n, dtype=object)
    cats[:] = "LC"
    cats[score > 0.2] = "NT"
    cats[score > 1.0] = "VU"
    cats[score > 1.9] = "EN"
    cats[score > 2.8] = "CR"

    return pd.DataFrame({
        "class": cls,
        "habitat": hab,
        "region": reg,
        "population_trend": trend,
        "range_size_km2": range_km2,
        "generation_length_years": gen_len,
        "category": cats,
    })
