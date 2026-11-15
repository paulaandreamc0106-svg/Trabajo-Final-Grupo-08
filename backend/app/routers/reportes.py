
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app.models import (
    Recurso,
    Solicitud,
    Prestamo,
    Usuario
)
from backend.app.schemas.reportes import (
    ResumenReportes,
    PrestamoReporte
)

router = APIRouter(
    prefix="/api/v1/reportes",
    tags=["Reportes de coordinación"]
)

@router.get("/resumen", response_model=ResumenReportes)
def obtener_resumen(db: Session = Depends(get_db)):

    total_recursos = db.query(func.count(Recurso.id)).scalar() or 0
    total_solicitudes = db.query(func.count(Solicitud.id)).scalar() or 0
    total_prestamos = db.query(func.count(Prestamo.id)).scalar() or 0

    recursos = db.query(
        Recurso.estado,
        func.count(Recurso.id)
    ).group_by(Recurso.estado).all()

    solicitudes = db.query(
        Solicitud.estado,
        func.count(Solicitud.id)
    ).group_by(Solicitud.estado).all()

    prestamos = db.query(
        Prestamo.estado,
        func.count(Prestamo.id)
    ).group_by(Prestamo.estado).all()

    return {
        "total_recursos": total_recursos,
        "recursos_por_estado": {
            estado: cantidad for estado, cantidad in recursos
        },
        "total_solicitudes": total_solicitudes,
        "solicitudes_por_estado": {
            estado: cantidad for estado, cantidad in solicitudes
        },
        "total_prestamos": total_prestamos,
        "prestamos_por_estado": {
            estado: cantidad for estado, cantidad in prestamos
        }
    }

@router.get("/prestamos-activos", response_model=list[PrestamoReporte])
def obtener_prestamos_activos(db: Session = Depends(get_db)):

    resultados = (
        db.query(Prestamo, Solicitud, Recurso, Usuario)
        .join(Solicitud, Prestamo.solicitud_id == Solicitud.id)
        .join(Recurso, Solicitud.recurso_id == Recurso.id)
        .join(Usuario, Solicitud.solicitante_id == Usuario.id)
        .filter(Prestamo.estado == "activo")
        .order_by(Prestamo.fecha_devolucion_prevista.asc())
        .all()
    )

    return [
        {
            "prestamo_id": prestamo.id,
            "solicitud_id": solicitud.id,
            "solicitante_id": usuario.id,
            "nombre_solicitante": usuario.nombre,
            "recurso_id": recurso.id,
            "nombre_recurso": recurso.nombre,
            "codigo_recurso": recurso.codigo,
            "fecha_entrega_real": prestamo.fecha_entrega_real,
            "fecha_devolucion_prevista": prestamo.fecha_devolucion_prevista,
            "fecha_devolucion_real": prestamo.fecha_devolucion_real,
            "estado": prestamo.estado,
            "estado_fisico_devolucion": prestamo.estado_fisico_devolucion,
            "observaciones_devolucion": prestamo.observaciones_devolucion
        }
        for prestamo, solicitud, recurso, usuario in resultados
    ]

@router.get("/historial-prestamos", response_model=list[PrestamoReporte])
def obtener_historial_prestamos(db: Session = Depends(get_db)):

    resultados = (
        db.query(Prestamo, Solicitud, Recurso, Usuario)
        .join(Solicitud, Prestamo.solicitud_id == Solicitud.id)
        .join(Recurso, Solicitud.recurso_id == Recurso.id)
        .join(Usuario, Solicitud.solicitante_id == Usuario.id)
        .order_by(Prestamo.id.desc())
        .all()
    )

    return [
        {
            "prestamo_id": prestamo.id,
            "solicitud_id": solicitud.id,
            "solicitante_id": usuario.id,
            "nombre_solicitante": usuario.nombre,
            "recurso_id": recurso.id,
            "nombre_recurso": recurso.nombre,
            "codigo_recurso": recurso.codigo,
            "fecha_entrega_real": prestamo.fecha_entrega_real,
            "fecha_devolucion_prevista": prestamo.fecha_devolucion_prevista,
            "fecha_devolucion_real": prestamo.fecha_devolucion_real,
            "estado": prestamo.estado,
            "estado_fisico_devolucion": prestamo.estado_fisico_devolucion,
            "observaciones_devolucion": prestamo.observaciones_devolucion
        }
        for prestamo, solicitud, recurso, usuario in resultados
    ]