"""PostgreSQL storage backed by a small reusable connection pool."""
import os
from contextlib import contextmanager
from pathlib import Path

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

MIGRATION_DIR = Path(__file__).resolve().parent.parent / "migrations"


class ConfigurationError(RuntimeError):
    pass


_pool: ConnectionPool | None = None


def database_url():
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        raise ConfigurationError("DATABASE_URL is required; ephemeral SQLite is not used.")
    if not url.startswith(("postgresql://", "postgres://")):
        raise ConfigurationError("DATABASE_URL must be a PostgreSQL connection string.")
    return url


def _connection_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = ConnectionPool(
            conninfo=database_url(),
            min_size=0,
            max_size=max(2, int(os.getenv("DATABASE_POOL_SIZE", "5"))),
            timeout=10,
            kwargs={"row_factory": dict_row, "connect_timeout": 10},
            open=True,
        )
    return _pool


@contextmanager
def connect():
    with _connection_pool().connection() as connection:
        yield connection


def close():
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None


def init():
    migrations = sorted(MIGRATION_DIR.glob("*.sql"))
    if not migrations:
        raise RuntimeError(f"No database migrations found in: {MIGRATION_DIR}")
    with connect() as connection:
        for migration in migrations:
            connection.execute(migration.read_text(encoding="utf-8"))


def ready():
    try:
        with connect() as connection:
            connection.execute("SELECT 1").fetchone()
        return True
    except (ConfigurationError, psycopg.Error):
        return False
