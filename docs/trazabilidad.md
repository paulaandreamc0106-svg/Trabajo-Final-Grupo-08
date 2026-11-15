# Matriz de trazabilidad de requisitos

## 1. Introducción

El presente documento establece la relación entre los requisitos del sistema de gestión de préstamos de equipos y recursos institucionales, los módulos desarrollados, los endpoints de la API REST y las pruebas funcionales utilizadas para verificar su cumplimiento.

La matriz de trazabilidad permite identificar qué funcionalidades responden a cada requisito y facilita el seguimiento del desarrollo, las pruebas y las evidencias del proyecto.

## 2. Trazabilidad de requisitos funcionales

| Requisito | Descripción | Módulo relacionado | Endpoints relacionados |
|---|---|---|---|
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
| RNF-04 | Control de acceso | Pendiente de implementar autenticación y autorización real. |
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
| Interfaz web completa | Pendiente de integración |
| Autenticación y autorización real | Pendiente de implementación o definición |

## 7. Seguimiento de pruebas funcionales

Las pruebas funcionales deben permitir comprobar el cumplimiento de los requisitos y criterios de aceptación.

Se deben documentar como mínimo los siguientes escenarios:

1. Consultar el catálogo de recursos.
2. Consultar un recurso inexistente.
3. Registrar un recurso válido y verificar su persistencia.
4. Intentar registrar un recurso con código o serial duplicado.
5. Registrar una solicitud válida.
6. Intentar registrar una solicitud con información inválida.
7. Aprobar una solicitud pendiente.
8. Rechazar una solicitud pendiente.
9. Impedir una asignación incompatible.
10. Registrar la entrega de un préstamo aprobado.
11. Registrar la devolución y verificar el estado físico del recurso.
12. Consultar préstamos activos e historial.
13. Registrar y evaluar una solicitud de prórroga.
14. Consultar información consolidada.
15. Comprobar la comunicación entre frontend, backend y base de datos.

Cada prueba deberá documentar:

- Identificador de la prueba.
- Requisito o criterio de aceptación relacionado.
- Descripción del escenario.
- Datos utilizados.
- Resultado esperado.
- Resultado obtenido.
- Estado de la prueba: aprobada o fallida.
- Evidencia correspondiente.

## 8. Control de cambios y versiones

Los cambios realizados durante el desarrollo se gestionarán mediante Git y GitHub.

Se utilizarán ramas de trabajo asociadas a los requisitos del proyecto y Pull Requests para revisar e integrar los cambios en la rama principal.

La relación de cada requisito con su rama, commit y Pull Request se actualizará a medida que se realice la integración del trabajo.

## 9. Conclusión

La matriz de trazabilidad permite relacionar los requisitos del sistema con los módulos implementados, los endpoints de la API y las pruebas funcionales.

Este documento facilita la verificación del cumplimiento de los criterios de aceptación y permite identificar las funcionalidades implementadas y aquellas que todavía requieren desarrollo o integración.