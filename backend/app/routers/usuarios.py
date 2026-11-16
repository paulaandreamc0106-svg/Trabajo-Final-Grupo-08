from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.entidades import (
    Departamento,
    Prestamo,
    Prorroga,
    Solicitud,
    Usuario,
)
from backend.app.schemas.usuarios import (
    UsuarioActualizar,
    UsuarioCrear,
    UsuarioRespuesta,
)
from backend.app.security import (
    get_current_user,
    hash_password,
    require_roles,
)

router = APIRouter(
    prefix="/api/v1/usuarios",
    tags=["Usuarios"]
)


def validar_departamento(departamento_id: int | None, db: Session):
    if departamento_id is not None:
        departamento = db.query(Departamento).filter(
            Departamento.id == departamento_id
        ).first()

        if departamento is None:
            raise HTTPException(
                status_code=404,
                detail="El departamento indicado no existe"
            )


@router.post("/", response_model=UsuarioRespuesta, status_code=201)
def crear_usuario(
    datos: UsuarioCrear,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("responsable")),
):
    existente = db.query(Usuario).filter(
        Usuario.correo == datos.correo
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="Ya existe un usuario con ese correo"
        )

    validar_departamento(datos.departamento_id, db)

    payload = datos.model_dump(exclude={"password"})
    usuario = Usuario(
        **payload,
        password_hash=hash_password(datos.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return usuario


@router.get("/", response_model=list[UsuarioRespuesta])
def listar_usuarios(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return db.query(Usuario).order_by(Usuario.id).all()


@router.get("/{usuario_id}", response_model=UsuarioRespuesta)
def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if usuario is None:
        raise HTTPException(404, "Usuario no encontrado")

    return usuario


@router.patch("/{usuario_id}", response_model=UsuarioRespuesta)
def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioActualizar,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("responsable")),
):
    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if usuario is None:
        raise HTTPException(404, "Usuario no encontrado")

    cambios = datos.model_dump(exclude_unset=True)

    for campo in ("nombre", "correo", "tipo", "rol"):
        if campo in cambios and cambios[campo] is None:
            raise HTTPException(
                status_code=422,
                detail=f"El campo {campo} no puede quedar vacío"
            )

    if "correo" in cambios and cambios["correo"] != usuario.correo:
        duplicado = db.query(Usuario).filter(
            Usuario.correo == cambios["correo"],
            Usuario.id != usuario_id
        ).first()

        if duplicado:
            raise HTTPException(
                status_code=409,
                detail="Ese correo ya está registrado"
            )

    if "departamento_id" in cambios:
        validar_departamento(cambios["departamento_id"], db)

    if "password" in cambios:
        nueva_pass = cambios.pop("password")
        if nueva_pass:
            usuario.password_hash = hash_password(nueva_pass)

    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)

    return usuario


@router.delete("/{usuario_id}")
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_roles("responsable")),
):
    if usuario_actual.id == usuario_id:
        raise HTTPException(
            status_code=409,
            detail="No puedes eliminar tu propio usuario en sesión"
        )

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if usuario is None:
        raise HTTPException(404, "Usuario no encontrado")

    tiene_solicitudes = db.query(Solicitud).filter(
        Solicitud.solicitante_id == usuario_id
    ).first()

    tiene_prestamos = db.query(Prestamo).filter(
        Prestamo.responsable_id == usuario_id
    ).first()

    tiene_prorrogas = db.query(Prorroga).filter(
        Prorroga.responsable_decision_id == usuario_id
    ).first()

    if tiene_solicitudes or tiene_prestamos or tiene_prorrogas:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar: el usuario tiene operaciones relacionadas"
        )

    db.delete(usuario)
    db.commit()

    return {"mensaje": "Usuario eliminado correctamente"}
