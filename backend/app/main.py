
from fastapi import FastAPI

from backend.app.database import Base, engine
from backend.app import models
from backend.app.routers import recursos
from backend.app.routers import departamentos
from backend.app.routers import usuarios
from backend.app.routers import solicitudes
from backend.app.routers import prestamos
from backend.app.routers import prorrogas
from backend.app.routers import reportes
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Préstamos de Equipos",
    description="API REST para gestionar préstamos de equipos y recursos institucionales.",
    version="1.0.0"
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
