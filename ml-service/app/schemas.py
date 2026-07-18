"""Pydantic schemas — mirror the TypeScript contract in src/services/conservationApi.ts."""
from __future__ import annotations

from pydantic import BaseModel, Field, ConfigDict


class PredictionRequest(BaseModel):
    # `class` is a Python keyword, so accept it via alias.
    model_config = ConfigDict(populate_by_name=True)

    class_: str = Field(alias="class")
    habitat: str
    region: str
    population_trend: str
    range_size_km2: float
    generation_length_years: float


class CategoryProbability(BaseModel):
    category: str
    probability: float


class PredictionResponse(BaseModel):
    predicted_category: str
    category_label: str
    probabilities: list[CategoryProbability]


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class RiskByBucket(BaseModel):
    bucket: str
    species_count: int
    high_risk_rate: float


class InsightsResponse(BaseModel):
    total_species: int
    category_distribution: dict[str, int]
    class_distribution: dict[str, int]
    population_trend_distribution: dict[str, int]
    feature_importance: list[FeatureImportance]
    model_accuracy: float
    average_range_size_by_category: dict[str, float]
    risk_by_generation_length: list[RiskByBucket]
    risk_by_range_size: list[RiskByBucket]
