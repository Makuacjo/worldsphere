"""SQLite storage for users and favorites (stdlib sqlite3, no ORM)."""
from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager

import common as C

DB_PATH = os.path.join(C.ARTIFACTS, "worldsphere.db")

_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS favorites (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    key             TEXT NOT NULL,
    source          TEXT NOT NULL,
    name            TEXT NOT NULL,
    scientific_name TEXT,
    image           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, source, key),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
"""


def init() -> None:
    os.makedirs(C.ARTIFACTS, exist_ok=True)
    with connect() as db:
        db.executescript(_SCHEMA)


@contextmanager
def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
