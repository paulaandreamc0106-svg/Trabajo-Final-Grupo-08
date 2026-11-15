
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


class SolicitudCrear(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    solicitante_id: int = Field(gt=0)
    recurso_id: int = Field(gt=0)
    fecha_entrega: date
    fecha_devolucion_prevista: date
    motivo: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validar_fechas(self):
        if self.fecha_entrega < date.today():
            raise ValueError("La fecha de entrega no puede ser anterior a hoy")

        if self.fecha_devolucion_prevista <= self.fecha_entrega:
            raise ValueError(
                "La devolución debe ser posterior a la fecha de entrega"
            )

        return self


class SolicitudRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    solicitante_id: int
    recurso_id: int
    fecha_solicitud: datetime | None = None
    fecha_entrega: date
    fecha_devolucion_prevista: date
    motivo: str | None
    estado: str
    observacion_decision: str | None


class SolicitudDecision(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    responsable_id: int = Field(gt=0)
    decision: str
    observacion: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validar_decision(self):
        if self.decision not in ("aprobada", "rechazada"):
            raise ValueError("La decisión debe ser aprobada o rechazada")

        if self.decision == "rechazada" and not self.observacion:
            raise ValueError("Debes indicar el motivo del rechazo")

        return self
