# Matriz de trazabilidad de requisitos

## 1. Introducción

El presente documento establece la relación entre los requisitos del sistema de gestión de préstamos de equipos y recursos institucionales, los módulos desarrollados, los endpoints de la API REST y las pruebas funcionales utilizadas para verificar su cumplimiento.

La matriz de trazabilidad permite identificar qué funcionalidades responden a cada requisito y facilita el seguimiento del desarrollo, las pruebas y las evidencias del proyecto.

## 2. Trazabilidad de requisitos funcionales

| Requisito | Descripción | Módulo relacionado | Endpoints relacionados |
|---|---|---|---|
| **RF-Auth** | **Autenticación y perfil de usuario** | **Autenticación** | **POST /api/v1/auth/login, GET /api/v1/auth/me** |
| RF-01 | Consulta del catálogo de recursos | Recursos | GET /api/v1/recursos/ |
| RF-02 | Consulta de disponibilidad | Recursos y préstamos | GET /api/v1/recursos/ |
| RF-03 | Registro de solicitudes | Solicitudes | POST /api/v1/solicitudes/ |
| RF-04 | Registro de información de la solicitud | Solicitudes | POST /api/v1/solicitudes/ |
| RF-05 | Revisión de solicitudes | Solicitudes | GET /api/v1/solicitudes/ |
| RF-06 | Aprobación o rechazo de solicitudes | Solicitudes | PATCH /api/v1/solicitudes/{id}/decision |
| RF-07 | Registro de entrega | Préstamos | POST /api/v1/prestamos/{id}/entrega |
| RF-08 | Control de disponibilidad | Recursos y préstamos | POST /api/v1/solicitudes/; PATCH /api/v1/solicitudes/{id}/decision; POST /api/v1/prestamos/{id}/entrega |
| RF-09 | Solicitud y gestión de prórrogas | Prórrogas | POST /api/v1/prorrogas; PATCH /api/v1/prorrogas/{id}/decision |
| RF-10 | Registro de devolución | Préstamos | POST /api/v1/prestamos/{id}/devolucion |
| RF-11 | Actualización de disponibilidad e historial | Préstamos y reportes | POST /api/v1/prestamos/{id}/devolucion; GET /api/v1/reportes/historial-prestamos |
| RF-12 | Consulta de información consolidada | Reportes | GET /api/v1/reportes/resumen |
| RF-13 | Administración de recursos | Recursos | GET, POST, PATCH y DELETE /api/v1/recursos/ |

## 3. Trazabilidad de criterios de aceptación

| Criterio | Requisitos relacionados | Componentes del sistema | Verificación |
|---|---|---|---|
| CA-01. Consulta de recursos y disponibilidad | RF-01, RF-02, RF-13 | Recursos y base de datos | Consultar el catálogo y verificar la información y los estados de los recursos. |
| CA-02. Registro de solicitudes | RF-03, RF-04 | Solicitudes, usuarios y recursos | Registrar una solicitud válida y comprobar que queda almacenada. |
| CA-03. Evaluación y gestión de solicitudes | RF-05, RF-06 | Solicitudes y responsables | Consultar solicitudes pendientes y comprobar las decisiones de aprobación y rechazo. |
| CA-04. Asignación y entrega de recursos | RF-07, RF-08 | Préstamos, solicitudes y recursos | Registrar una entrega aprobada y comprobar que no se permitan asignaciones incompatibles. |
| CA-05. Devolución e historial | RF-09, RF-10, RF-11 | Préstamos, prórrogas y reportes | Registrar devoluciones, verificar el estado del recurso y consultar el historial. |
| CA-06. Información consolidada | RF-12 | Reportes y base de datos | Consultar el resumen general y los préstamos activos e históricos. |

## 4. Trazabilidad de requisitos no funcionales

| Requisito | Descripción | Implementación o mecanismo de verificación |
|---|---|---|
| RNF-01 | Persistencia de información | Base de datos SQLite y modelos SQLAlchemy. |
| RNF-02 | Integración | API REST desarrollada con FastAPI y comunicación mediante solicitudes HTTP. |
| RNF-03 | Validación de datos | Esquemas de validación mediante Pydantic y reglas en los endpoints. |
| RNF-04 | Control de acceso y seguridad | Autenticación mediante tokens Bearer (HMAC-SHA256), hash de claves con PBKDF2-SHA256 y control de acceso basado en roles (`solicitante`, `responsable`, `coordinacion`) en backend e interfaz web. |
| RNF-05 | Integridad de la información | Relaciones entre entidades, claves foráneas y validaciones de negocio. |
| RNF-06 | Manejo de errores | Respuestas HTTP para validaciones, registros inexistentes y conflictos. |
| RNF-07 | Configuración segura | Variables de entorno y exclusión del archivo .env del repositorio. |
| RNF-08 | Documentación | Documentos de requisitos, diseño, trazabilidad y evidencias. |
| RNF-09 | Mantenibilidad | Organización del backend en modelos, esquemas, routers y servicios previstos en la arquitectura. |

## 5. Relación de módulos con las evidencias

Las siguientes carpetas contienen evidencias de las pruebas realizadas durante el desarrollo del backend.

| Módulo | Evidencias | Funcionalidades verificadas |
|---|---|---|
| Recursos | evidencias/crud_recursos/ | Registro, consulta, actualización, eliminación y validaciones. |
| Departamentos | Evidencias del CRUD de departamentos. | Operaciones CRUD y validaciones de integridad. |
| Usuarios | Evidencias del CRUD de usuarios. | Operaciones CRUD, validación de correo y relaciones. |
| Préstamos | evidencias/prestamos_entregas_devoluciones/ | Entrega, devolución y actualización del estado del recurso. |
| Prórrogas | evidencias/prorrogas/ | Registro, consulta, aprobación, rechazo y validaciones. |
| Reportes | evidencias/reportes/ | Resumen, préstamos activos e historial. |
| Integración | evidencias/integracion/ | Comunicación entre frontend y backend. |

Las pruebas de solicitudes y departamentos deberán vincularse con sus respectivas capturas y registros de evidencia cuando se consolide la documentación final.

## 6. Estado de implementación

El estado de los componentes se organiza de la siguiente manera:

| Componente | Estado |
|---|---|
| Base de datos y conexión | Implementado y probado |
| CRUD de recursos | Implementado y probado |
| CRUD de departamentos | Implementado y probado |
| CRUD de usuarios | Implementado y probado |
| Registro y evaluación de solicitudes | Implementado y probado |
| Entrega y devolución de préstamos | Implementado y probado |
| Gestión de prórrogas | Implementado y probado |
| Reportes | Implementado y probado |
| Configuración CORS | Configurada |
| Comunicación inicial frontend-backend | Comprobada |
| Interfaz web completa | Implementado y probado |
| Autenticación y autorización real | Implementado y probado |

## 7. Seguimiento de pruebas funcionales

Las pruebas funcionales verifican el cumplimiento de los requisitos del sistema, las reglas de negocio y la integración entre la interfaz web, la API REST y la base de datos. A continuación se documentan los escenarios principales ejecutados y validados:

| ID Prueba | Requisito / CA | Descripción del escenario | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PF-01** | `RF-01`, `CA-01` | Consultar el catálogo de recursos | Consulta general de catálogo | Listado de recursos registrados con su estado actual | Se recuperan los recursos almacenados correctamente | Aprobada | `evidencias/crud_recursos/02_listar_recurso.png` |
| **PF-02** | `RF-01`, `CA-01` | Consultar un recurso inexistente | ID de recurso no registrado (ej. `999`) | Respuesta HTTP `404 Not Found` controlada | El servidor responde con error controlado sin fallos | Aprobada | `evidencias/crud_recursos/05_err_recurso_no_existe.png` |
| **PF-03** | `RF-13`, `CA-01` | Registrar un recurso válido y verificar persistencia | Nombre, categoría, serial único y estado disponible | Registro creado (`201 Created`) y visible al consultar | Recurso almacenado y persistido en SQLite | Aprobada | `evidencias/crud_recursos/01_agregar_nuevo_recurso.png` |
| **PF-04** | `RF-03`, `RF-04`, `CA-02` | Registrar una solicitud válida | Solicitante válido, recurso disponible y fechas coherentes | Solicitud creada (`201 Created`) en estado pendiente | Solicitud registrada y visible para evaluación | Aprobada | `evidencias/crud_solicitudes/01_agregar_nueva_solicitud.png` |
| **PF-05** | `RF-03`, `CA-02` | Intentar registrar una solicitud con datos inválidos | Fechas invertidas o solicitante/recurso inexistente | Rechazo de la petición (`400`/`422`/`404`) sin persistir | Validación exitosa; no se guardan datos inconsistentes | Aprobada | `evidencias/crud_solicitudes/08_err_fecha_incorrecta.png` |
| **PF-06** | `RF-05`, `RF-06`, `CA-03` | Aprobar una solicitud pendiente por responsable | ID de solicitud pendiente y decisión de aprobación | Estado actualizado a aprobada | Solicitud aprobada y lista para entrega | Aprobada | `evidencias/crud_solicitudes/04_aprobar_solicitud.png` |
| **PF-07** | `RF-05`, `RF-06`, `CA-03` | Rechazar una solicitud pendiente | ID de solicitud pendiente y decisión de rechazo | Estado actualizado a rechazada | Solicitud rechazada correctamente | Aprobada | `evidencias/crud_solicitudes/05_rechazar_solicitud.png` |
| **PF-08** | `RF-08`, `CA-04` | Impedir una asignación incompatible | Intento de entrega de solicitud no aprobada o recurso ocupado | Operación impedida (`400`/`409`) conservando disponibilidad | El sistema bloquea cruces y asignaciones inválidas | Aprobada | `evidencias/crud_prestamos_entregas_devoluciones/08_err_entregar_prestamo_no_aprobado.png` |
| **PF-09** | `RF-07`, `CA-04` | Registrar la entrega de un préstamo aprobado | Solicitud aprobada asociada al solicitante y recurso | Préstamo activo registrado y recurso marcado como prestado | Entrega registrada con integridad de datos | Aprobada | `evidencias/crud_prestamos_entregas_devoluciones/03_registrar_entrega.png` |
| **PF-10** | `RF-10`, `RF-11`, `CA-05` | Registrar la devolución y verificar estado del recurso | ID de préstamo activo y reporte de estado físico | Cierre del préstamo y actualización de disponibilidad | Préstamo finalizado e historial actualizado | Aprobada | `evidencias/crud_prestamos_entregas_devoluciones/04_registrar_devolucion.png` |
| **PF-11** | `RF-09`, `CA-05` | Registrar y evaluar una solicitud de prórroga | Préstamo activo, nueva fecha y decisión del responsable | Prórroga evaluada y fecha de devolución actualizada | Flujo completo de solicitud y aprobación de prórroga | Aprobada | `evidencias/prorrogas/05_aprobar_prorroga.png` |
| **PF-12** | `RF-12`, `CA-06` | Consultar información consolidada y reportes | Consultas de resumen general e historial de préstamos | Visualización consolidada de recursos, estados y responsables | Reportes generados y exportables desde la interfaz | Aprobada | `evidencias/reportes/01_resumen_general.png` |
| **PF-13** | `RNF-02`, `CA-01` a `CA-06` | Integración completa frontend–API–base de datos | Flujo completo desde navegador web hasta SQLite | Operación de extremo a extremo sin datos simulados | Flujo completo verificado en interfaz de usuario | Aprobada | `evidencias/integracion/01_prueba_conexion_frontend_backend.png` |

---

## 8. Control de cambios y versiones

La gestión del código fuente, la integración de funcionalidades y la documentación se organizó mediante las siguientes ramas en GitHub, reflejando la evolución real del sistema:

| Rama en GitHub | Alcance / Módulos Asociados | Requisitos Relacionados | Propósito en el Desarrollo |
| :--- | :--- | :--- | :--- |
| `main` | Backend (API REST), Base de Datos, Modelos, Seguridad e Integración General | `RF-Auth`, `RF-01` a `RF-13`, `RNF-01` a `RNF-09` | Consolidación de la arquitectura cliente-servidor, lógica de negocio, endpoints y versión estable final. |
| `feature/frontend-y-evidencias` | Interfaz Web (HTML/CSS/JS) y Pruebas de Integración | `CA-01` a `CA-06`, `RNF-02`, `RNF-04` | Desarrollo de las vistas de usuario por roles, consumo de la API y captura de evidencias de operación. |
| `feature/evidencias-y-docs-finales` | Documentación Técnica y Evidencias Funcionales | `RNF-08` (Documentación) | Consolidación de los informes de pruebas, actualización de requisitos, diseño y matriz de trazabilidad. |

---

## 9. Conclusión

La matriz de trazabilidad establece la correspondencia completa entre las condiciones de aceptación obligatorias (`CA-01` a `CA-06`), los requisitos funcionales y no funcionales aprobados, los módulos implementados en el repositorio, el control de versiones en GitHub y las pruebas funcionales documentadas en la carpeta `evidencias/`. Con esto se verifica el cumplimiento integral del ciclo de préstamo de equipos y recursos institucionales.

