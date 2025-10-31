from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import re
import os

# Variables de entorno para la configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL variable de entorno no está configurada.")

is_supabase_pooler = bool(re.search(r"pooler\.supabase\.com", DATABASE_URL or ""))

if is_supabase_pooler:
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,      
        pool_pre_ping=True,      
        connect_args={
            
            "sslmode": os.getenv("DB_SSLMODE", "require"),
        },
    )
else:
    
    pool_size = int(os.getenv("DB_POOL_SIZE", "3"))
    max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "0"))
    pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "1800")) 
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

from typing import Generator

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
