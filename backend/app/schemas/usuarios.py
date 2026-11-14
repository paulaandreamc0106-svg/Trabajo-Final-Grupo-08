
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


TipoUsuario = Literal[
    "estudiante",
    "docente",
    "contratista",
    "otro"
]


class UsuarioCrear(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=2, max_length=150)
    correo: str = Field(min_length=5, max_length=150)
    tipo: TipoUsuario
    departamento_id: int | None = None

    @field_validator("correo")
    @classmethod
    def validar_correo(cls, valor):
        if "@" not in valor or "." not in valor.split("@")[-1]:
            raise ValueError("Debe ingresar un correo válido")
        return valor.lower()


class UsuarioActualizar(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    correo: str | None = Field(default=None, min_length=5, max_length=150)
    tipo: TipoUsuario | None = None
    departamento_id: int | None = None

    @field_validator("correo")
    @classmethod
    def validar_correo(cls, valor):
        if valor is not None:
            if "@" not in valor or "." not in valor.split("@")[-1]:
                raise ValueError("Debe ingresar un correo válido")
            return valor.lower()
        return valor


class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    correo: str
    tipo: str
    departamento_id: int | None
