
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import (
    Prorroga,
    Prestamo,
    Solicitud,
    Usuario,
)
from backend.app.schemas.prorrogas import (
    ProrrogaCrear,
    ProrrogaDecision,
    ProrrogaRespuesta,
)


router = APIRouter(
    prefix="/api/v1/prorrogas",
    tags=["Prórrogas"]
)


@router.post("/", response_model=ProrrogaRespuesta, status_code=201)
def crear_prorroga(
    datos: ProrrogaCrear,
    db: Session = Depends(get_db)
):
    prestamo = (
        db.query(Prestamo)
        .join(Solicitud)
        .filter(
            Solicitud.solicitante_id == datos.solicitante_id,
            Prestamo.estado == "activo"
        )
        .first()
    )

    if not prestamo:
        raise HTTPException(
            status_code=404,
            detail="No se encontró un préstamo activo para este solicitante"
        )

    if datos.nueva_fecha_devolucion <= prestamo.fecha_devolucion_prevista:
        raise HTTPException(
            status_code=400,
            detail="La nueva fecha debe ser posterior a la fecha de devolución actual"
        )

    pendiente = db.query(Prorroga).filter(
        Prorroga.prestamo_id == prestamo.id,
        Prorroga.estado == "pendiente"
    ).first()

    if pendiente:
        raise HTTPException(
            status_code=409,
            detail="Este préstamo ya tiene una prórroga pendiente"
        )

    prorroga = Prorroga(
        prestamo_id=prestamo.id,
        nueva_fecha_devolucion=datos.nueva_fecha_devolucion,
        motivo=datos.motivo,
        estado="pendiente"
    )

    db.add(prorroga)
    db.commit()
    db.refresh(prorroga)

    return prorroga


@router.get("/", response_model=list[ProrrogaRespuesta])
def listar_prorrogas(db: Session = Depends(get_db)):
    return db.query(Prorroga).order_by(
        Prorroga.id.desc()
    ).all()


@router.get("/{prorroga_id}", response_model=ProrrogaRespuesta)
def obtener_prorroga(
    prorroga_id: int,
    db: Session = Depends(get_db)
):
    prorroga = db.query(Prorroga).filter(
        Prorroga.id == prorroga_id
    ).first()

    if not prorroga:
        raise HTTPException(
            status_code=404,
            detail="Prórroga no encontrada"
        )

    return prorroga


@router.patch("/{prorroga_id}/decision", response_model=ProrrogaRespuesta)
def decidir_prorroga(
    prorroga_id: int,
    datos: ProrrogaDecision,
    db: Session = Depends(get_db)
):
    prorroga = db.query(Prorroga).filter(
        Prorroga.id == prorroga_id
    ).first()

    if not prorroga:
        raise HTTPException(
            status_code=404,
            detail="Prórroga no encontrada"
        )

    if prorroga.estado != "pendiente":
        raise HTTPException(
            status_code=409,
            detail="Esta prórroga ya fue evaluada"
        )

    responsable = db.query(Usuario).filter(
        Usuario.id == datos.responsable_decision_id
    ).first()

    if not responsable:
        raise HTTPException(
            status_code=404,
            detail="El responsable indicado no existe"
        )

    prestamo = db.query(Prestamo).filter(
        Prestamo.id == prorroga.prestamo_id
    ).first()

    if not prestamo or prestamo.estado != "activo":
        raise HTTPException(
            status_code=409,
            detail="El préstamo ya no está activo"
        )

    if datos.decision == "aprobada":
        solicitud = db.query(Solicitud).filter(
            Solicitud.id == prestamo.solicitud_id
        ).first()

        fecha_actual = prestamo.fecha_devolucion_prevista
        nueva_fecha = prorroga.nueva_fecha_devolucion

        otros_prestamos = (
            db.query(Prestamo)
            .join(Solicitud)
            .filter(
                Solicitud.recurso_id == solicitud.recurso_id,
                Prestamo.id != prestamo.id,
                Prestamo.estado.in_(["aprobado", "activo"]),
                Solicitud.fecha_entrega <= nueva_fecha,
                Prestamo.fecha_devolucion_prevista >= fecha_actual
            )
            .first()
        )

        if otros_prestamos:
            raise HTTPException(
                status_code=409,
                detail="No se puede aprobar la prórroga porque existe otro préstamo del mismo recurso en ese periodo"
            )

        prestamo.fecha_devolucion_prevista = nueva_fecha
        solicitud.fecha_devolucion_prevista = nueva_fecha

    prorroga.estado = datos.decision
    prorroga.responsable_decision_id = datos.responsable_decision_id

    db.commit()
    db.refresh(prorroga)

    return prorroga
