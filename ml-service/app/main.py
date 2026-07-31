"""FastAPI app for WorldSphere Conservation Insights.

Run from the ml-service directory:

    uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

from contextlib import asynccontextmanager
import psycopg

from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.schemas import (
    PredictionRequest, PredictionResponse, InsightsResponse,
    SignupRequest, LoginRequest, AuthResponse, UserOut, FavoriteIn, FavoriteOut,
)
from app.service import Model
from app import ai, db, auth, account
from app.ai_core.router import router as shared_ai_router
from app.ai_core import rate_limit as ai_rate_limit
from app.config import parse_cors_origins, validate_auth_secret
from app.login_rate_limit import enforce as enforce_auth_rate_limit

@asynccontextmanager
async def lifespan(_: FastAPI):
    validate_auth_secret()
    db.init()
    yield

app = FastAPI(title="WorldSphere Conservation Insights API", version="1.0.0",
              lifespan=lifespan)

app.add_middleware(GZipMiddleware, minimum_size=500)

# Allow the Vite dev server (and preview) to call the API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(),
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "X-WorldSphere-Session"],
    expose_headers=["X-Conversation-Id", "X-Assistant-Type"],
)

model = Model()
app.include_router(shared_ai_router)
app.include_router(account.router)

_NOT_TRAINED = "Model not trained yet. Run: python model/train.py"


@app.get("/health")
def health(response: Response) -> dict:
    database_ready = db.ready()
    model_ready = model.ready
    if not database_ready or not model_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {
        "status": "ok" if database_ready and model_ready else "degraded",
        "application_ready": True,
        "model_ready": model_ready,
        "database_ready": database_ready,
        "ai_ready": ai.available(),
    }


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)


@app.post("/ai/ask")
def ai_ask(req: AskRequest, request: Request) -> StreamingResponse:
    if not ai.available():
        raise HTTPException(
            status_code=503,
            detail="AI is not configured. Set OPENROUTER_API_KEY in the ml-service environment.",
        )
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Ask a question first.")
    address = request.client.host if request.client else "unknown"
    try:
        ai_rate_limit.check(f"legacy:{address}")
    except ai_rate_limit.RateLimitError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc
    return StreamingResponse(ai.stream_answer(question), media_type="text/plain; charset=utf-8")


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


# ------------------------------------------------------------------- auth ---

@app.post("/auth/signup", response_model=AuthResponse)
def signup(req: SignupRequest, request: Request) -> dict:
    enforce_auth_rate_limit(request)
    name, email, password = req.name.strip(), req.email.strip().casefold(), req.password
    if not name or "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a name and a valid email.")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    with db.connect() as conn:
        try:
            cur = conn.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
                (name, email, auth.hash_password(password)),
            )
            uid = cur.fetchone()["id"]
        except psycopg.errors.UniqueViolation:
            raise HTTPException(status_code=409, detail="An account with that email already exists.")
    return {"token": auth.create_token(uid, email), "user": {"id": uid, "name": name, "email": email}}


@app.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest, request: Request) -> dict:
    enforce_auth_rate_limit(request)
    email = req.email.strip().casefold()
    with db.connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = %s", (email,)).fetchone()
    if not row or not auth.verify_password(req.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    user = {"id": row["id"], "name": row["name"], "email": row["email"]}
    return {"token": auth.create_token(row["id"], email), "user": user}


@app.get("/auth/me", response_model=UserOut)
def me(user: dict = Depends(auth.current_user)) -> dict:
    return user


# -------------------------------------------------------------- favorites ---

@app.get("/favorites", response_model=list[FavoriteOut])
def list_favorites(user: dict = Depends(auth.current_user)) -> list[dict]:
    with db.connect() as conn:
        rows = conn.execute(
            "SELECT id, key, source, name, scientific_name, image FROM favorites "
            "WHERE user_id = %s ORDER BY created_at DESC",
            (user["id"],),
        ).fetchall()
    return [
        {"id": r["id"], "key": r["key"], "source": r["source"], "name": r["name"],
         "scientificName": r["scientific_name"], "image": r["image"]}
        for r in rows
    ]


@app.post("/favorites", response_model=FavoriteOut)
def add_favorite(fav: FavoriteIn, user: dict = Depends(auth.current_user)) -> dict:
    with db.connect() as conn:
        conn.execute(
            "INSERT INTO favorites (user_id, key, source, name, scientific_name, image) "
            "VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (user_id, source, key) DO NOTHING",
            (user["id"], fav.key, fav.source, fav.name, fav.scientificName, fav.image),
        )
        row = conn.execute(
            "SELECT id, key, source, name, scientific_name, image FROM favorites "
            "WHERE user_id = %s AND source = %s AND key = %s",
            (user["id"], fav.source, fav.key),
        ).fetchone()
    account.activity(user["id"], "favorite_added", row["name"], row["source"], row["key"])
    return {"id": row["id"], "key": row["key"], "source": row["source"], "name": row["name"],
            "scientificName": row["scientific_name"], "image": row["image"]}


@app.delete("/favorites/{source}/{key}")
def remove_favorite(source: str, key: str, user: dict = Depends(auth.current_user)) -> dict:
    with db.connect() as conn:
        conn.execute(
            "DELETE FROM favorites WHERE user_id = %s AND source = %s AND key = %s",
            (user["id"], source, key),
        )
    account.activity(user["id"], "favorite_removed", f"Removed {source} favorite", source, key)
    return {"ok": True}
