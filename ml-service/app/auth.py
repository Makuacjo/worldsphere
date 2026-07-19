"""Password hashing + signed session tokens (stdlib only).

Tokens are compact HMAC-SHA256-signed JSON (a JWT-shaped format) — enough for a
self-hosted demo without pulling in PyJWT/passlib/bcrypt.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time

from fastapi import Header, HTTPException

import common as C

TOKEN_TTL = 60 * 60 * 24 * 30  # 30 days


# ---- secret --------------------------------------------------------------

def _secret() -> bytes:
    env = os.environ.get("AUTH_SECRET")
    if env:
        return env.encode()
    path = os.path.join(C.ARTIFACTS, "auth_secret")
    if os.path.exists(path):
        with open(path, "rb") as fh:
            return fh.read()
    os.makedirs(C.ARTIFACTS, exist_ok=True)
    sec = secrets.token_bytes(32)
    with open(path, "wb") as fh:
        fh.write(sec)
    return sec


# ---- passwords -----------------------------------------------------------

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split("$", 1)
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 200_000)
    return hmac.compare_digest(digest.hex(), digest_hex)


# ---- tokens --------------------------------------------------------------

def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _unb64(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


def create_token(user_id: int, email: str) -> str:
    payload = {"uid": user_id, "email": email, "exp": int(time.time()) + TOKEN_TTL}
    body = _b64(json.dumps(payload, separators=(",", ":")).encode())
    sig = _b64(hmac.new(_secret(), body.encode(), hashlib.sha256).digest())
    return f"{body}.{sig}"


def verify_token(token: str) -> dict | None:
    try:
        body, sig = token.split(".", 1)
    except ValueError:
        return None
    expected = _b64(hmac.new(_secret(), body.encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        payload = json.loads(_unb64(body))
    except (ValueError, json.JSONDecodeError):
        return None
    if payload.get("exp", 0) < time.time():
        return None
    return payload


# ---- FastAPI dependency --------------------------------------------------

def current_user(authorization: str | None = Header(default=None)) -> dict:
    """Resolve the bearer token to a user row, or raise 401."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not signed in.")
    payload = verify_token(authorization.split(" ", 1)[1].strip())
    if not payload:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")

    from app import db
    with db.connect() as conn:
        row = conn.execute("SELECT id, name, email FROM users WHERE id = ?", (payload["uid"],)).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Account not found.")
    return {"id": row["id"], "name": row["name"], "email": row["email"]}
