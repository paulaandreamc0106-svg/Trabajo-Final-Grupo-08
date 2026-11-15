
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.entidades import Prestamo, Solicitud, Recurso
from backend.app.schemas.prestamos import (
    DevolucionCrear,
    PrestamoRespuesta
)

router = APIRouter(
    prefix="/api/v1/prestamos",
    tags=["Préstamos"]
)


@router.get("/", response_model=list[PrestamoRespuesta])
def listar_prestamos(db: Session = Depends(get_db)):
    return db.query(Prestamo).order_by(Prestamo.id.desc()).all()


@router.get("/{prestamo_id}", response_model=PrestamoRespuesta)
def obtener_prestamo(
    prestamo_id: int,
    db: Session = Depends(get_db)
):
    prestamo = db.query(Prestamo).filter(
        Prestamo.id == prestamo_id
    ).first()

    if prestamo is None:
        raise HTTPException(404, "Préstamo no encontrado")

    return prestamo


@router.post(
    "/{prestamo_id}/entrega",
    response_model=PrestamoRespuesta
)
def registrar_entrega(
    prestamo_id: int,
    db: Session = Depends(get_db)
):
    prestamo = db.query(Prestamo).filter(
        Prestamo.id == prestamo_id
    ).first()

    if prestamo is None:
        raise HTTPException(404, "Préstamo no encontrado")

    if prestamo.estado != "aprobado":
        raise HTTPException(
            409,
            "Solo se puede entregar un préstamo que esté aprobado"
        )

    solicitud = db.query(Solicitud).filter(
        Solicitud.id == prestamo.solicitud_id
    ).first()

    if solicitud is None:
        raise HTTPException(404, "Solicitud relacionada no encontrada")

    recurso = db.query(Recurso).filter(
        Recurso.id == solicitud.recurso_id
    ).first()

    if recurso is None:
        raise HTTPException(404, "Recurso relacionado no encontrado")

    if recurso.estado != "disponible":
        raise HTTPException(
            409,
            "El recurso no está disponible para realizar la entrega"
        )

    prestamo.fecha_entrega_real = datetime.utcnow()
    prestamo.estado = "activo"
    recurso.estado = "prestado"

    db.commit()
    db.refresh(prestamo)

    return prestamo


@router.post(
    "/{prestamo_id}/devolucion",
    response_model=PrestamoRespuesta
)
def registrar_devolucion(
    prestamo_id: int,
    datos: DevolucionCrear,
    db: Session = Depends(get_db)
):
    prestamo = db.query(Prestamo).filter(
        Prestamo.id == prestamo_id
    ).first()

    if prestamo is None:
        raise HTTPException(404, "Préstamo no encontrado")

    if prestamo.estado != "activo":
        raise HTTPException(
            409,
            "Solo se puede devolver un préstamo que esté activo"
        )

    solicitud = db.query(Solicitud).filter(
        Solicitud.id == prestamo.solicitud_id
    ).first()

    if solicitud is None:
        raise HTTPException(404, "Solicitud relacionada no encontrada")

    recurso = db.query(Recurso).filter(
        Recurso.id == solicitud.recurso_id
    ).first()

    if recurso is None:
        raise HTTPException(404, "Recurso relacionado no encontrado")

    prestamo.fecha_devolucion_real = datetime.utcnow()
    prestamo.estado_fisico_devolucion = datos.estado_fisico
    prestamo.observaciones_devolucion = datos.observaciones
    prestamo.estado = "devuelto"

    # Si el equipo regresa dañado, pasa a mantenimiento.
    if datos.estado_fisico == "bueno":
        recurso.estado = "disponible"
    else:
        recurso.estado = "mantenimiento"

    db.commit()
    db.refresh(prestamo)

    return prestamo
