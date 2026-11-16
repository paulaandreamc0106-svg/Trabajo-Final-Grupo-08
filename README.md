# Trabajo-Final-Grupo-08
# Sistema Institucional de Gestión de Préstamos de Equipos (SIGEP)

Sistema web cliente-servidor para gestionar solicitudes, aprobaciones, entregas, devoluciones, prórrogas y reportes de préstamos de equipos institucionales, con autenticación y control de acceso basado en roles.

## Integrantes - Grupo 08
- Paula Andrea Montoya Corrales
- Juan Esteban Velez Tobon

## Tecnologías Utilizadas
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn
- **Base de Datos:** SQLite (`app.db`)
- **Frontend:** HTML5, CSS3, JavaScript (ES6 Modules + Fetch API)
- **Seguridad:** Hash PBKDF2-SHA256 para contraseñas y tokens Bearer firmados con HMAC-SHA256

## Estructura del Proyecto
```text
├── backend/
│   └── app/
│       ├── database.py         # Configuración de conexión SQLAlchemy y sesión DB
│       ├── main.py             # Inicialización FastAPI, CORS, seed inicial y routers
│       ├── security.py         # Hashing de contraseñas, tokens Bearer y validación de roles
│       ├── models/
│       │   └── entidades.py    # Modelos ORM (Departamento, Usuario, Recurso, Solicitud, Prestamo, Prorroga)
│       ├── routers/            # Endpoints REST v1 protegidos por rol
│       └── schemas/            # Validaciones de entrada y salida con Pydantic
├── docs/                       # Documentación técnica (requisitos, diseño, trazabilidad)
├── evidencias/                 # Capturas y pruebas de ejecución
├── frontend/
│   ├── css/styles.css          # Estilos de la aplicación
│   ├── js/                     # Módulos ES6 por vista, estado global y cliente HTTP
│   └── index.html              # Interfaz SPA con login y navegación por rol
└── requirements.txt            # Dependencias del proyecto

Cómo Ejecutar el Proyecto

1. Backend (FastAPI)

# Crear y activar entorno virtual (opcional)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn backend.app.main:app --reload

- API disponible en: http://127.0.0.1:8000

- Documentación interactiva Swagger UI: http://127.0.0.1:8000/docs

2. Frontend
Servir la carpeta frontend/ mediante Live Server (puerto 5500) o con Python:

python -m http.server 5500 -d frontend

- Abrir en el navegador: http://127.0.0.1:5500

Cuentas de Prueba Precargadas (Seed)
Al iniciar el sistema por primera vez se crean automáticamente tres usuarios (uno por cada rol operativo):

Rol               Correo                      Contraseña              Permisos principales

Solicitante      solicitante@sigep.edu.co     Sigep2026*             Consultar catálogo disponible, crear solicitudes, solicitar prórrogas sobre sus préstamos activos y consultar su historial.

Responsable      responsable@sigep.edu.co     Sigep2026*             Administrar recursos, usuarios y departamentos; aprobar/rechazar solicitudes y prórrogas; registrar entregas y devoluciones.

Coordinación     coordinacion@sigep.edu.co    Sigep2026*             Consultar panel general, reportes consolidados, préstamos activos e historial completo (modo supervisión).