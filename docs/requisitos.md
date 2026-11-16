# Documento de requisitos
## Sistema de gestión de préstamos de equipos y recursos

### 1. Descripción del proyecto

El proyecto consiste en desarrollar una aplicación web para gestionar los préstamos temporales de equipos y recursos de una institución educativa.

La aplicación permitirá consultar el catálogo de recursos, conocer su disponibilidad, registrar solicitudes de préstamo, evaluar y aprobar o rechazar solicitudes, registrar la entrega de equipos, gestionar solicitudes de prórroga, controlar las devoluciones y consultar el historial de préstamos.

La información deberá almacenarse de manera persistente en una base de datos y mantenerse actualizada para evitar asignaciones incompatibles de un mismo recurso.

El sistema contará con una interfaz web, un backend que procesará las operaciones y una API REST que permitirá la comunicación entre ambos componentes.

### 2. Objetivo general

Desarrollar un sistema web que permita administrar de manera organizada los préstamos de equipos y recursos institucionales, facilitando el control de solicitudes, entregas, devoluciones, prórrogas y disponibilidad de los recursos.

### 3. Alcance del sistema

El sistema incluirá las siguientes funcionalidades:

- Consulta del catálogo de equipos y recursos institucionales.
- Consulta del estado y disponibilidad de los recursos.
- Registro de solicitudes de préstamo.
- Revisión y evaluación de solicitudes por parte del responsable de préstamos.
- Aprobación o rechazo de solicitudes.
- Registro de la entrega y asignación de equipos.
- Solicitud, aprobación y rechazo de prórrogas.
- Registro de la devolución, incluyendo fecha real, estado físico y observaciones.
- Actualización del estado de disponibilidad de los recursos después de las devoluciones.
- Consulta del historial de préstamos.
- Consulta de información consolidada de recursos y préstamos por parte de coordinación.
- Administración de la información de recursos, usuarios y departamentos.

No se contempla inicialmente:

- Integración con sistemas externos de inventario.
- Uso de códigos QR o tecnología RFID.
- Envío de notificaciones por correo electrónico o WhatsApp.
- Gestión de compras de equipos.
- Administración de sanciones económicas o multas.
- Integración con sistemas institucionales externos de autenticación.

### 4. Actores del sistema

#### 4.1. Solicitante

Persona autorizada que necesita utilizar temporalmente un equipo o recurso institucional. Puede ser estudiante, docente, contratista u otro integrante autorizado de la institución.

La entrevista estableció que no debe existir una jerarquía automática entre estos tipos de solicitantes.

Responsabilidades:

- Consultar los equipos y recursos disponibles.
- Registrar solicitudes de préstamo.
- Proporcionar la información requerida para la solicitud.
- Indicar el departamento al que pertenece.
- Especificar las fechas previstas del préstamo.
- Indicar el motivo de la solicitud.
- Consultar el estado de sus solicitudes y préstamos.
- Solicitar una prórroga cuando necesite extender el periodo de préstamo.
- Devolver el equipo prestado.

#### 4.2. Responsable de préstamos

Persona encargada de administrar las solicitudes y los préstamos de los recursos institucionales.

Responsabilidades:

- Consultar las solicitudes recibidas.
- Revisar la información de las solicitudes.
- Aprobar o rechazar solicitudes.
- Registrar la decisión y sus observaciones cuando corresponda.
- Verificar la disponibilidad del recurso antes de confirmar su asignación.
- Registrar la entrega de los equipos.
- Gestionar las solicitudes de prórroga.
- Aprobar o rechazar las prórrogas.
- Registrar las devoluciones.
- Verificar el estado físico de los equipos.
- Registrar observaciones sobre las devoluciones.

#### 4.3. Coordinación

Personal encargado de supervisar el uso de los recursos institucionales y consultar el estado general de los préstamos.

Responsabilidades:

- Consultar información consolidada de los recursos.
- Consultar los préstamos registrados.
- Consultar los préstamos activos.
- Consultar el historial de préstamos.
- Supervisar los estados de las solicitudes y operaciones.

### 5. Requisitos funcionales

**RF-01. Consulta del catálogo de recursos**

El sistema debe permitir consultar el catálogo de equipos y recursos institucionales registrados, mostrando información como nombre, código, marca, modelo, número de serie y estado.

**RF-02. Consulta de disponibilidad**

El sistema debe permitir consultar el estado y la disponibilidad de los recursos para determinar si pueden solicitarse durante un periodo determinado.

**RF-03. Registro de solicitudes**

El sistema debe permitir que un solicitante registre una solicitud de préstamo indicando el recurso requerido, el departamento al que pertenece y las fechas correspondientes al préstamo.

**RF-04. Registro de información de la solicitud**

El sistema debe almacenar la información de cada solicitud, incluyendo:

- Solicitante.
- Recurso solicitado.
- Fecha de solicitud.
- Fecha prevista de entrega.
- Fecha esperada de devolución.
- Motivo del préstamo.
- Estado de la solicitud.

**RF-05. Revisión de solicitudes**

El sistema debe permitir que el responsable de préstamos consulte y revise las solicitudes registradas, verificando la información proporcionada y las condiciones de disponibilidad del recurso.

**RF-06. Aprobación o rechazo de solicitudes**

El sistema debe permitir que el responsable de préstamos apruebe o rechace una solicitud. La decisión deberá quedar registrada junto con la información del responsable y las observaciones correspondientes.

**RF-07. Registro de entrega**

El sistema debe permitir registrar la entrega de un equipo al solicitante cuando la solicitud haya sido aprobada, almacenando la fecha real de entrega y el responsable que realiza el registro.

**RF-08. Control de disponibilidad**

El sistema debe impedir que un mismo recurso sea asignado a dos préstamos incompatibles durante un mismo periodo.

Antes de confirmar una asignación, se deberá verificar nuevamente la disponibilidad del recurso.

**RF-09. Solicitud y gestión de prórrogas**

El sistema debe permitir que un solicitante con un préstamo activo solicite una extensión del periodo de préstamo, indicando la nueva fecha de devolución y el motivo.

El responsable de préstamos deberá poder aprobar o rechazar la solicitud de prórroga y resgistrar una observacion. Cuando sea aprobada, el sistema deberá actualizar la fecha prevista de devolución del préstamo correspondiente.

**RF-10. Registro de devolución**

El sistema debe permitir registrar la devolución de un equipo, incluyendo:

- Fecha real de devolución.
- Estado físico del equipo.
- Observaciones relacionadas con la devolución.

**RF-11. Actualización de disponibilidad e historial**

El sistema debe actualizar el estado del recurso después de registrar una devolución, teniendo en cuenta su condición física.

También debe conservar la información de los préstamos y sus respectivas operaciones de entrega y devolución para permitir consultas posteriores.

**RF-12. Consulta de información consolidada**

El sistema debe permitir que coordinación consulte información consolidada de los recursos y préstamos registrados, incluyendo cantidades por estado y préstamos activos.

**RF-13. Administración de recursos**

El sistema debe permitir gestionar la información del catálogo de recursos institucionales, incluyendo el registro, consulta, actualización y eliminación de registros cuando las reglas de integridad lo permitan.

### 6. Requisitos no funcionales

**RNF-01. Persistencia de información**

La información de usuarios, departamentos, recursos, solicitudes, préstamos y prórrogas debe almacenarse en una base de datos persistente.

**RNF-02. Integración**

La aplicación web debe comunicarse con el backend mediante una API REST, y el backend debe interactuar con la base de datos para consultar y modificar información real.

**RNF-03. Validación de datos**

El sistema debe validar la información ingresada en el frontend y en el backend. Las validaciones del backend serán obligatorias para proteger la integridad de la información.

**RNF-04. Seguridad y control de acceso por roles**

El sistema debe autenticar a los usuarios mediante correo electrónico y contraseña cifrada (`PBKDF2-SHA256`), emitiendo tokens Bearer firmados (`HMAC-SHA256`), y restringir el acceso a las operaciones de la API y a las vistas de la interfaz web según el rol asignado al usuario (`solicitante`, `responsable` o `coordinacion`).

**RNF-05. Integridad de la información**

El sistema debe mantener la coherencia de los datos de los recursos, solicitudes, préstamos, prórrogas y devoluciones.

**RNF-06. Manejo de errores**

El backend debe responder adecuadamente ante errores de validación, solicitudes inválidas, registros inexistentes y conflictos de estado, sin exponer información sensible.

**RNF-07. Configuración segura**

Las credenciales y claves de configuración deben manejarse mediante variables de entorno y no deben publicarse en el repositorio.

**RNF-08. Documentación**

El proyecto debe incluir documentación de requisitos, diseño, trazabilidad, instrucciones de configuración, ejecución y pruebas funcionales.

**RNF-09. Mantenibilidad**

El código debe organizarse en componentes y módulos que faciliten su comprensión, mantenimiento y modificación.

### 7. Reglas de negocio

Las siguientes reglas se basan en la información de la entrevista, los acuerdos del equipo y las condiciones definidas para el funcionamiento del sistema.

**RN-01. Tipos de solicitantes**

Pueden solicitar préstamos los estudiantes, docentes, contratistas y otros integrantes autorizados de la institución.

**RN-02. Igualdad entre solicitantes**

No se establecerá prioridad automática por pertenecer a una categoría específica de usuario. Los tipos de solicitantes no tendrán una jerarquía automática entre sí.

**RN-03. Evaluación de solicitudes**

Toda solicitud debe ser revisada por el responsable de préstamos antes de registrar la entrega del recurso.

**RN-04. Decisión de la solicitud**

El responsable de préstamos puede aprobar o rechazar una solicitud. La decisión debe quedar almacenada en el sistema.

**RN-05. Asignación de recursos**

Solo se debe registrar la entrega de un recurso cuando la solicitud haya sido aprobada y el recurso esté disponible.

**RN-06. Disponibilidad**

Un recurso no puede tener dos préstamos incompatibles durante el mismo periodo.

La disponibilidad debe verificarse al registrar la solicitud, al aprobarla y al realizar la entrega, según corresponda.

**RN-07. Prórrogas**

El solicitante puede pedir una extensión del periodo de préstamo cuando tenga un préstamo activo.

La prórroga debe ser revisada por el responsable de préstamos. Si se aprueba, se actualizará la fecha prevista de devolución del préstamo.

No se debe aprobar una extensión que genere un conflicto de disponibilidad con otro préstamo del mismo recurso.

Una solicitud de prórroga rechazada no debe modificar la fecha de devolución previamente establecida.

**RN-08. Devolución**

Al recibir un equipo, el responsable debe registrar la fecha real de devolución, el estado físico y las observaciones correspondientes.

**RN-09. Actualización del estado del recurso**

Después de registrar una devolución:

- Si el equipo se encuentra en buen estado, podrá volver a estar disponible.
- Si el equipo se encuentra dañado o incompleto, deberá quedar en estado de mantenimiento para evitar nuevas asignaciones.

**RN-10. Integridad del historial**

Las operaciones de préstamo deben conservar la información necesaria para consultar posteriormente las solicitudes, entregas y devoluciones realizadas.

No se deben eliminar registros que tengan operaciones relacionadas cuando esto pueda afectar la integridad o trazabilidad de la información.

**RN-11. Validación de fechas**

La fecha prevista de devolución debe ser posterior a la fecha prevista de entrega.

Las solicitudes de prórroga deben proponer una nueva fecha posterior a la fecha de devolución vigente y cumplir las validaciones de fechas establecidas por el sistema.

**RN-12. Criterios de aprobación**

La entrevista no estableció criterios institucionales específicos para aprobar o rechazar solicitudes. Por esta razón, la decisión corresponde al responsable de préstamos, quien deberá revisar la información y las condiciones de disponibilidad antes de tomarla.

### 8. Información que debe manejar el sistema

#### 8.1. Recursos

De acuerdo con la entrevista, se debe registrar la siguiente información de cada equipo o recurso:

- Nombre.
- Código.
- Marca.
- Modelo.
- Número de serie.
- Estado.
- Fecha de registro.

El estado permitirá identificar si el recurso está disponible, prestado, en mantenimiento o inactivo.

#### 8.2. Usuarios

El sistema debe almacenar la información necesaria para identificar a las personas que participan en las operaciones de préstamo.

La información específica de registro deberá corresponder a los datos definidos por el equipo para el alcance del proyecto.

Se contemplan los siguientes tipos de usuario:

- Estudiante.
- Docente.
- Contratista.
- Otro.

#### 8.3. Departamentos

Se debe almacenar la información de los departamentos o áreas de la institución para asociar a los usuarios con su respectiva dependencia.

#### 8.4. Solicitudes y préstamos

Se contempla registrar:

- Solicitante.
- Departamento al que pertenece.
- Equipo solicitado.
- Fecha de solicitud.
- Fecha prevista de entrega.
- Fecha esperada de devolución.
- Motivo del préstamo.
- Estado de la solicitud.
- Responsable de la decisión.
- Observaciones de la decisión.
- Fecha real de entrega.
- Fecha real de devolución.

#### 8.5. Prórrogas

Se debe registrar:

- Préstamo relacionado.
- Solicitante.
- Fecha de solicitud.
- Nueva fecha propuesta de devolución.
- Motivo de la prórroga.
- Estado de la solicitud de prórroga.
- Responsable que toma la decisión.

#### 8.6. Devoluciones

Se debe registrar:

- Fecha real de devolución.
- Estado físico del equipo.
- Observaciones relacionadas con su condición.

### 9. Estados del proceso

Para representar el ciclo de vida de las operaciones, se establecen los siguientes estados:

#### 9.1. Estados de las solicitudes

- **Pendiente:** solicitud registrada que todavía no ha sido evaluada.
- **Aprobada:** solicitud autorizada por el responsable de préstamos.
- **Rechazada:** solicitud que no fue autorizada.

#### 9.2. Estados de los préstamos

- **Aprobado:** préstamo generado a partir de una solicitud aprobada, pendiente de registrar la entrega.
- **Activo:** equipo entregado al solicitante y pendiente de devolución.
- **Devuelto:** equipo recibido y devolución registrada.

#### 9.3. Estados de los recursos

- **Disponible:** recurso que puede ser solicitado y asignado.
- **Prestado:** recurso que actualmente se encuentra asignado a un préstamo activo.
- **Mantenimiento:** recurso que no puede asignarse temporalmente debido a su condición física o necesidad de revisión.
- **Inactivo:** recurso que no se encuentra habilitado para nuevos préstamos.

#### 9.4. Estados de las prórrogas

- **Pendiente:** solicitud de extensión que todavía no ha sido evaluada.
- **Aprobada:** extensión autorizada por el responsable de préstamos.
- **Rechazada:** extensión que no fue autorizada.

### 10. Aspectos pendientes de definición

Los siguientes aspectos requieren revisión o acuerdos adicionales del equipo y, cuando corresponda, confirmación institucional:

1. Definir el mecanismo de autenticación para identificar a las personas que utilizan el sistema.
2. Definir cómo se comprobará que una persona está autorizada para solicitar equipos.
3. Establecer los permisos específicos de cada actor y quién podrá administrar usuarios, departamentos y recursos.
4. Precisar los criterios institucionales que utilizará el responsable para aprobar o rechazar solicitudes.
5. Confirmar si existen restricciones adicionales sobre la duración máxima de los préstamos.
6. Definir si se permitirá cancelar solicitudes o préstamos aprobados y bajo qué condiciones.
7. Definir el procedimiento administrativo para revisar y devolver a disponibilidad los equipos que pasen a mantenimiento.
8. Establecer si coordinación tendrá permisos de consulta exclusivamente o también podrá realizar operaciones administrativas.
9. Definir si se requiere un registro adicional de observaciones sobre el estado del equipo antes de su entrega.

Los aspectos pendientes no deben considerarse funcionalidades implementadas hasta que sean acordados y desarrollados.

### 11. Relación con los criterios de aceptación

| Criterio de aceptación | Descripción | Requisitos relacionados |
|---|---|---|
| CA-01. Consulta de recursos y disponibilidad | Los usuarios autorizados pueden consultar los recursos registrados y conocer su disponibilidad. | RF-01, RF-02, RF-13 |
| CA-02. Registro de solicitudes | El solicitante puede registrar una solicitud con la información requerida y esta queda almacenada. | RF-03, RF-04 |
| CA-03. Evaluación y gestión de solicitudes | El responsable puede revisar, aprobar o rechazar solicitudes y registrar su decisión. | RF-05, RF-06 |
| CA-04. Asignación y entrega de recursos | Se puede registrar la entrega de un recurso aprobado, evitando asignaciones incompatibles. | RF-07, RF-08 |
| CA-05. Devolución e historial | Se registra la devolución, se actualiza el estado del recurso y se conserva el historial de préstamos. También se contempla la gestión de prórrogas. | RF-09, RF-10, RF-11 |
| CA-06. Información consolidada | Coordinación puede consultar información general y consolidada de los recursos y préstamos. | RF-12, RF-13 |

### 12. Observación final

Este documento establece los requisitos funcionales y no funcionales del sistema de gestión de préstamos de equipos y recursos institucionales.

Los requisitos se fundamentan en el alcance del proyecto, la información obtenida durante la entrevista y los acuerdos establecidos por el equipo de desarrollo.

Los aspectos identificados como pendientes deberán revisarse antes de considerarse reglas definitivas del sistema.

La implementación deberá mantener correspondencia con estos requisitos y permitir verificar su cumplimiento mediante pruebas funcionales y evidencias documentadas.