
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


EstadoRecurso = Literal[
    "disponible",
    "prestado",
    "mantenimiento",
    "inactivo"
]


class RecursoBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=2, max_length=150)
    codigo: str = Field(min_length=1, max_length=50)
    marca: str | None = Field(default=None, max_length=100)
    modelo: str | None = Field(default=None, max_length=100)
    serial: str | None = Field(default=None, max_length=100)
    estado: EstadoRecurso = "disponible"


class RecursoCrear(RecursoBase):
    pass


class RecursoActualizar(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    codigo: str | None = Field(default=None, min_length=1, max_length=50)
    marca: str | None = Field(default=None, max_length=100)
    modelo: str | None = Field(default=None, max_length=100)
    serial: str | None = Field(default=None, max_length=100)
    estado: EstadoRecurso | None = None


class RecursoRespuesta(RecursoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
