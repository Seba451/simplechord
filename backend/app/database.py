from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import re
import os

DEFAULT_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/simplechord"
# Prefer env var for deploys (e.g., Vercel + external DB like Neon/Supabase)
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

# Prefer not to hold many DB connections. When using Supabase Pooler in
# session mode, too many persistent clients quickly hit its limit.
# If the URL targets Supabase Pooler, default to NullPool (open/close per use)
# and rely on the external pooler. This dramatically reduces idle connections
# from app containers.
is_supabase_pooler = bool(re.search(r"pooler\.supabase\.com", DATABASE_URL or ""))

if is_supabase_pooler:
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,      # do not keep open connections in the app
        pool_pre_ping=True,      # validate connections before use
        connect_args={
            # Supabase pooler requires TLS; be explicit to avoid driver/env mismatches
            "sslmode": os.getenv("DB_SSLMODE", "require"),
        },
    )
else:
    # Conservative internal pool to avoid exhausting DB connections
    pool_size = int(os.getenv("DB_POOL_SIZE", "3"))
    max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "0"))
    pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "1800"))  # seconds
    pool_timeout = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    engine = create_engine(
        DATABASE_URL,
        pool_size=pool_size,
        max_overflow=max_overflow,
        pool_recycle=pool_recycle,
        pool_timeout=pool_timeout,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency para FastAPI
from typing import Generator

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
