# Diseño de la aplicación y de los servicios web
## Sistema de gestión de préstamos de equipos y recursos

### 1. Introducción

Este documento describe el diseño técnico del sistema de gestión de préstamos de equipos y recursos institucionales.

Se definen la arquitectura de la aplicación, los componentes principales, el modelo de datos, las relaciones entre entidades, los recorridos del proceso, los servicios web y las decisiones tecnológicas utilizadas durante el desarrollo.

El diseño se encuentra basado en los requisitos funcionales y no funcionales establecidos en `docs/requisitos.md`, así como en la información obtenida durante la entrevista y las decisiones tomadas por el equipo de desarrollo.

### 2. Arquitectura del sistema

El sistema utiliza una arquitectura cliente-servidor compuesta por una interfaz web, un backend, una API REST y una base de datos relacional.

#### 2.1. Frontend

Es la interfaz web con la que interactúan los usuarios.

Se desarrollará utilizando HTML, CSS y JavaScript.

Sus responsabilidades son:

- Mostrar el catálogo de equipos y recursos.
- Consultar la disponibilidad de los recursos.
- Permitir el registro de solicitudes.
- Mostrar el estado de las solicitudes y préstamos.
- Proporcionar interfaces para que el responsable gestione solicitudes.
- Permitir registrar entregas y devoluciones.
- Permitir gestionar solicitudes de prórroga.
- Mostrar información consolidada para coordinación.

El frontend se comunicará con el backend mediante solicitudes HTTP a la API REST.

#### 2.2. Backend

Es el componente encargado de procesar las operaciones y aplicar las reglas de negocio del sistema.

Se desarrollará utilizando Python y FastAPI.

Sus responsabilidades son:

- Recibir las solicitudes enviadas desde el frontend.
- Validar los datos recibidos.
- Aplicar las reglas de negocio.
- Gestionar los recursos, usuarios y departamentos.
- Registrar y consultar solicitudes de préstamo.
- Gestionar aprobaciones y rechazos.
- Registrar entregas y devoluciones.
- Gestionar solicitudes de prórroga.
- Verificar las condiciones de disponibilidad.
- Consultar y modificar la información almacenada en la base de datos.

El backend se encuentra organizado en módulos para separar las rutas, modelos, esquemas y operaciones de cada funcionalidad.

#### 2.3. API REST

Es el mecanismo de comunicación entre el frontend y el backend.

La API se desarrolla con FastAPI y permite intercambiar información mediante solicitudes HTTP y respuestas en formato JSON.

Se utiliza el prefijo `/api/v1` para organizar los endpoints.

Los métodos HTTP utilizados son:

- GET: consultar información.
- POST: registrar información o ejecutar operaciones.
- PATCH: actualizar parcialmente información o gestionar decisiones.
- DELETE: eliminar registros cuando las reglas de integridad lo permitan.

La documentación interactiva de los servicios se genera mediante OpenAPI y Swagger UI, disponible en `/docs`.

#### 2.4. Base de datos

El sistema utiliza SQLite como motor de base de datos.

La información se almacena de forma persistente en el archivo `app.db`.

Se utiliza SQLAlchemy como herramienta de mapeo objeto-relacional (ORM), permitiendo representar las entidades mediante modelos de Python y gestionar sus relaciones.

La base de datos almacena información de:

- Usuarios.
- Departamentos.
- Recursos.
- Solicitudes.
- Préstamos.
- Prórrogas.

### 3. Componentes y comunicación

El funcionamiento general del sistema sigue el siguiente recorrido:

1. El usuario accede a la aplicación web.
2. El frontend presenta las opciones correspondientes a las funcionalidades disponibles.
3. El usuario realiza una operación, como consultar recursos o registrar una solicitud.
4. El frontend envía una petición HTTP a la API REST.
5. FastAPI recibe la petición y ejecuta el endpoint correspondiente.
6. El backend valida la información recibida y aplica las reglas de negocio.
7. SQLAlchemy permite consultar o modificar los registros en SQLite.
8. El backend devuelve una respuesta en formato JSON.
9. El frontend presenta el resultado de la operación.

La comunicación entre los componentes utiliza información real almacenada en la base de datos.

No se deben utilizar datos simulados como sustituto de las operaciones reales del sistema.

### 4. Modelo de datos

El sistema utiliza un modelo relacional compuesto por seis entidades principales.

Los modelos se implementan mediante SQLAlchemy.

#### 4.1. Usuarios

Almacena la información de las personas que pueden participar en las operaciones de préstamo.

| Atributo | Descripción |
|---|---|
| id | Identificador único del usuario. |
| nombre | Nombre de la persona. |
| correo | Correo electrónico del usuario. |
| tipo | Tipo de usuario: estudiante, docente, contratista u otro. |
| departamento_id | Identificador del departamento al que pertenece. |

El correo electrónico debe ser único.

#### 4.2. Departamentos

Almacena los departamentos o áreas de la institución.

| Atributo | Descripción |
|---|---|
| id | Identificador único del departamento. |
| nombre | Nombre del departamento. |

El nombre del departamento debe ser único.

#### 4.3. Recursos

Almacena la información de los equipos y recursos disponibles para préstamo.

| Atributo | Descripción |
|---|---|
| id | Identificador único del recurso. |
| nombre | Nombre del equipo o recurso. |
| codigo | Código de identificación del recurso. |
| marca | Marca del equipo. |
| modelo | Modelo del equipo. |
| serial | Número de serie. |
| estado | Estado actual del recurso. |
| fecha_registro | Fecha de registro del recurso. |

El código y el número de serie deben ser únicos.

Los estados contemplados son disponible, prestado, mantenimiento e inactivo.

#### 4.4. Solicitudes

Almacena las solicitudes de préstamo realizadas por los usuarios.

| Atributo | Descripción |
|---|---|
| id | Identificador único de la solicitud. |
| solicitante_id | Usuario que realiza la solicitud. |
| recurso_id | Recurso solicitado. |
| fecha_solicitud | Fecha en que se registra la solicitud. |
| fecha_entrega | Fecha prevista de entrega. |
| fecha_devolucion_prevista | Fecha esperada de devolución. |
| motivo | Motivo del préstamo. |
| estado | Estado actual de la solicitud. |
| observacion_decision | Observaciones relacionadas con la decisión. |

Los estados principales de las solicitudes son pendiente, aprobada y rechazada.

#### 4.5. Préstamos

Almacena las operaciones de préstamo que se generan a partir de solicitudes aprobadas.

| Atributo | Descripción |
|---|---|
| id | Identificador único del préstamo. |
| solicitud_id | Solicitud que origina el préstamo. |
| responsable_id | Responsable asociado al registro del préstamo. |
| fecha_entrega_real | Fecha en que se entrega el equipo. |
| fecha_devolucion_prevista | Fecha esperada de devolución. |
| fecha_devolucion_real | Fecha en que se recibe el equipo. |
| estado | Estado actual del préstamo. |
| estado_fisico_devolucion | Condición física del equipo al devolverlo. |
| observaciones_devolucion | Observaciones realizadas durante la devolución. |

Cada préstamo se relaciona con una solicitud.

Los estados principales son aprobado, activo y devuelto.

#### 4.6. Prórrogas

Almacena las solicitudes de extensión del periodo de préstamo.

| Atributo | Descripción |
|---|---|
| id | Identificador único de la prórroga. |
| prestamo_id | Préstamo al que pertenece. |
| fecha_solicitud | Fecha en que se solicita la extensión. |
| nueva_fecha_devolucion | Nueva fecha propuesta de devolución. |
| motivo | Motivo de la solicitud de extensión. |
| estado | Estado de la solicitud de prórroga. |
| responsable_decision_id | Responsable que toma la decisión. |

Los estados de una prórroga son pendiente, aprobada y rechazada.

### 5. Relaciones entre las entidades

Las entidades del sistema se relacionan mediante claves primarias y foráneas.

Las principales relaciones son:

- Un departamento puede estar asociado a muchos usuarios.
- Un usuario pertenece a un departamento.
- Un usuario puede registrar muchas solicitudes.
- Un recurso puede aparecer en muchas solicitudes a lo largo del tiempo.
- Una solicitud pertenece a un usuario y corresponde a un recurso.
- Una solicitud aprobada puede generar un préstamo.
- Cada préstamo se encuentra asociado a una solicitud.
- Un préstamo puede tener solicitudes de prórroga.
- Un responsable puede estar asociado a diferentes operaciones de gestión de préstamos y prórrogas.

Las claves foráneas permiten mantener la integridad referencial y evitar relaciones con registros inexistentes.

### 6. Reglas de integridad y disponibilidad

Para garantizar el funcionamiento correcto del sistema se aplican las siguientes condiciones:

1. El código de cada recurso debe ser único.
2. El número de serie de cada recurso debe ser único.
3. El correo electrónico de cada usuario debe ser único.
4. El nombre de cada departamento debe ser único.
5. Una solicitud debe estar asociada a un usuario y a un recurso existentes.
6. La fecha prevista de devolución debe ser posterior a la fecha prevista de entrega.
7. Una solicitud debe ser aprobada antes de registrar la entrega del recurso.
8. Un recurso no puede asignarse a dos préstamos incompatibles durante un mismo periodo.
9. La entrega debe realizarse únicamente cuando el préstamo esté aprobado y el recurso esté disponible.
10. Una devolución debe quedar registrada con su fecha real, estado físico y observaciones.
11. Una solicitud de prórroga debe estar asociada a un préstamo activo.
12. Una prórroga aprobada debe actualizar la fecha prevista de devolución.
13. Una prórroga rechazada no debe modificar la fecha de devolución vigente.
14. La eliminación de registros relacionados con operaciones históricas debe restringirse cuando pueda afectar la integridad de los datos.

### 7. Recorrido principal del proceso

#### 7.1. Registro de recursos

1. El responsable autorizado registra la información de un recurso.
2. El sistema valida los datos ingresados.
3. Se verifica que el código y el número de serie no estén duplicados.
4. El recurso se almacena en la base de datos.
5. El recurso queda disponible para las operaciones correspondientes.

#### 7.2. Solicitud de préstamo

1. El solicitante consulta el catálogo de recursos.
2. Verifica el estado y la disponibilidad del equipo.
3. Selecciona el recurso que necesita.
4. Registra la solicitud con las fechas previstas y el motivo.
5. El sistema valida la información.
6. La solicitud queda almacenada con estado pendiente.

#### 7.3. Evaluación de la solicitud

1. El responsable de préstamos consulta las solicitudes pendientes.
2. Revisa la información registrada.
3. Verifica las condiciones de disponibilidad.
4. Decide aprobar o rechazar la solicitud.
5. El sistema registra la decisión.
6. Si se aprueba, se genera el registro del préstamo en estado aprobado.

#### 7.4. Entrega del recurso

1. El responsable consulta el préstamo aprobado.
2. Verifica nuevamente que el recurso esté disponible.
3. Registra la entrega del equipo.
4. El sistema almacena la fecha de entrega.
5. El préstamo cambia a estado activo.
6. El recurso cambia a estado prestado.

#### 7.5. Solicitud de prórroga

1. El solicitante tiene un préstamo activo.
2. Registra una solicitud de prórroga.
3. Indica la nueva fecha propuesta de devolución y el motivo.
4. El sistema almacena la solicitud en estado pendiente.
5. El responsable revisa la solicitud.
6. Aprueba o rechaza la extensión.
7. Si se aprueba, se verifica que no existan conflictos de disponibilidad y se actualiza la fecha prevista de devolución.
8. Si se rechaza, se conserva la fecha de devolución vigente.

#### 7.6. Devolución

1. El solicitante entrega el equipo.
2. El responsable verifica su estado físico.
3. Registra la fecha real de devolución.
4. Selecciona la condición física del equipo.
5. Agrega las observaciones correspondientes.
6. El sistema registra la devolución.
7. El préstamo cambia a estado devuelto.
8. Si el equipo se encuentra en buen estado, el recurso pasa a disponible.
9. Si está dañado o incompleto, el recurso pasa a mantenimiento.

#### 7.7. Consulta de coordinación

1. Coordinación consulta la información general del sistema.
2. Consulta los recursos registrados.
3. Consulta el resumen de solicitudes y préstamos.
4. Visualiza los préstamos activos.
5. Consulta el historial de préstamos.

### 8. Diseño de la API REST

La API utiliza el prefijo `/api/v1` para organizar sus endpoints.

Las rutas se encuentran distribuidas en módulos dentro de `backend/app/routers/`.

#### 8.1. Recursos

Prefijo: `/api/v1/recursos`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/recursos/` | Consultar todos los recursos. |
| GET | `/api/v1/recursos/{id}` | Consultar un recurso específico. |
| POST | `/api/v1/recursos/` | Registrar un recurso. |
| PATCH | `/api/v1/recursos/{id}` | Actualizar información de un recurso. |
| DELETE | `/api/v1/recursos/{id}` | Eliminar un recurso cuando las reglas de integridad lo permitan. |

#### 8.2. Departamentos

Prefijo: `/api/v1/departamentos`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/departamentos/` | Consultar departamentos. |
| GET | `/api/v1/departamentos/{id}` | Consultar un departamento específico. |
| POST | `/api/v1/departamentos/` | Registrar un departamento. |
| PATCH | `/api/v1/departamentos/{id}` | Actualizar un departamento. |
| DELETE | `/api/v1/departamentos/{id}` | Eliminar un departamento cuando no tenga usuarios asociados. |

#### 8.3. Usuarios

Prefijo: `/api/v1/usuarios`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/usuarios/` | Consultar usuarios. |
| GET | `/api/v1/usuarios/{id}` | Consultar un usuario específico. |
| POST | `/api/v1/usuarios/` | Registrar un usuario. |
| PATCH | `/api/v1/usuarios/{id}` | Actualizar información de un usuario. |
| DELETE | `/api/v1/usuarios/{id}` | Eliminar un usuario cuando no tenga operaciones relacionadas que lo impidan. |

#### 8.4. Solicitudes

Prefijo: `/api/v1/solicitudes`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/solicitudes/` | Consultar solicitudes registradas. |
| GET | `/api/v1/solicitudes/{id}` | Consultar una solicitud específica. |
| POST | `/api/v1/solicitudes/` | Registrar una solicitud de préstamo. |
| PATCH | `/api/v1/solicitudes/{id}/decision` | Aprobar o rechazar una solicitud. |

#### 8.5. Préstamos

Prefijo: `/api/v1/prestamos`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/prestamos/` | Consultar préstamos registrados. |
| GET | `/api/v1/prestamos/{id}` | Consultar un préstamo específico. |
| POST | `/api/v1/prestamos/{id}/entrega` | Registrar la entrega de un recurso. |
| POST | `/api/v1/prestamos/{id}/devolucion` | Registrar la devolución de un recurso. |

#### 8.6. Prórrogas

Prefijo: `/api/v1/prorrogas`

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/v1/prorrogas` | Registrar una solicitud de prórroga. |
| GET | `/api/v1/prorrogas` | Consultar las solicitudes de prórroga. |
| GET | `/api/v1/prorrogas/{id}` | Consultar una prórroga específica. |
| PATCH | `/api/v1/prorrogas/{id}/decision` | Aprobar o rechazar una prórroga. |

#### 8.7. Reportes

Prefijo: `/api/v1/reportes`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/reportes/resumen` | Consultar información consolidada y cantidades por estado. |
| GET | `/api/v1/reportes/prestamos-activos` | Consultar los préstamos que se encuentran activos. |
| GET | `/api/v1/reportes/historial-prestamos` | Consultar el historial de préstamos registrados. |

#### 8.8. Estado del servicio

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Consultar el mensaje de inicio de la API. |
| GET | `/api/v1/estado` | Consultar el estado de funcionamiento del servicio. |

### 9. Validaciones y manejo de errores

El backend valida la información antes de realizar operaciones en la base de datos.

Las principales validaciones implementadas incluyen:

- Verificar que los usuarios y recursos existan.
- Verificar que los departamentos relacionados existan.
- Evitar códigos y números de serie duplicados.
- Evitar correos electrónicos duplicados.
- Comprobar que las fechas sean válidas.
- Impedir solicitudes con periodos incorrectos.
- Verificar la disponibilidad antes de aprobar y entregar recursos.
- Impedir decisiones sobre solicitudes que ya fueron evaluadas.
- Evitar registrar entregas para préstamos que no estén aprobados.
- Evitar registrar devoluciones de préstamos que no estén activos.
- Evitar solicitudes de prórroga sobre préstamos que no estén activos.
- Impedir prórrogas que generen conflictos de disponibilidad.
- Evitar eliminaciones que afecten registros relacionados.

Se utilizan códigos HTTP para informar el resultado de las operaciones.

| Código | Significado | Situación |
|---|---|---|
| 200 | OK | Consulta o actualización exitosa. |
| 201 | Created | Registro creado correctamente. |
| 400 | Bad Request | Solicitud con datos inválidos, cuando corresponda. |
| 404 | Not Found | Registro inexistente. |
| 409 | Conflict | Conflicto de datos, disponibilidad o estado. |
| 422 | Unprocessable Entity | Datos que no cumplen las validaciones del esquema. |
| 500 | Internal Server Error | Error interno del servidor. |

Las respuestas de error permiten identificar el problema presentado sin realizar operaciones inválidas sobre la base de datos.

### 10. Control de acceso

El sistema contempla tres actores principales:

- Solicitante.
- Responsable de préstamos.
- Coordinación.

Las responsabilidades funcionales se distribuyen de la siguiente manera:

- Solicitante: consultar recursos, registrar solicitudes, consultar sus operaciones y solicitar prórrogas.
- Responsable de préstamos: gestionar solicitudes, registrar decisiones, entregas y devoluciones, y gestionar prórrogas.
- Coordinación: consultar información consolidada, préstamos activos e historial.

Actualmente, el backend permite identificar usuarios mediante registros existentes en la base de datos, pero todavía no cuenta con un mecanismo de autenticación de usuarios ni una autorización real basada en roles operativos.

Por lo tanto, la separación de permisos por actor se considera una funcionalidad pendiente de implementación y no debe confundirse con las validaciones actuales de existencia de usuarios.

### 11. Tecnologías y decisiones técnicas

#### 11.1. Frontend: HTML, CSS y JavaScript

Se utilizarán para construir la interfaz web, presentar la información y permitir la interacción de los usuarios con el sistema.

#### 11.2. Backend: Python y FastAPI

Se utilizan para desarrollar la API REST, procesar las solicitudes, aplicar las reglas de negocio y validar los datos.

FastAPI permite generar automáticamente la documentación de los endpoints mediante OpenAPI y Swagger UI.

#### 11.3. Base de datos: SQLite

Se utiliza para almacenar de forma persistente la información de usuarios, departamentos, recursos, solicitudes, préstamos y prórrogas.

#### 11.4. ORM: SQLAlchemy

Se utiliza para representar las tablas de la base de datos mediante modelos de Python y gestionar las consultas y operaciones sobre los registros.

#### 11.5. Configuración: variables de entorno

Se utiliza un archivo `.env` para configurar parámetros del proyecto, como la conexión a la base de datos y la clave de configuración.

El archivo `.env` no debe publicarse en el repositorio. Se proporciona `.env.example` como referencia de configuración.

#### 11.6. Comunicación: HTTP y JSON

El frontend se comunicará con el backend mediante solicitudes HTTP y respuestas en formato JSON.

Se configuró CORS en FastAPI para permitir la comunicación desde los orígenes locales utilizados durante el desarrollo.

#### 11.7. Pruebas: Swagger UI

Se utiliza la documentación interactiva de FastAPI, disponible en `/docs`, para ejecutar solicitudes, comprobar respuestas, verificar códigos HTTP y probar las reglas de negocio.

Las pruebas funcionales se documentan mediante evidencias organizadas en la carpeta `evidencias/`.

#### 11.8. Control de versiones: Git y GitHub

Se utilizarán para administrar el código fuente, trabajar mediante ramas organizadas por requisito, registrar cambios y realizar revisiones mediante Pull Requests.

### 12. Organización del proyecto

El proyecto se organiza en carpetas para separar las responsabilidades de cada componente.

La estructura general es la siguiente:

```text
Proyecto_Prestamos/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── main.py
│   │   └── database.py
│   └── __init__.py
│
├── frontend/
│   ├── css/
│   └── js/
│
├── docs/
│   ├── requisitos.md
│   ├── diseno.md
│   └── trazabilidad.md
│
├── evidencias/
│
├── .env.example
├── .gitignore
├── requirements.txt
├── README.md
└── app.db
```

La carpeta `backend/app/` contiene:

- `routers/`: endpoints y rutas de la API.
- `models/`: modelos de las entidades de la base de datos.
- `schemas/`: esquemas de validación de entrada y salida.
- `services/`: espacio destinado a la organización de la lógica de servicios.
- `main.py`: inicialización de FastAPI y registro de los routers.
- `database.py`: configuración de SQLAlchemy y conexión a SQLite.

La carpeta `frontend/` contiene los archivos de la interfaz web, sus estilos y sus scripts.

La carpeta `docs/` contiene la documentación del proyecto y `evidencias/` almacena las capturas y registros de las pruebas funcionales.

### 13. Organización del equipo

El proyecto será desarrollado por dos integrantes con una distribución inicial de responsabilidades.

**Integrante 1: Backend**

- Desarrollo de la API REST.
- Implementación de los modelos de datos.
- Configuración de la base de datos.
- Desarrollo de las reglas de negocio.
- Validaciones del backend.
- Pruebas de los endpoints.

**Integrante 2: Frontend**

- Diseño y desarrollo de las interfaces.
- Implementación de formularios.
- Estilos y organización visual.
- Validaciones de los formularios.
- Comunicación con la API mediante JavaScript.

**Responsabilidades compartidas**

Ambos integrantes participarán en:

- Diseño y revisión del modelo de datos.
- Integración del frontend con el backend.
- Pruebas funcionales.
- Documentación.
- Control de versiones y revisión de cambios.
- Verificación de los criterios de aceptación.

### 14. Correspondencia con los requisitos

| Requisito | Componente o diseño relacionado |
|---|---|
| RF-01 y RF-02 | Módulo de recursos y consulta de disponibilidad. |
| RF-03 y RF-04 | Módulo de solicitudes y entidad Solicitud. |
| RF-05 y RF-06 | Gestión de solicitudes y decisiones del responsable. |
| RF-07 y RF-08 | Módulo de préstamos, entregas y validación de disponibilidad. |
| RF-09 | Módulo de prórrogas. |
| RF-10 y RF-11 | Registro de devoluciones e historial de préstamos. |
| RF-12 | Módulo de reportes para coordinación. |
| RF-13 | Administración del catálogo de recursos. |
| RNF-01 | SQLite y SQLAlchemy. |
| RNF-02 | Comunicación entre frontend, API REST y base de datos. |
| RNF-03 | Esquemas de validación y controles del backend. |
| RNF-04 | Diseño de actores y permisos; autenticación y autorización pendientes. |
| RNF-05 | Relaciones entre entidades y reglas de integridad. |
| RNF-06 | Manejo de errores y respuestas HTTP. |
| RNF-07 | Variables de entorno y archivo `.env.example`. |
| RNF-08 | Documentación y evidencias del proyecto. |
| RNF-09 | Organización modular del código. |

### 15. Conclusión

El diseño técnico establece la arquitectura y la organización del sistema de gestión de préstamos de equipos y recursos institucionales.

La separación entre frontend, backend, API REST y base de datos permite distribuir las responsabilidades de la aplicación y facilita su mantenimiento.

El modelo relacional organiza la información de usuarios, departamentos, recursos, solicitudes, préstamos y prórrogas, mientras que las validaciones del backend contribuyen a mantener la integridad de las operaciones.

La implementación debe mantener correspondencia con los requisitos establecidos y permitir verificar el ciclo completo de solicitud, evaluación, aprobación, entrega, prórroga y devolución mediante pruebas funcionales y evidencias documentadas.

Las funcionalidades que todavía no se han desarrollado, como la autenticación y la autorización por roles, se identifican expresamente como pendientes y no como capacidades ya implementadas.