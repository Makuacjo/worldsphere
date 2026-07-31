"""Train the conservation-risk model and write artifacts.

Run from the ml-service directory:

    python model/train.py

Produces artifacts/model.joblib, artifacts/dataset.csv, artifacts/meta.json.
"""
from __future__ import annotations

import os
import sys
import json

# Make the ml-service root importable when run as `python model/train.py`.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

import common as C


def build_pipeline() -> Pipeline:
    pre = ColumnTransformer(
        [("cat", OneHotEncoder(handle_unknown="ignore"), C.CATEGORICAL)],
        remainder="passthrough",
    )
    clf = RandomForestClassifier(n_estimators=250, random_state=42, n_jobs=1)
    return Pipeline([("pre", pre), ("clf", clf)])


def aggregate_importances(pipe: Pipeline) -> list[dict]:
    """Sum one-hot importances back onto the original named features."""
    ohe = pipe.named_steps["pre"].named_transformers_["cat"]
    names = list(ohe.get_feature_names_out(C.CATEGORICAL)) + C.NUMERIC
    importances = pipe.named_steps["clf"].feature_importances_

    agg = {f: 0.0 for f in C.FEATURE_ORDER}
    for name, val in zip(names, importances):
        base = name
        for f in C.CATEGORICAL:
            if name.startswith(f + "_"):
                base = f
                break
        agg[base] += float(val)

    total = sum(agg.values()) or 1.0
    ordered = sorted(agg, key=lambda f: agg[f], reverse=True)
    return [{"feature": f, "importance": agg[f] / total} for f in ordered]


def main() -> None:
    os.makedirs(C.ARTIFACTS, exist_ok=True)
    df = C.generate_dataset()
    X, y = df[C.FEATURE_ORDER], df["category"]

    # Honest holdout accuracy first...
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    pipe = build_pipeline()
    pipe.fit(X_tr, y_tr)
    accuracy = accuracy_score(y_te, pipe.predict(X_te))
    feature_importance = aggregate_importances(pipe)

    # ...then refit on all data for the deployed model.
    pipe.fit(X, y)

    joblib.dump(pipe, C.MODEL_PATH)
    df.to_csv(C.DATASET_PATH, index=False)
    with open(C.META_PATH, "w") as fh:
        json.dump({"accuracy": float(accuracy), "feature_importance": feature_importance}, fh, indent=2)

    print(f"Trained on {len(df)} species. Holdout accuracy = {accuracy:.3f}")
    print(f"Artifacts written to {C.ARTIFACTS}")


if __name__ == "__main__":
    main()
