from fastapi import FastAPI
from . import models
from .database import engine
from .auth import router as auth_router
from .progressions import router as progression_router
from fastapi.middleware.cors import CORSMiddleware
from .users import router as users_router
from .predictions import router as predictions_router
import os


app = FastAPI()

# CORS: allow explicit origins (not "*") when using credentials
origins_env = os.getenv("CORS_ALLOW_ORIGINS") or os.getenv("FRONTEND_URL") or os.getenv("FRONT_ORIGIN")
if origins_env:
    allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()]
else:
    allow_origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✅ Tablas verificadas/creadas")
        print(f"✅ CORS allow_origins: {allow_origins}")
    except Exception as e:
        print(f"⚠️  Error creando tablas: {e}")

app.include_router(auth_router)
app.include_router(progression_router)
app.include_router(users_router)
app.include_router(predictions_router)

@app.get("/health")
def health():
    return {"ok": True}
