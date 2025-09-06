from fastapi import FastAPI
from . import models
from .database import engine
from .auth import router as auth_router
from .progressions import router as progression_router
from fastapi.middleware.cors import CORSMiddleware
from .users import router as users_router
from .predictions import router as predictions_router



models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(progression_router)
app.include_router(users_router)
app.include_router(predictions_router)