"""PostgreSQL storage with one connection per transaction."""
import os
from contextlib import contextmanager
from pathlib import Path
import psycopg
from psycopg.rows import dict_row

MIGRATION_DIR = Path(__file__).resolve().parent.parent / "migrations"

class ConfigurationError(RuntimeError):
    pass

def database_url():
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        raise ConfigurationError("DATABASE_URL is required; ephemeral SQLite is not used.")
    if not url.startswith(("postgresql://", "postgres://")):
        raise ConfigurationError("DATABASE_URL must be a PostgreSQL connection string.")
    return url

@contextmanager
def connect():
    with psycopg.connect(database_url(), row_factory=dict_row, connect_timeout=10) as connection:
        yield connection

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
