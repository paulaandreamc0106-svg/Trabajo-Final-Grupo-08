from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, DateTime, Date, Text, ForeignKey
)

from backend.app.database import Base


class Departamento(Base):
    __tablename__ = "departamentos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    correo = Column(String(150), nullable=False, unique=True)
    tipo = Column(String(30), nullable=False)
    rol = Column(String(30), nullable=False, default="solicitante")
    password_hash = Column(String(255), nullable=False)
    departamento_id = Column(
        Integer,
        ForeignKey("departamentos.id"),
        nullable=True
    )


class Recurso(Base):
    __tablename__ = "recursos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    codigo = Column(String(50), nullable=False, unique=True)
    marca = Column(String(100))
    modelo = Column(String(100))
    serial = Column(String(100), unique=True)
    estado = Column(String(30), default="disponible")
    fecha_registro = Column(DateTime, default=datetime.utcnow)


class Solicitud(Base):
    __tablename__ = "solicitudes"

    id = Column(Integer, primary_key=True, index=True)
    solicitante_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )
    recurso_id = Column(
        Integer,
        ForeignKey("recursos.id"),
        nullable=False
    )
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)
    fecha_entrega = Column(Date, nullable=False)
    fecha_devolucion_prevista = Column(Date, nullable=False)
    motivo = Column(Text)
    estado = Column(String(30), default="pendiente")
    observacion_decision = Column(Text)


class Prestamo(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True)
    solicitud_id = Column(
        Integer,
        ForeignKey("solicitudes.id"),
        nullable=False,
        unique=True
    )
    responsable_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )
    fecha_entrega_real = Column(DateTime)
    fecha_devolucion_prevista = Column(Date, nullable=False)
    fecha_devolucion_real = Column(DateTime)
    estado = Column(String(30), default="activo")
    estado_fisico_devolucion = Column(String(100))
    observaciones_devolucion = Column(Text)


class Prorroga(Base):
    __tablename__ = "prorrogas"

    id = Column(Integer, primary_key=True, index=True)
    prestamo_id = Column(
        Integer,
        ForeignKey("prestamos.id"),
        nullable=False
    )
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)
    nueva_fecha_devolucion = Column(Date, nullable=False)
    motivo = Column(Text)
    estado = Column(String(30), default="pendiente")
    responsable_decision_id = Column(
        Integer,
        ForeignKey("usuarios.id")
    )
    observacion_decision = Column(Text)
