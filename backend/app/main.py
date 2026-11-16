from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import Base, SessionLocal, engine
from backend.app.models.entidades import Departamento, Recurso, Usuario
from backend.app.routers import (
    auth,
    departamentos,
    prestamos,
    prorrogas,
    recursos,
    reportes,
    solicitudes,
    usuarios,
)
from backend.app.security import hash_password

Base.metadata.create_all(bind=engine)


def inicializar_datos_base():
    db = SessionLocal()
    try:
        if db.query(Usuario).count() > 0:
            return

        dept_sistemas = Departamento(nombre="Ingeniería de Sistemas")
        dept_lab = Departamento(nombre="Laboratorios e Infraestructura")
        dept_coord = Departamento(nombre="Coordinación Académica")
        db.add_all([dept_sistemas, dept_lab, dept_coord])
        db.commit()
        db.refresh(dept_sistemas)
        db.refresh(dept_lab)
        db.refresh(dept_coord)

        usuarios_seed = [
            Usuario(
                nombre="Laura Gómez (Solicitante)",
                correo="solicitante@sigep.edu.co",
                tipo="estudiante",
                rol="solicitante",
                password_hash=hash_password("Sigep2026*"),
                departamento_id=dept_sistemas.id,
            ),
            Usuario(
                nombre="Carlos Méndez (Responsable)",
                correo="responsable@sigep.edu.co",
                tipo="contratista",
                rol="responsable",
                password_hash=hash_password("Sigep2026*"),
                departamento_id=dept_lab.id,
            ),
            Usuario(
                nombre="Dra. Elena Torres (Coordinación)",
                correo="coordinacion@sigep.edu.co",
                tipo="docente",
                rol="coordinacion",
                password_hash=hash_password("Sigep2026*"),
                departamento_id=dept_coord.id,
            ),
        ]
        db.add_all(usuarios_seed)

        recursos_seed = [
            Recurso(
                nombre="Portátil Lenovo ThinkPad T14",
                codigo="EQ-001",
                marca="Lenovo",
                modelo="ThinkPad T14 Gen 4",
                serial="SN-LNV-1001",
                estado="disponible",
            ),
            Recurso(
                nombre="VideoBeam Epson PowerLite",
                codigo="EQ-002",
                marca="Epson",
                modelo="PowerLite E20",
                serial="SN-EPS-2002",
                estado="disponible",
            ),
            Recurso(
                nombre="Kit Arduino & Sensores IoT",
                codigo="EQ-003",
                marca="Arduino",
                modelo="Uno R4 WiFi",
                serial="SN-ARD-3003",
                estado="disponible",
            ),
        ]
        db.add_all(recursos_seed)
        db.commit()
    finally:
        db.close()


inicializar_datos_base()

app = FastAPI(
    title="Sistema de Préstamos de Equipos",
    description="API REST para gestionar préstamos de equipos y recursos institucionales.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(recursos.router)
app.include_router(departamentos.router)
app.include_router(usuarios.router)
app.include_router(solicitudes.router)
app.include_router(prestamos.router)
app.include_router(prorrogas.router)
app.include_router(reportes.router)


@app.get("/")
def inicio():
    return {
        "mensaje": "API del sistema de préstamos funcionando correctamente"
    }


@app.get("/api/v1/estado")
def estado():
    return {
        "estado": "activo",
        "mensaje": "El backend está funcionando correctamente"
    }