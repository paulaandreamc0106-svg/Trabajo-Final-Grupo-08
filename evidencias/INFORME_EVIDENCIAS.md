# Informe de Pruebas Funcionales y Evidencias — SIGEP

## Grupo 08
Paula Andrea Montoya Corrales
Juan Esteban Velez Tobon
---

### Prueba 1: Consulta del catálogo y disponibilidad
- **Requisito asociado:** RF-01, RF-02
- **Condiciones iniciales:** Servidor FastAPI activo y catálogo precargado con recursos en la base de datos.
- **Pasos y datos de entrada:** Iniciar sesión como solicitante (`solicitante@sigep.edu.co`) o responsable (`responsable@sigep.edu.co`) y navegar al módulo **Catálogo de Recursos**.
- **Resultado esperado:** Recursos y estados recuperados correctamente (`disponible`, `prestado`, `mantenimiento`, `inactivo`).
- **Resultado obtenido:** Se listan los equipos institucionales con su código, marca, modelo, serial y estado actualizado.
- **Método y código HTTP:** `GET /api/v1/recursos/` — `200 OK`
- **Estado:** Aprobada
- **Evidencia:** `evidencias/capturas_frontend/02_PanelGeneral_Solicitante.png` y `evidencias/capturas_frontend/021_CatalogoRecursos_Coordinacion.png`

---

### Prueba 2: Consulta de recurso inexistente
- **Requisito asociado:** RNF-06
- **Condiciones iniciales:** Servidor FastAPI en ejecución y usuario autenticado.
- **Pasos y datos de entrada:** Consultar mediante la API un identificador de recurso inexistente (`/api/v1/recursos/9999`).
- **Resultado esperado:** Respuesta de error controlado sin caída del servidor.
- **Resultado obtenido:** El sistema responde con detalle `"El recurso no existe"`.
- **Método y código HTTP:** `GET /api/v1/recursos/9999` — `404 Not Found`
- **Estado:** Aprobada
- **Evidencia:** `evidencias/crud_recursos/`

---

### Prueba 3: Registro de solicitud válida
- **Requisito asociado:** RF-03, RF-04
- **Condiciones iniciales:** Usuario con rol `solicitante` autenticado y al menos un recurso en estado `disponible`.
- **Pasos y datos de entrada:** Ingresar al módulo **Solicitudes**, hacer clic en **+ Nueva Solicitud**, elegir el recurso `EQ-001`, seleccionar fechas futuras válidas e ingresar motivo académico.
- **Resultado esperado:** Solicitud almacenada y recuperable en estado `pendiente`.
- **Resultado obtenido:** La solicitud queda registrada en la base de datos y visible en la tabla con estado `pendiente`.
- **Método y código HTTP:** `POST /api/v1/solicitudes/` — `201 Created`
- **Estado:** Aprobada
- **Evidencia:** `evidencias/capturas_frontend/03_SolicitudPrestamo_Disponibles.png`, `04_Solicitud_Prestamo.png` y `05_SolicitudPrestamo_Pendiente.png`

---

### Prueba 4: Solicitud con datos inválidos
- **Requisito asociado:** RNF-03
- **Condiciones iniciales:** Usuario autenticado en el formulario de nueva solicitud.
- **Pasos y datos de entrada:** Intentar registrar una solicitud donde la fecha prevista de devolución sea anterior o igual a la fecha prevista de entrega.
- **Resultado esperado:** Entrada rechazada sin persistir datos inválidos en la base de datos.
- **Resultado obtenido:** Validación bloquea el envío y retorna error de validación en fechas.
- **Método y código HTTP:** `POST /api/v1/solicitudes/` — `422 Unprocessable Entity`
- **Estado:** Aprobada
- **Evidencia:** `evidencias/crud_solicitudes/`

---

### Prueba 5: Evaluación de solicitud por personal autorizado
- **Requisito asociado:** RF-05, RF-06
- **Condiciones iniciales:** Solicitud en estado `pendiente` y sesión iniciada como `responsable` (`responsable@sigep.edu.co`).
- **Pasos y datos de entrada:** En el módulo **Solicitudes**, hacer clic en **Evaluar** sobre la solicitud pendiente, seleccionar `aprobada` y registrar observación.
- **Resultado esperado:** Actuación o decisión registrada; solicitud cambia a `aprobada` y se crea el préstamo asociado.
- **Resultado obtenido:** La solicitud pasa a `aprobada` y se genera automáticamente el préstamo en estado `aprobado`.
- **Método y código HTTP:** `PATCH /api/v1/solicitudes/{id}/decision` — `200 OK`
- **Estado:** Aprobada
- **Evidencia:** `evidencias/capturas_frontend/09_Solicitudes_Prestamos.png`, `010_Evaluar_Solicitud.png` y `011_Solicitud_Aprobada.png`

---

### Prueba 6: Gestión por un actor no autorizado
- **Requisito asociado:** RNF-04
- **Condiciones iniciales:** Sesión iniciada con rol `solicitante` o `coordinacion`.
- **Pasos y datos de entrada:** Intentar acceder a vistas administrativas (`Usuarios`, `Departamentos`) o ejecutar operaciones exclusivas del responsable (evaluar solicitudes, entregar equipos o eliminar recursos).
- **Resultado esperado:** Operación impedida tanto en la interfaz como en la API.
- **Resultado obtenido:** La interfaz oculta las opciones no autorizadas y el backend rechaza cualquier petición directa sin el rol `responsable`.
- **Método y código HTTP:** `PATCH /api/v1/solicitudes/{id}/decision` — `403 Forbidden`
- **Estado:** Aprobada
- **Evidencia:** `evidencias/capturas_frontend/01_Login_Solicitante.png` y `020_PanelGeneral_Coordinacion.png`

---

### Prueba 7: Asignación de recurso disponible (Entrega física)
- **Requisito asociado:** RF-07, RF-08
- **Condiciones iniciales:** Préstamo en estado `aprobado` y recurso en estado `disponible`.
- **Pasos y datos de entrada:** Con rol `responsable`, ingresar a **Préstamos y Entregas** y hacer clic en **Registrar Entrega**.
- **Resultado esperado:** Préstamo registrado como `activo` y recurso actualizado a estado `prestado`.
- **Resultado obtenido:** Se guarda la fecha real de entrega, el préstamo pasa a `activo` y el equipo cambia a `prestado`.
- **Método y código HTTP:** `POST /api/v1/prestamos/{id}/entrega` — `200 OK`
- **Estado:** Aprobada
- **Evidencia:** `evidencias/capturas_frontend/012_Prestamos_Entregas.png`, `013_Registro_Entrega.png` y `014_Entrega_Activa.png`

---

### Prueba 8: Intención de asignación incompatible
- **Requisito asociado:** RF-08
- **Condiciones iniciales:** Recurso actualmente asignado en un préstamo `aprobado` o `activo`.
- **Pasos y datos de entrada:** Intentar registrar o aprobar una nueva solicitud sobre el mismo recurso dentro de un rango de fechas incompatible.
- **Resultado esperado:** Operación rechazada y disponibilidad del recurso conservada.
- **Resultado obtenido:** El sistema bloquea la operación e informa el conflicto de disponibilidad.
- **Método y código HTTP:** `POST /api/v1/solicitudes/` — `409 Conflict`
- **Estado:** Aprobada
- **Evidencia:** `evidencias/crud_prestamos_entregas_devoluciones/`

---

### Prueba 9: Consulta del préstamo activo y gestión de prórrogas
- **Requisito asociado:** RF-09
- **Condiciones iniciales:** Préstamo en estado `activo`.
- **Pasos y datos de entrada:** Ir al módulo **Prórrogas**, solicitar una extensión seleccionando el préstamo activo específico y una fecha posterior, y aprobarla desde el rol `responsable`.
- **Resultado esperado:** Estado, responsabilidad y recurso coherentes; fecha prevista de devolución actualizada.
- **Resultado obtenido:** La prórroga queda `aprobada` con observación del responsable y actualiza la fecha de devolución del préstamo.
- **Método y código HTTP:** `POST /api/v1/prorrogas/` (`201 Created`) y `PATCH /api/v1/prorrogas/{id}/decision` (`200 OK`)
- **Estado:** Aprobada
- **Evidencia:** `evidencias/capturas_frontend/015_Solicitud_Prorroga.png` a `018_Prorroga_Aprobada.png`

---

### Prueba 10: Registro de devolución y consulta histórica
- **Requisito asociado:** RF-10, RF-11
- **Condiciones iniciales:** Préstamo en estado `activo`.
- **Pasos y datos de entrada:** En **Préstamos y Entregas**, hacer clic en **Registrar Devolución**, seleccionar estado físico (`bueno`, `dañado` o `incompleto`) e ingresar observaciones.
- **Resultado esperado:** Devolución persistente, recurso actualizado (`disponible` o `mantenimiento`) e historial consultable.
- **Resultado obtenido:** El préstamo pasa a `devuelto` con fecha real registrada y el equipo recupera su disponibilidad.
- **Método y código HTTP:** `POST /api/v1/prestamos/{id}/devolucion` — `200 OK`.
- **Estado:** Aprobada
- **Evidencia:** `evidencias/capturas_frontend/025_Prestamos_Entregas_Devoluciones.png` y `027_Reportes_Historial.png`.

---

### Prueba 11: Información consolidada y consistencia de datos
- **Requisito asociado:**
- **Condiciones iniciales:** Operaciones de recursos, solicitudes y préstamos registradas en SQLite.
- **Pasos y datos de entrada:** Iniciar sesión con `coordinacion@sigep.edu.co` y consultar el **Panel General** y **Reportes e Historial**.
- **Resultado esperado:** Consulta de recursos, préstamos y relaciones íntegras con totales por estado.
- **Resultado obtenido:** Se visualizan los indicadores KPI, préstamos activos e historial completo de forma consistente.
- **Método y código HTTP:** `GET /api/v1/reportes/resumen`, `GET /api/v1/reportes/prestamos-activos` — `200 OK`.
- **Estado:** Aprobada
- **Evidencia:** `evidencias/capturas_frontend/019_Login_Coordinacion.png`, `020_PanelGeneral_Coordinacion.png` y `027_Reportes_Historial.png`.

---

### Prueba 12: Integración interfaz–API–base de datos
- **Requisito asociado:** RNF-02, RNF-08
- **Condiciones iniciales:** Frontend activo (`http://127.0.0.1:5500`) conectado al backend FastAPI (`http://127.0.0.1:8000`).
- **Pasos y datos de entrada:** Ejecutar el ciclo completo (login, solicitud, aprobación, entrega, prórroga, devolución) desde la web y exportar el reporte en formato CSV.
- **Resultado esperado:** Flujo completo de solicitud, asignación y devolución demostrado con persistencia en `app.db`.
- **Resultado obtenido:** Todas las operaciones impactan la base de datos en tiempo real y el archivo CSV se descarga correctamente.
- **Método y código HTTP:** Múltiples endpoints REST `/api/v1/*` — `200 OK` / `201 Created`.
- **Estado:** Aprobada
- **Evidencia:** `evidencias/capturas_frontend/028_Exportar_Vista_CSV.png` y `029_Archivo_Excel_Info.png`.