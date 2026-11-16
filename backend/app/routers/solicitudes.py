from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.entidades import (
    Prestamo,
    Recurso,
    Solicitud,
    Usuario,
)
from backend.app.schemas.solicitudes import (
    SolicitudCrear,
    SolicitudDecision,
    SolicitudRespuesta,
)
from backend.app.security import get_current_user, require_roles

router = APIRouter(
    prefix="/api/v1/solicitudes",
    tags=["Solicitudes"]
)


@router.post("/", response_model=SolicitudRespuesta, status_code=201)
def crear_solicitud(
    datos: SolicitudCrear,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_roles("solicitante", "responsable")),
):
    solicitante_id = (
        usuario_actual.id
        if usuario_actual.rol == "solicitante"
        else (datos.solicitante_id or usuario_actual.id)
    )

    usuario = db.query(Usuario).filter(
        Usuario.id == solicitante_id
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

    cruce_fechas = (
        db.query(Prestamo)
        .join(Solicitud, Prestamo.solicitud_id == Solicitud.id)
        .filter(
            Solicitud.recurso_id == datos.recurso_id,
            Prestamo.estado.in_(["aprobado", "activo"]),
            Solicitud.fecha_entrega <= datos.fecha_devolucion_prevista,
            Prestamo.fecha_devolucion_prevista >= datos.fecha_entrega,
        )
        .first()
    )

    if cruce_fechas:
        raise HTTPException(
            409,
            "El recurso ya tiene un préstamo aprobado o activo en el rango de fechas solicitado"
        )

    solicitud = Solicitud(
        solicitante_id=solicitante_id,
        recurso_id=datos.recurso_id,
        fecha_entrega=datos.fecha_entrega,
        fecha_devolucion_prevista=datos.fecha_devolucion_prevista,
        motivo=datos.motivo,
        estado="pendiente",
    )

    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)

    return solicitud


@router.get("/", response_model=list[SolicitudRespuesta])
def listar_solicitudes(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    query = db.query(Solicitud)
    if usuario_actual.rol == "solicitante":
        query = query.filter(Solicitud.solicitante_id == usuario_actual.id)
    return query.order_by(Solicitud.id.desc()).all()


@router.get("/{solicitud_id}", response_model=SolicitudRespuesta)
def obtener_solicitud(
    solicitud_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    solicitud = db.query(Solicitud).filter(
        Solicitud.id == solicitud_id
    ).first()

    if solicitud is None:
        raise HTTPException(404, "Solicitud no encontrada")

    if (
        usuario_actual.rol == "solicitante"
        and solicitud.solicitante_id != usuario_actual.id
    ):
        raise HTTPException(403, "No tienes permiso para ver esta solicitud")

    return solicitud


@router.patch(
    "/{solicitud_id}/decision",
    response_model=SolicitudRespuesta
)
def decidir_solicitud(
    solicitud_id: int,
    datos: SolicitudDecision,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_roles("responsable")),
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

    responsable_id = datos.responsable_id or usuario_actual.id
    responsable = db.query(Usuario).filter(
        Usuario.id == responsable_id
    ).first()

    if responsable is None or responsable.rol != "responsable":
        raise HTTPException(
            400,
            "El usuario indicado no tiene rol de responsable de préstamos"
        )

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
        responsable_id=responsable_id,
        fecha_devolucion_prevista=solicitud.fecha_devolucion_prevista,
        estado="aprobado"
    )

    solicitud.estado = "aprobada"
    solicitud.observacion_decision = datos.observacion

    db.add(prestamo)
    db.commit()
    db.refresh(solicitud)

    return solicitud
