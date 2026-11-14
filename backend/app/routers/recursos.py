
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.app.database import get_db
from backend.app.models.entidades import Recurso
from backend.app.schemas.recursos import (
    RecursoCrear,
    RecursoActualizar,
    RecursoRespuesta
)

router = APIRouter(
    prefix="/api/v1/recursos",
    tags=["Recursos"]
)


@router.get("/", response_model=list[RecursoRespuesta])
def listar_recursos(db: Session = Depends(get_db)):
    return db.query(Recurso).order_by(Recurso.id).all()


@router.get("/{recurso_id}", response_model=RecursoRespuesta)
def obtener_recurso(recurso_id: int, db: Session = Depends(get_db)):
    recurso = db.query(Recurso).filter(
        Recurso.id == recurso_id
    ).first()

    if recurso is None:
        raise HTTPException(
            status_code=404,
            detail="El recurso no existe"
        )

    return recurso


@router.post(
    "/",
    response_model=RecursoRespuesta,
    status_code=status.HTTP_201_CREATED
)
def crear_recurso(datos: RecursoCrear, db: Session = Depends(get_db)):
    existente = db.query(Recurso).filter(
        Recurso.codigo == datos.codigo
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="Ya existe un recurso con ese código"
        )

    if datos.serial:
        serial_existente = db.query(Recurso).filter(
            Recurso.serial == datos.serial
        ).first()

        if serial_existente:
            raise HTTPException(
                status_code=409,
                detail="Ya existe un recurso con ese serial"
            )

    nuevo_recurso = Recurso(**datos.model_dump())

    db.add(nuevo_recurso)
    db.commit()
    db.refresh(nuevo_recurso)

    return nuevo_recurso


@router.patch("/{recurso_id}", response_model=RecursoRespuesta)
def actualizar_recurso(
    recurso_id: int,
    datos: RecursoActualizar,
    db: Session = Depends(get_db)
):
    recurso = db.query(Recurso).filter(
        Recurso.id == recurso_id
    ).first()

    if recurso is None:
        raise HTTPException(
            status_code=404,
            detail="El recurso no existe"
        )

    cambios = datos.model_dump(exclude_unset=True)

    if "codigo" in cambios and cambios["codigo"] != recurso.codigo:
        duplicado = db.query(Recurso).filter(
            Recurso.codigo == cambios["codigo"],
            Recurso.id != recurso_id
        ).first()

        if duplicado:
            raise HTTPException(
                status_code=409,
                detail="Ese código ya está registrado"
            )

    if "serial" in cambios and cambios["serial"]:
        duplicado = db.query(Recurso).filter(
            Recurso.serial == cambios["serial"],
            Recurso.id != recurso_id
        ).first()

        if duplicado:
            raise HTTPException(
                status_code=409,
                detail="Ese serial ya está registrado"
            )

    for campo, valor in cambios.items():
        setattr(recurso, campo, valor)

    db.commit()
    db.refresh(recurso)

    return recurso


@router.delete("/{recurso_id}")
def eliminar_recurso(recurso_id: int, db: Session = Depends(get_db)):
    recurso = db.query(Recurso).filter(
        Recurso.id == recurso_id
    ).first()

    if recurso is None:
        raise HTTPException(
            status_code=404,
            detail="El recurso no existe"
        )

    db.delete(recurso)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar: el recurso tiene solicitudes o préstamos relacionados"
        )

    return {"mensaje": "Recurso eliminado correctamente"}
