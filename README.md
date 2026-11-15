# Trabajo-Final-Grupo-08
# SIGEP — Sistema Institucional de Gestión de Préstamos de Equipos

Repositorio del proyecto final de la asignatura **Aplicaciones y Servicios Web** (**Grupo 08**).

Aplicación web cliente-servidor desarrollada con **FastAPI + SQLite + SQLAlchemy** en el backend y **HTML5 + CSS3 + JavaScript modular (ES Modules)** en el frontend para gestionar el inventario de equipos institucionales, usuarios, departamentos, solicitudes de préstamo, entregas, devoluciones, prórrogas y reportes de coordinación.

---

## Arquitectura y Estructura del Proyecto

```text
Trabajo-Final-Grupo-08-main/
├── backend/
│   └── app/
│       ├── models/
│       │   └── entidades.py        # Modelos ORM (Departamento, Usuario, Recurso, Solicitud, Préstamo, Prórroga)
│       ├── routers/
│       │   ├── departamentos.py    # Endpoints CRUD /api/v1/departamentos
│       │   ├── usuarios.py         # Endpoints CRUD /api/v1/usuarios
│       │   ├── recursos.py         # Endpoints CRUD /api/v1/recursos
│       │   ├── solicitudes.py      # Registro y evaluación /api/v1/solicitudes
│       │   ├── prestamos.py        # Entregas y devoluciones /api/v1/prestamos
│       │   ├── prorrogas.py        # Solicitud y decisión /api/v1/prorrogas
│       │   └── reportes.py         # Consolidado e historial /api/v1/reportes
│       ├── schemas/                # Esquemas de validación de entrada y salida (Pydantic)
│       ├── database.py             # Configuración de SQLAlchemy y conexión SQLite
│       └── main.py                 # Punto de entrada FastAPI y configuración CORS
├── frontend/
│   ├── css/
│   │   └── styles.css              # Sistema de estilos institucional, tablas, badges y modales
│   ├── js/
│   │   ├── api.js                  # Cliente HTTP centralizado (Fetch y manejo de errores 400/404/409/422)
│   │   ├── state.js                # Caché compartida, formateadores, modales y notificaciones
│   │   ├── dashboard.js            # Vista 1: Panel general y métricas en tiempo real
│   │   ├── recursos.js             # Vista 2: Catálogo e inventario de equipos
│   │   ├── usuarios.js             # Vista 3: Gestión de usuarios institucionales
│   │   ├── departamentos.js        # Vista 4: Gestión de departamentos y áreas
│   │   ├── solicitudes.js          # Vista 5: Registro y evaluación de solicitudes
│   │   ├── prestamos.js            # Vista 6: Registro de entregas y devoluciones físicas
│   │   ├── prorrogas.js            # Vista 7: Solicitud y decisión de prórrogas
│   │   ├── reportes.js             # Vista 8: Reportes de coordinación y exportación CSV
│   │   └── main.js                 # Enrutador SPA y monitoreo del estado de la API
│   └── index.html                  # Interfaz web principal
├── docs/
│   ├── requisitos.md               # Especificación de requisitos funcionales y no funcionales
│   ├── diseno.md                   # Diseño técnico, modelo de datos y contratos REST
│   └── trazabilidad.md             # Matriz de trazabilidad de requisitos
├── evidencias/                     # Capturas y evidencias de pruebas funcionales
├── .env.example                    # Plantilla de variables de entorno
└── requirements.txt                # Dependencias de Python para el backend

Requisitos Previos

- Python 3.10 o superior
- Navegador web moderno (Chrome, Edge, Firefox)

Instalación y Ejecución

1. Configurar e iniciar el Backend (FastAPI)
Abre una terminal en la carpeta raíz del proyecto (Trabajo-Final-Grupo-08-main) y ejecuta:

# (Opcional) Crear y activar entorno virtual
python -m venv .venv
# En Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor backend en el puerto 8000
uvicorn backend.app.main:app --reload

- Servidor API: http://127.0.0.1:8000

- Estado del servicio: http://127.0.0.1:8000/api/v1/estado

- Documentación interactiva (Swagger UI): http://127.0.0.1:8000/docs

2. Iniciar el Frontend (Interfaz Web)

Sin cerrar la terminal del backend, abre una segunda terminal en la carpeta raíz del proyecto y levanta el servidor web en el puerto 5500 (puerto autorizado en CORS en backend/app/main.py):

python -m http.server 5500 --directory frontend

(Alternativamente, puedes abrir frontend/index.html con la extensión Live Server de VS Code en el puerto 5500).

- Aplicación Web: http://127.0.0.1:5500

Funcionalidades Principales del Sistema

1. Panel General: Indicadores en tiempo real de recursos disponibles/prestados, solicitudes pendientes, préstamos activos y comunidad registrada, junto con el indicador de conexión con la API.

2. Catálogo de Recursos: Registro, consulta, edición, filtrado por estado (disponible, prestado, mantenimiento, inactivo) y eliminación validada de equipos.

3. Usuarios y Departamentos: Administración de unidades institucionales y personas (estudiante, docente, contratista, otro) con validación de unicidad e integridad referencial.

4. Solicitudes de Préstamo: Registro de solicitudes verificando disponibilidad y fechas válidas, y evaluación (aprobada / rechazada) por un responsable con generación automática del préstamo al aprobarse.

5. Préstamos, Entregas y Devoluciones: Control de entrega física (cambia préstamo a activo y equipo a prestado) y recepción del equipo según condición física (bueno vuelve a disponible; dañado o incompleto pasa a mantenimiento).

6. Prórrogas: Solicitud de extensión sobre préstamos activos y evaluación por un responsable verificando que no existan conflictos de agenda.

7. Reportes de Coordinación: Consolidado estadístico por estado, listado de préstamos activos, historial completo y exportación directa a archivo CSV.

Endpoints Principales de la API (/api/v1)

Módulo             Base URL             Operaciones soportadas

Estado           /api/v1/estado          GET (verificación de disponibilidad del servicio)

Departamentos    /api/v1/departamentos   GET, POST, PATCH /{id}, DELETE /{id}

Usuarios         /api/v1/usuarios        GET, POST, PATCH /{id}, DELETE /{id}

Recursos         /api/v1/recursos        GET, POST, PATCH /{id}, DELETE /{id}

Solicitudes      /api/v1/solicitudes     GET, POST, PATCH /{id}/decision

Préstamos        /api/v1/prestamos       GET, POST /{id}/entrega, POST /{id}/devolucion

Prórrogas        /api/v1/prorrogas       GET, POST, PATCH /{id}/decision

Reportes         /api/v1/reportes        GET /resumen, GET /prestamos-activos, GET /historial-prestamos"