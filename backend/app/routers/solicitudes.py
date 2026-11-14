
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.entidades import (
    Solicitud,
    Usuario,
    Recurso,
    Prestamo
)
from backend.app.schemas.solicitudes import (
    SolicitudCrear,
    SolicitudRespuesta,
    SolicitudDecision
)

router = APIRouter(
    prefix="/api/v1/solicitudes",
    tags=["Solicitudes"]
)


@router.post("/", response_model=SolicitudRespuesta, status_code=201)
def crear_solicitud(
    datos: SolicitudCrear,
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(
        Usuario.id == datos.solicitante_id
    ).first()

    if usuario is None:
        raise HTTPException(404, "El solicitante no existe")

    recurso = db.query(Recurso).filter(
        Recurso.id == datos.recurso_id
    ).first()

    if recurso is None:
        raise HTTPException(404, "El recurso no existe")

    if recurso.estado != "disponible":
        raise HTTPException(
            409,
            "El recurso no está disponible para solicitarse"
        )

    solicitud = Solicitud(
        **datos.model_dump(),
        estado="pendiente"
    )

    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)

    return solicitud


@router.get("/", response_model=list[SolicitudRespuesta])
def listar_solicitudes(db: Session = Depends(get_db)):
    return db.query(Solicitud).order_by(
        Solicitud.id.desc()
    ).all()


@router.get("/{solicitud_id}", response_model=SolicitudRespuesta)
def obtener_solicitud(
    solicitud_id: int,
    db: Session = Depends(get_db)
):
    solicitud = db.query(Solicitud).filter(
        Solicitud.id == solicitud_id
    ).first()

    if solicitud is None:
        raise HTTPException(404, "Solicitud no encontrada")

    return solicitud


@router.patch(
    "/{solicitud_id}/decision",
    response_model=SolicitudRespuesta
)
def decidir_solicitud(
    solicitud_id: int,
    datos: SolicitudDecision,
    db: Session = Depends(get_db)
):
    solicitud = db.query(Solicitud).filter(
        Solicitud.id == solicitud_id
    ).first()

    if solicitud is None:
        raise HTTPException(404, "Solicitud no encontrada")

    if solicitud.estado != "pendiente":
        raise HTTPException(
            409,
            "La solicitud ya tiene una decisión registrada"
        )

    responsable = db.query(Usuario).filter(
        Usuario.id == datos.responsable_id
    ).first()

    if responsable is None:
        raise HTTPException(404, "El responsable no existe")

    if datos.decision == "rechazada":
        solicitud.estado = "rechazada"
        solicitud.observacion_decision = datos.observacion

        db.commit()
        db.refresh(solicitud)
        return solicitud

    recurso = db.query(Recurso).filter(
        Recurso.id == solicitud.recurso_id
    ).first()

    if recurso is None or recurso.estado != "disponible":
        raise HTTPException(
            409,
            "El recurso no está disponible para aprobarse"
        )

    # Buscar préstamos aprobados o activos del mismo recurso
    # cuyas fechas se crucen con la solicitud.
    prestamos_existentes = (
        db.query(Prestamo)
        .join(Solicitud, Prestamo.solicitud_id == Solicitud.id)
        .filter(
            Solicitud.recurso_id == solicitud.recurso_id,
            Prestamo.estado.in_(["aprobado", "activo"]),
            Solicitud.fecha_entrega <= solicitud.fecha_devolucion_prevista,
            Prestamo.fecha_devolucion_prevista >= solicitud.fecha_entrega
        )
        .first()
    )

    if prestamos_existentes:
        raise HTTPException(
            409,
            "El recurso ya tiene un préstamo aprobado o activo para ese periodo"
        )

    prestamo = Prestamo(
        solicitud_id=solicitud.id,
        responsable_id=datos.responsable_id,
        fecha_devolucion_prevista=solicitud.fecha_devolucion_prevista,
        estado="aprobado"
    )

    solicitud.estado = "aprobada"
    solicitud.observacion_decision = datos.observacion

    db.add(prestamo)
    db.commit()
    db.refresh(solicitud)

    return solicitud
