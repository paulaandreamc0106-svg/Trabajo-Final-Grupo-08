
from datetime import date, datetime
from pydantic import BaseModel

class ResumenReportes(BaseModel):
    total_recursos: int
    recursos_por_estado: dict[str, int]
    total_solicitudes: int
    solicitudes_por_estado: dict[str, int]
    total_prestamos: int
    prestamos_por_estado: dict[str, int]

class PrestamoReporte(BaseModel):
    prestamo_id: int
    solicitud_id: int
    solicitante_id: int
    nombre_solicitante: str
    recurso_id: int
    nombre_recurso: str
    codigo_recurso: str
    fecha_entrega_real: datetime | None
    fecha_devolucion_prevista: date
    fecha_devolucion_real: datetime | None
    estado: str
    estado_fisico_devolucion: str | None
    observaciones_devolucion: str | None