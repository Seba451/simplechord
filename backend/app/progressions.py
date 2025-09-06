from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, schemas, database
from .auth import get_current_user
from .models import Usuario
from typing import List

router = APIRouter(
    prefix="/progresiones",
    tags=["progresiones"]
)

@router.post("/", response_model=schemas.Progresion)
def create_progresion(
    progresion: schemas.ProgresionCreate, 
    db: Session = Depends(database.get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear una nueva progresión - Requiere autenticación"""
    return crud.create_progresion(db=db, progresion=progresion, usuario_id=current_user.id)

@router.get("/mis-progresiones", response_model=List[schemas.Progresion])
def read_my_progresiones(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener las progresiones del usuario autenticado"""
    return crud.get_progresiones_by_usuario(db, usuario_id=current_user.id, skip=skip, limit=limit)

@router.get("/{progresion_id}", response_model=schemas.Progresion)
def read_progresion(progresion_id: int, db: Session = Depends(database.get_db), current_user: Usuario = Depends(get_current_user)):
    """Obtener una progresión específica - Solo el propietario puede acceder"""
    progresion = crud.get_progresion(db, progresion_id=progresion_id)
    if progresion is None:
        raise HTTPException(status_code=404, detail="Progresión no encontrada")
    return progresion

@router.put("/{progresion_id}", response_model=schemas.Progresion)
def update_progresion(
    progresion_id: int, 
    progresion_update: schemas.ProgresionCreate, 
    db: Session = Depends(database.get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar una progresión - Solo el propietario puede editar"""
    # Verificar que la progresión existe y pertenece al usuario
    progresion = crud.get_progresion(db, progresion_id=progresion_id)
    if progresion is None:
        raise HTTPException(status_code=404, detail="Progresión no encontrada")
    
    if progresion.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta progresión")
    
    updated_progresion = crud.update_progresion(db, progresion_id=progresion_id, progresion_update=progresion_update)
    return updated_progresion

@router.delete("/{progresion_id}", response_model=schemas.Progresion)
def delete_progresion(
    progresion_id: int, 
    db: Session = Depends(database.get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Eliminar una progresión - Solo el propietario puede eliminar"""
    # Verificar que la progresión existe y pertenece al usuario
    progresion = crud.get_progresion(db, progresion_id=progresion_id)
    if progresion is None:
        raise HTTPException(status_code=404, detail="Progresión no encontrada")
    
    if progresion.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta progresión")
    
    deleted_progresion = crud.delete_progresion(db, progresion_id=progresion_id)
    return deleted_progresion
