from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ProrrogaCrear(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    prestamo_id: int = Field(gt=0)
    nueva_fecha_devolucion: date
    motivo: str = Field(min_length=5, max_length=500)

    @model_validator(mode="after")
    def validar_fecha(self):
        if self.nueva_fecha_devolucion <= date.today():
            raise ValueError(
                "La nueva fecha de devolución debe ser futura"
            )
        return self


class ProrrogaDecision(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    responsable_decision_id: int | None = Field(default=None, gt=0)
    decision: Literal["aprobada", "rechazada"]
    observacion: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validar_observacion(self):
        if self.decision == "rechazada" and not self.observacion:
            raise ValueError(
                "Debes indicar el motivo del rechazo"
            )
        return self


class ProrrogaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    prestamo_id: int
    fecha_solicitud: datetime | None
    nueva_fecha_devolucion: date
    motivo: str | None
    estado: str
    responsable_decision_id: int | None
    observacion_decision: str | None = None
