
from .models import Usuario

from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, Cookie
from sqlalchemy.orm import Session
from . import crud, schemas, database, utils
from typing import List
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from starlette import status
from .schemas import Token
from datetime import timedelta
from jose import JWTError, jwt
from fastapi.responses import JSONResponse
import os

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)



bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
ouath2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')


async def get_current_user(
    access_token: str | None = Cookie(None),
    db: Session = Depends(database.get_db)
):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )
    
    try:
        token = access_token.split("Bearer ")[1]
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
        
    user = crud.get_usuario_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user

# Creacion de usuario
@router.post("/register", response_model=schemas.Usuario)
async def register_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(database.get_db)):
    """Registrar un nuevo usuario"""
    db_usuario = crud.get_usuario_by_email(db, email=usuario.email)
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return crud.create_usuario(db=db, usuario=usuario)

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    usuario = crud.authenticate_usuario(db, form_data.username, form_data.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        usuario.email, usuario.id, expires_delta=access_token_expires
    )
    
    # Crear respuesta con cookie
    response = JSONResponse(content={"message": "Login successful"})
    # Cookie settings configurable via env for local vs production
    cookie_secure = os.getenv("COOKIE_SECURE", "true").lower() == "true"
    cookie_samesite = os.getenv("COOKIE_SAMESITE", "none").lower()

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=cookie_secure,  # HTTPS in prod; can disable locally
        samesite=cookie_samesite,  # 'none' for cross-site with separate frontend
        max_age=3600,  # 1 hora
        path="/"
    )
    
    return response

@router.get("/me", response_model=schemas.Usuario)
async def read_users_me(current_user: Usuario = Depends(get_current_user)):
    """Obtener el usuario autenticado"""
    print(f"Current user: {current_user.email, current_user.usuario}")
    return current_user

@router.post("/logout")
def logout():
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie("access_token")
    return response
