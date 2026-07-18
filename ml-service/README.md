# WorldSphere — Conservation Insights API (ml-service)

FastAPI + scikit-learn backend powering the **Research** and **AI Explorer**
surfaces. It trains a RandomForest on a synthetic, IUCN-style species dataset
and serves conservation-risk predictions plus dataset insights.

The API contract matches the frontend in `../src/services/conservationApi.ts`.

## Endpoints

| Method | Path        | Returns                                            |
|--------|-------------|----------------------------------------------------|
| GET    | `/health`   | `{ status, model_ready }`                          |
| POST   | `/predict`  | `PredictionResponse` (category + probabilities)    |
| GET    | `/insights` | `InsightsResponse` (distributions, importances, …) |

## Run it

From this `ml-service/` directory:

```bash
# 1. Create + activate a virtualenv
python -m venv .venv
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train the model (writes artifacts/)
python model/train.py

# 4. Serve the API on :8000
uvicorn app.main:app --reload --port 8000
```

The frontend reads `VITE_ML_API_URL` (default `http://localhost:8000`) from
`../.env`. Once the API is up, refresh the app — Research and AI Explorer go live.

## Swapping in real data

Replace `generate_dataset()` in `common.py` with a loader for real occurrence /
IUCN Red List data (same columns: `class, habitat, region, population_trend,
range_size_km2, generation_length_years, category`), then re-run `train.py`. No
API or frontend changes required.
