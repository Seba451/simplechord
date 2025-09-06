# backend/app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas, utils
from typing import List, Optional


# ------------------- USUARIO -------------------
def get_usuario(db: Session, usuario_id: int):
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100) -> List[models.Usuario]:
    return db.query(models.Usuario).offset(skip).limit(limit).all()

def create_usuario(db: Session, usuario: schemas.UsuarioCreate):
    db_usuario = models.Usuario(
        email=usuario.email,
        usuario=usuario.usuario,
        password=utils.get_password_hash(usuario.password)
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def delete_usuario(db: Session, usuario_id: int):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if usuario:
        db.delete(usuario)
        db.commit()
    return usuario

def update_usuario(db: Session, usuario_id: int, usuario_update: schemas.UsuarioCreate):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if usuario:
        usuario.email = usuario_update.email
        usuario.usuario = usuario_update.usuario
        usuario.password = usuario_update.password
        db.commit()
        db.refresh(usuario)
    return usuario

# ------------------- FUNCIONES DE AUTENTICACIÓN -------------------
def authenticate_usuario(db: Session, username_or_email: str, password: str):
    """Autenticar usuario con email o nombre de usuario y contraseña"""
    # Primero intenta buscar por email
    usuario = get_usuario_by_email(db, username_or_email)
    
    # Si no encuentra por email, busca por nombre de usuario
    if not usuario:
        usuario = db.query(models.Usuario).filter(models.Usuario.usuario == username_or_email).first()
    
    if not usuario:
        return False
        
    if not utils.verify_password(password, usuario.password):
        return False
        
    return usuario

# ------------------- PROGRESION -------------------
def get_progresion(db: Session, progresion_id: int):
    return db.query(models.Progresion).filter(models.Progresion.id == progresion_id).first()

def get_progresiones(db: Session, skip: int = 0, limit: int = 100) -> List[models.Progresion]:
    return db.query(models.Progresion).offset(skip).limit(limit).all()

def get_progresiones_by_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 100) -> List[models.Progresion]:
    return db.query(models.Progresion).filter(models.Progresion.usuario_id == usuario_id).offset(skip).limit(limit).all()

def create_progresion(db: Session, progresion: schemas.ProgresionCreate, usuario_id: int):
    db_progresion = models.Progresion(
        nombre=progresion.nombre,
        acordes=progresion.acordes,
        tonalidad=progresion.tonalidad,
        usuario_id=usuario_id
    )
    db.add(db_progresion)
    db.commit()
    db.refresh(db_progresion)
    return db_progresion

def delete_progresion(db: Session, progresion_id: int):
    progresion = db.query(models.Progresion).filter(models.Progresion.id == progresion_id).first()
    if progresion:
        db.delete(progresion)
        db.commit()
    return progresion

def update_progresion(db: Session, progresion_id: int, progresion_update: schemas.ProgresionCreate):
    progresion = db.query(models.Progresion).filter(models.Progresion.id == progresion_id).first()
    if progresion:
        progresion.nombre = progresion_update.nombre
        progresion.acordes = progresion_update.acordes
        progresion.tonalidad = progresion_update.tonalidad
        db.commit()
        db.refresh(progresion)
    return progresion
