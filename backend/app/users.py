from .auth import get_current_user
from .models import Usuario

from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, schemas, database
from typing import List
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from starlette import status

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)

@router.get("/me", response_model=schemas.Usuario)
def read_current_user(current_user: Usuario = Depends(get_current_user)):
    """Obtener información del usuario autenticado"""
    return current_user

@router.put("/{usuario_id}", response_model=schemas.Usuario)
def update_usuario(
    usuario_id: int, 
    usuario_update: schemas.UsuarioCreate, 
    db: Session = Depends(database.get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar un usuario - Solo el propio usuario puede editarse"""
    if current_user.id != usuario_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este usuario")
    
    usuario = crud.update_usuario(db, usuario_id=usuario_id, usuario_update=usuario_update)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.delete("/{usuario_id}", response_model=schemas.Usuario)
def delete_usuario(
    usuario_id: int, 
    db: Session = Depends(database.get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Eliminar un usuario - Solo el propio usuario puede eliminarse"""
    if current_user.id != usuario_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este usuario")
    
    usuario = crud.delete_usuario(db, usuario_id=usuario_id)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario
