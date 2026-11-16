from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


TipoUsuario = Literal[
    "estudiante",
    "docente",
    "contratista",
    "otro"
]

RolSistema = Literal[
    "solicitante",
    "responsable",
    "coordinacion"
]


class UsuarioCrear(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=2, max_length=150)
    correo: str = Field(min_length=5, max_length=150)
    tipo: TipoUsuario
    rol: RolSistema = "solicitante"
    password: str = Field(default="Sigep2026*", min_length=6, max_length=100)
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
    rol: RolSistema | None = None
    password: str | None = Field(default=None, min_length=6, max_length=100)
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
    rol: str
    departamento_id: int | None


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    correo: str = Field(min_length=5, max_length=150)
    password: str = Field(min_length=4, max_length=100)

    @field_validator("correo")
    @classmethod
    def normalizar_correo(cls, valor):
        return valor.lower()


class LoginRespuesta(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioRespuesta
