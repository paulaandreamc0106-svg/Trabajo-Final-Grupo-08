
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


EstadoFisico = Literal["bueno", "dañado", "incompleto"]


class DevolucionCrear(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    estado_fisico: EstadoFisico
    observaciones: str | None = Field(default=None, max_length=500)


class PrestamoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    solicitud_id: int
    responsable_id: int
    fecha_entrega_real: datetime | None
    fecha_devolucion_prevista: date
    fecha_devolucion_real: datetime | None
    estado: str
    estado_fisico_devolucion: str | None
    observaciones_devolucion: str | None
