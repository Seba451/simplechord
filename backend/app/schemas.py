# backend/app/schemas.py
from .database import Base
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ExplainRequest(BaseModel):
    chord: str
    progression: List[str]
    tonalidad: str  

class ExplainResponse(BaseModel):
    explanation: str

class PredictionRequest(BaseModel):
    input_sequence: str
    top_k: int = 3

class Token(BaseModel):
    access_token: str
    token_type: str

class ProgresionBase(BaseModel):
    nombre: str
    acordes: list
    tonalidad: str

class ProgresionCreate(ProgresionBase):
    pass

class Progresion(ProgresionBase):
    id: int
    usuario_id: int
    fecha_creacion: datetime
    fecha_modificacion: datetime

    class Config:
        orm_mode = True

class UsuarioBase(BaseModel):
    email: str
    usuario: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: str

class Usuario(UsuarioBase):
    id: int
    fecha_creacion: datetime
    progresiones: List[Progresion] = []

    class Config:
        orm_mode = True