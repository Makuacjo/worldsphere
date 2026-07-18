"""FastAPI app for WorldSphere Conservation Insights.

Run from the ml-service directory:

    uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import PredictionRequest, PredictionResponse, InsightsResponse
from app.service import Model

app = FastAPI(title="WorldSphere Conservation Insights API", version="1.0.0")

# Allow the Vite dev server (and preview) to call the API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = Model()

_NOT_TRAINED = "Model not trained yet. Run: python model/train.py"


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model_ready": model.ready}


@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest) -> dict:
    if not model.ready:
        raise HTTPException(status_code=503, detail=_NOT_TRAINED)
    return model.predict(req.model_dump(by_alias=True))


@app.get("/insights", response_model=InsightsResponse)
def insights() -> dict:
    if not model.ready:
        raise HTTPException(status_code=503, detail=_NOT_TRAINED)
    return model.insights()
