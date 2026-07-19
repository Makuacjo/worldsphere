"""FastAPI app for WorldSphere Conservation Insights.

Run from the ml-service directory:

    uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

import sqlite3

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.schemas import (
    PredictionRequest, PredictionResponse, InsightsResponse,
    SignupRequest, LoginRequest, AuthResponse, UserOut, FavoriteIn, FavoriteOut,
)
from app.service import Model
from app import ai, db, auth

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
db.init()

_NOT_TRAINED = "Model not trained yet. Run: python model/train.py"


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model_ready": model.ready, "ai_ready": ai.available()}


class AskRequest(BaseModel):
    question: str


@app.post("/ai/ask")
def ai_ask(req: AskRequest) -> StreamingResponse:
    if not ai.available():
        raise HTTPException(
            status_code=503,
            detail="AI is not configured. Set OPENROUTER_API_KEY in the ml-service environment.",
        )
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Ask a question first.")
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
def signup(req: SignupRequest) -> dict:
    name, email, password = req.name.strip(), req.email.strip().lower(), req.password
    if not name or "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a name and a valid email.")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    with db.connect() as conn:
        try:
            cur = conn.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (name, email, auth.hash_password(password)),
            )
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="An account with that email already exists.")
        uid = cur.lastrowid
    return {"token": auth.create_token(uid, email), "user": {"id": uid, "name": name, "email": email}}


@app.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest) -> dict:
    email = req.email.strip().lower()
    with db.connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
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
            "WHERE user_id = ? ORDER BY created_at DESC",
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
            "INSERT OR IGNORE INTO favorites (user_id, key, source, name, scientific_name, image) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (user["id"], fav.key, fav.source, fav.name, fav.scientificName, fav.image),
        )
        row = conn.execute(
            "SELECT id, key, source, name, scientific_name, image FROM favorites "
            "WHERE user_id = ? AND source = ? AND key = ?",
            (user["id"], fav.source, fav.key),
        ).fetchone()
    return {"id": row["id"], "key": row["key"], "source": row["source"], "name": row["name"],
            "scientificName": row["scientific_name"], "image": row["image"]}


@app.delete("/favorites/{source}/{key}")
def remove_favorite(source: str, key: str, user: dict = Depends(auth.current_user)) -> dict:
    with db.connect() as conn:
        conn.execute(
            "DELETE FROM favorites WHERE user_id = ? AND source = ? AND key = ?",
            (user["id"], source, key),
        )
    return {"ok": True}
