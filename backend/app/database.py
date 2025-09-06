from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

POSTGRESQL_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/simplechord"
#POSTGRESQL_DATABASE_URL = "postgresql://postgres:siemensdb5801@localhost:5432/simplechord"

engine = create_engine(POSTGRESQL_DATABASE_URL)
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