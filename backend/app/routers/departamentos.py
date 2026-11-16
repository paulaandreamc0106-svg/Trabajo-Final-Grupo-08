from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.entidades import Departamento, Usuario
from backend.app.schemas.departamentos import (
    DepartamentoActualizar,
    DepartamentoCrear,
    DepartamentoRespuesta,
)
from backend.app.security import get_current_user, require_roles

router = APIRouter(
    prefix="/api/v1/departamentos",
    tags=["Departamentos"]
)


@router.post("/", response_model=DepartamentoRespuesta, status_code=201)
def crear_departamento(
    datos: DepartamentoCrear,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("responsable")),
):
    existente = db.query(Departamento).filter(
        Departamento.nombre == datos.nombre
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="El departamento ya existe"
        )

    departamento = Departamento(nombre=datos.nombre)
    db.add(departamento)
    db.commit()
    db.refresh(departamento)

    return departamento


@router.get("/", response_model=list[DepartamentoRespuesta])
def listar_departamentos(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return db.query(Departamento).order_by(Departamento.id).all()


@router.get("/{departamento_id}", response_model=DepartamentoRespuesta)
def obtener_departamento(
    departamento_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    departamento = db.query(Departamento).filter(
        Departamento.id == departamento_id
    ).first()

    if not departamento:
        raise HTTPException(404, "Departamento no encontrado")

    return departamento


@router.patch("/{departamento_id}", response_model=DepartamentoRespuesta)
def actualizar_departamento(
    departamento_id: int,
    datos: DepartamentoActualizar,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("responsable")),
):
    departamento = db.query(Departamento).filter(
        Departamento.id == departamento_id
    ).first()

    if not departamento:
        raise HTTPException(404, "Departamento no encontrado")

    duplicado = db.query(Departamento).filter(
        Departamento.nombre == datos.nombre,
        Departamento.id != departamento_id
    ).first()

    if duplicado:
        raise HTTPException(409, "Ese nombre ya está registrado")

    departamento.nombre = datos.nombre
    db.commit()
    db.refresh(departamento)

    return departamento


@router.delete("/{departamento_id}")
def eliminar_departamento(
    departamento_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("responsable")),
):
    departamento = db.query(Departamento).filter(
        Departamento.id == departamento_id
    ).first()

    if not departamento:
        raise HTTPException(404, "Departamento no encontrado")

    usuarios = db.query(Usuario).filter(
        Usuario.departamento_id == departamento_id
    ).first()

    if usuarios:
        raise HTTPException(
            409,
            "No se puede eliminar: hay usuarios asociados a este departamento"
        )

    db.delete(departamento)
    db.commit()

    return {"mensaje": "Departamento eliminado correctamente"}
