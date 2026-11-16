from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.entidades import Usuario
from backend.app.schemas.usuarios import (
    LoginRequest,
    LoginRespuesta,
    UsuarioRespuesta,
)
from backend.app.security import (
    crear_token_acceso,
    get_current_user,
    verify_password,
)

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticación"]
)


@router.post("/login", response_model=LoginRespuesta)
def iniciar_sesion(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(
        Usuario.correo == datos.correo
    ).first()

    if not usuario or not verify_password(datos.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    token = crear_token_acceso(usuario)
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario,
    }


@router.get("/me", response_model=UsuarioRespuesta)
def perfil_actual(usuario_actual: Usuario = Depends(get_current_user)):
    return usuario_actual