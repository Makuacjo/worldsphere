# WorldSphere — Conservation Insights API (ml-service)

FastAPI + scikit-learn backend powering the **Research** and **AI Explorer**
surfaces. It trains a RandomForest on a synthetic, IUCN-style species dataset
and serves conservation-risk predictions plus dataset insights.

The API contract matches the frontend in `../src/services/conservationApi.ts`.

## Endpoints

| Method | Path        | Returns                                            |
|--------|-------------|----------------------------------------------------|
| GET    | `/health`   | `{ status, model_ready, ai_ready }`                |
| POST   | `/predict`  | `PredictionResponse` (category + probabilities)    |
| GET    | `/insights` | `InsightsResponse` (distributions, importances, …) |
| POST   | `/ai/ask`   | Streamed plain-text answer from Claude (AI Explorer) |

## AI Explorer (OpenRouter)

The `/ai/ask` endpoint streams natural-language answers via OpenRouter
(OpenAI-compatible). The API key stays server-side — the browser never sees it.
Put it in `ml-service/.env` (gitignored, loaded automatically at startup):

```
OPENROUTER_API_KEY=sk-or-v1-...
# AI_MODEL=openai/gpt-4o-mini   # optional; any OpenRouter model id
```

Or set it in the shell before `uvicorn` (`$env:OPENROUTER_API_KEY = "..."`).
Without a key, `/ai/ask` returns 503 and the AI Explorer shows a "not configured"
state — everything else keeps working.

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
