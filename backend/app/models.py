from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON
from datetime import datetime
from .database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    usuario = Column(String, nullable=True)
    password = Column(String, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    progresiones = relationship("Progresion", back_populates="usuario")

class Progresion(Base):
    __tablename__ = "progresiones"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    acordes = Column(JSON, nullable=False)
    tonalidad = Column(String, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_modificacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="progresiones") 