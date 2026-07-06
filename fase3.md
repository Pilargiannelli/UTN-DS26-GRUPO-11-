# Fase 3: Planificación y Backlog

## 3.1 Definir Épicas y Features

| Épica | Feature | Prioridad | Tamaño |
|-------|---------|-----------|--------|
| EP01 – Gestión de Pacientes | F01 – Registro y consulta de pacientes | Alta | M |
| EP01 – Gestión de Pacientes | F02 – Historial clínico | Media | M |
| EP02 – Gestión de Turnos | F03 – Operaciones sobre turnos | Alta | L |
| EP02 – Gestión de Turnos | F04 – Ciclo de vida y estados del turno | Alta | M |
| EP03 – Agenda y Calendario | F05 – Visualización de agenda | Alta | M |
| EP04 – Configuración del Médico | F06 – Configuración de disponibilidad | Media | M |
| EP05 – Comunicación Automatizada | F07 – Flujo de confirmación por WhatsApp | Media | XL |
| EP05 – Comunicación Automatizada | F08 – Recordatorios automáticos | Baja | S |
| EP05 – Comunicación Automatizada | F09 – Validación de pago por WhatsApp | Media | L |
| EP06 – Autenticación y Control de Acceso | F10 – Autenticación y roles de usuario | Alta | M |

---

## 3.2 Historias de Usuario por Feature

---

### F01 – Registro y consulta de pacientes

---

**[HU-001] - Registrar nuevo paciente**

Descripción:
Como personal administrativo,
quiero registrar un nuevo paciente con sus datos personales,
para que quede disponible en el sistema y se le puedan asignar turnos.
Épica: [EP-01] Gestión de Pacientes
Prioridad: Must
Estimación: M

Criterios de Aceptación:
1. Dado que soy personal administrativo autenticado con datos válidos completos, cuando guardo el formulario, entonces el paciente queda registrado y disponible para búsqueda y asignación de turnos.
2. Dado que ingreso un DNI que ya existe en el sistema, cuando intento guardar, entonces se muestra "El DNI ya se encuentra registrado" y no se crea el duplicado.
3. Dado que dejo campos obligatorios vacíos (nombre, apellido, DNI o teléfono), cuando intento guardar, entonces el sistema marca los campos faltantes y no procede con el registro.

Notas Técnicas:
- Validar unicidad del DNI antes de insertar. Aplicar validación de formato de número de teléfono WhatsApp (código de país incluido).

Requisitos Funcionales:
[RF01.1] Registrar paciente

Reglas de Negocio:
- (ninguna aplica específicamente)

Archivos Adjuntos:
- "HU-001 - Wireframe - Formulario Registro de Paciente.pdf"

---

**[HU-002] - Editar datos de un paciente**

Descripción:
Como personal administrativo,
quiero modificar los datos personales de un paciente ya registrado,
para mantener la información actualizada.
Épica: [EP-01] Gestión de Pacientes
Prioridad: Should
Estimación: S

Criterios de Aceptación:
1. Dado que accedo al perfil de un paciente existente, cuando edito sus datos y guardo, entonces los cambios se reflejan inmediatamente en el sistema.
2. Dado que accedo al formulario de edición, cuando lo abro, entonces el campo DNI aparece deshabilitado y no puede modificarse.
3. Dado que dejo un campo obligatorio vacío durante la edición, cuando intento guardar, entonces el sistema muestra un error de validación y no guarda el cambio.

Notas Técnicas:
- El campo DNI debe estar deshabilitado en el frontend y rechazado si se envía modificado por el backend.

Requisitos Funcionales:
[RF01.2] Editar paciente

Reglas de Negocio:
- (ninguna aplica específicamente)

Archivos Adjuntos:
- "HU-002 - Wireframe - Formulario Edición de Paciente.pdf"

---

**[HU-003] - Buscar paciente**

Descripción:
Como médico o personal administrativo,
quiero buscar pacientes por nombre o DNI,
para encontrarlos rápidamente sin recorrer la lista completa.
Épica: [EP-01] Gestión de Pacientes
Prioridad: Must
Estimación: S

Criterios de Aceptación:
1. Dado que ingreso al menos 2 caracteres en el buscador, cuando escribo, entonces el sistema muestra los pacientes cuyo nombre, apellido o DNI coincidan.
2. Dado que ingreso un criterio que no coincide con ningún paciente, cuando termino de escribir, entonces se muestra el mensaje "No se encontraron pacientes".
3. Dado que hago clic en un resultado de búsqueda, cuando selecciono un paciente, entonces se navega al perfil del paciente seleccionado.

Notas Técnicas:
- Búsqueda en tiempo real con debounce de ~300ms para evitar requests excesivos al backend.

Requisitos Funcionales:
[RF01.3] Buscar paciente

Reglas de Negocio:
- (ninguna aplica específicamente)

Archivos Adjuntos:
- "HU-003 - Wireframe - Buscador de Pacientes.pdf"

---

### F02 – Historial clínico

---

**[HU-004] - Registrar nota clínica en una consulta**

Descripción:
Como médico,
quiero registrar una nota con diagnóstico, evolución y observaciones para cada consulta,
para llevar un historial estructurado del paciente.
Épica: [EP-01] Gestión de Pacientes
Prioridad: Should
Estimación: M

Criterios de Aceptación:
1. Dado que soy el médico autenticado, cuando registro una nota clínica con fecha, diagnóstico y observaciones, entonces la nota queda vinculada a esa consulta y visible en el historial del paciente.
2. Dado que soy personal administrativo, cuando intento acceder al formulario de nota clínica, entonces el sistema deniega el acceso con un error de autorización.
3. Dado que dejo el campo diagnóstico vacío, cuando intento guardar la nota, entonces el sistema muestra un error de validación y no guarda.

Notas Técnicas:
- La nota se asocia a la relación paciente-consulta (fecha + paciente_id). Campos de texto libre sin restricción de longitud estricta.

Requisitos Funcionales:
[RF01.4] Registrar nota clínica
[RF01.6] Asociar nota a consulta

Reglas de Negocio:
- [RN-002] Solo el médico puede registrar y editar notas clínicas.

Archivos Adjuntos:
- "HU-004 - Wireframe - Formulario Nota Clínica.pdf"

---

**[HU-005] - Ver historial clínico de un paciente**

Descripción:
Como médico,
quiero ver el historial clínico completo de un paciente con todas sus consultas previas,
para revisar sus antecedentes antes de atenderlo.
Épica: [EP-01] Gestión de Pacientes
Prioridad: Should
Estimación: M

Criterios de Aceptación:
1. Dado que soy el médico autenticado, cuando accedo al historial de un paciente, entonces veo la lista de consultas ordenadas de más reciente a más antigua, con fecha, diagnóstico, evolución y observaciones.
2. Dado que un paciente no tiene consultas registradas, cuando accedo a su historial, entonces se muestra el mensaje "Sin consultas registradas".
3. Dado que soy personal administrativo, cuando intento acceder al historial clínico de cualquier paciente, entonces el sistema deniega el acceso con un error de autorización.

Notas Técnicas:
- Paginación recomendada si el historial supera 20 entradas. Ordenamiento por fecha DESC.

Requisitos Funcionales:
[RF01.5] Visualizar historial clínico

Reglas de Negocio:
- [RN-006] Solo el médico puede acceder al historial clínico de los pacientes.

Archivos Adjuntos:
- "HU-005 - Wireframe - Vista Historial Clínico.pdf"

---

### F03 – Operaciones sobre turnos

---

**[HU-006a] - Crear turno para un paciente**

Descripción:
Como personal administrativo,
quiero crear un turno para un paciente seleccionando un bloque horario disponible,
para agendar su consulta en el sistema.
Épica: [EP-02] Gestión de Turnos
Prioridad: Must
Estimación: L

Criterios de Aceptación:
1. Dado que selecciono un paciente y un bloque horario disponible, cuando guardo el turno, entonces el turno queda registrado en estado Pendiente y el bloque deja de estar disponible.
2. Dado que el bloque horario seleccionado ya está ocupado, cuando intento guardar, entonces el sistema muestra "El horario seleccionado ya no está disponible" y no crea el turno.
3. Dado que el bloque horario está bloqueado por el médico, cuando intento seleccionarlo, entonces el sistema no lo muestra como opción disponible.

Notas Técnicas:
- Verificar disponibilidad del bloque en el backend antes de confirmar la escritura (condición de carrera si dos usuarios crean turno simultáneamente). Usar transacción con lock.

Requisitos Funcionales:
[RF02.1] Crear turno

Reglas de Negocio:
- [RN-004] No se pueden asignar turnos en bloques ocupados o bloqueados.

Archivos Adjuntos:
- "HU-006a - Wireframe - Formulario Creación de Turno.pdf"

---

**[HU-007a] - Cancelar un turno**

Descripción:
Como médico o personal administrativo,
quiero cancelar un turno existente,
para liberar ese horario cuando el paciente no va a asistir.
Épica: [EP-02] Gestión de Turnos
Prioridad: Must
Estimación: S

Criterios de Aceptación:
1. Dado que selecciono un turno en estado Pendiente o Confirmado, cuando ejecuto la cancelación, entonces el turno pasa al estado Cancelado y el bloque horario queda disponible para nuevos turnos.
2. Dado que el turno ya está en estado Cancelado o Reprogramado, cuando intento cancelarlo, entonces el sistema no permite la acción y muestra "Estado inválido para esta operación".

Notas Técnicas:
- Registrar el evento de cancelación con fecha, autor y rol. La notificación al paciente es responsabilidad de HU-007b.

Requisitos Funcionales:
[RF02.3] Cancelar turno

Reglas de Negocio:
- [RN-001] Solo se pueden cancelar turnos en estado Pendiente o Confirmado.

Archivos Adjuntos:
- "HU-007a - Wireframe - Modal Confirmación Cancelación.pdf"

---

**[HU-007b] - Notificar cancelación al paciente por WhatsApp**

Descripción:
Como sistema,
quiero enviar una notificación al paciente cuando el médico cancela su turno,
para que el paciente quede informado automáticamente sin intervención manual.
Épica: [EP-02] Gestión de Turnos
Prioridad: Should
Estimación: S

Criterios de Aceptación:
1. Dado que el médico cancela un turno (Pendiente o Confirmado), cuando se completa la cancelación, entonces el sistema envía automáticamente un mensaje de WhatsApp al paciente informando la cancelación con fecha y hora del turno afectado.
2. Dado que el personal administrativo cancela un turno, cuando se completa la cancelación, entonces no se envía notificación automática al paciente.
3. Dado que el servicio de WhatsApp no está disponible, cuando se intenta enviar la notificación, entonces el sistema registra el error sin bloquear ni revertir la cancelación del turno.

Notas Técnicas:
- El envío es asíncrono (worker/queue). Depende de HU-007a: la cancelación debe completarse antes de disparar la notificación.

Requisitos Funcionales:
[RF02.3] Cancelar turno

Reglas de Negocio:
- [RN-001] La notificación solo aplica cuando quien cancela es el médico.

Archivos Adjuntos:
- "HU-007b - Wireframe - Notificación WhatsApp Cancelación.pdf"

---

**[HU-008] - Reprogramar un turno**

Descripción:
Como médico o personal administrativo,
quiero mover un turno a una nueva fecha u hora,
para adaptarme a cambios en la disponibilidad del paciente o del médico.
Épica: [EP-02] Gestión de Turnos
Prioridad: Should
Estimación: L

Criterios de Aceptación:
1. Dado que selecciono un turno en estado Pendiente o Confirmado, cuando elijo una nueva fecha/hora disponible y confirmo, entonces el turno original pasa a Reprogramado y se crea un nuevo turno en estado Pendiente.
2. Dado que se crea el nuevo turno, cuando se completa la reprogramación, entonces el sistema inicia automáticamente el flujo de confirmación por WhatsApp para el nuevo turno.
3. Dado que el bloque seleccionado para la nueva fecha ya está ocupado, cuando intento confirmar la reprogramación, entonces el sistema muestra "El horario seleccionado no está disponible" y no realiza ningún cambio.

Notas Técnicas:
- La operación debe ser atómica: actualizar estado del turno original y crear el nuevo en la misma transacción de DB.

Requisitos Funcionales:
[RF02.4] Reprogramar turno

Reglas de Negocio:
- [RN-005] Al reprogramar, el turno original pasa a Reprogramado y se crea uno nuevo en Pendiente.
- [RN-004] No se pueden asignar turnos en bloques ocupados o bloqueados.

Archivos Adjuntos:
- "HU-008 - Wireframe - Formulario Reprogramación de Turno.pdf"

---

### F04 – Ciclo de vida y estados del turno

---

**[HU-009] - Consultar el estado de un turno**

Descripción:
Como médico o personal administrativo,
quiero ver el estado actual de cada turno en la lista de turnos,
para saber en qué etapa se encuentra sin hacer seguimiento manual.
Épica: [EP-02] Gestión de Turnos
Prioridad: Must
Estimación: S

Criterios de Aceptación:
1. Dado que accedo a la lista de turnos, cuando los veo listados, entonces cada turno muestra su estado con un indicador visual diferenciado: Pendiente (gris), Confirmado (verde), Cancelado (rojo), Reprogramado (naranja).
2. Dado que el estado de un turno cambia (por WhatsApp o acción manual), cuando recargo la vista, entonces el nuevo estado se refleja correctamente.
3. Dado que aplico un filtro por estado, cuando selecciono un estado específico, entonces solo se muestran los turnos con ese estado.

Notas Técnicas:
- Los indicadores de estado no deben basarse únicamente en color (agregar etiqueta de texto para accesibilidad). Considerar polling liviano o refresco automático.

Requisitos Funcionales:
[RF02.1] Crear turno
[RF02.2] Modificar turno
[RF02.3] Cancelar turno
[RF02.4] Reprogramar turno

Reglas de Negocio:
- (ninguna aplica específicamente)

Archivos Adjuntos:
- "HU-009 - Wireframe - Lista de Turnos con Estados.pdf"

---

### F05 – Visualización de agenda

---

**[HU-010] - Ver agenda diaria**

Descripción:
Como médico,
quiero ver todos mis turnos confirmados del día en formato calendario,
para planificar mi jornada de trabajo.
Épica: [EP-03] Agenda y Calendario
Prioridad: Must
Estimación: M

Criterios de Aceptación:
1. Dado que accedo a la vista diaria del día actual, cuando la cargo, entonces veo los turnos Confirmados organizados por franjas horarias con nombre del paciente y horario de cada uno.
2. Dado que el día no tiene turnos confirmados, cuando accedo a la agenda diaria, entonces se muestra el mensaje "Sin turnos confirmados para hoy".
3. Dado que navego entre días, cuando selecciono una fecha diferente, entonces la agenda muestra los turnos Confirmados de ese día.

Notas Técnicas:
- Solo renderizar turnos con estado = Confirmado. El componente de calendario debe soportar navegación día a día.

Requisitos Funcionales:
[RF03.1] Vista de agenda diaria
[RF03.3] Mostrar solo turnos confirmados

Reglas de Negocio:
- [RN-003] La agenda solo muestra turnos en estado Confirmado.

Archivos Adjuntos:
- "HU-010 - Wireframe - Agenda Diaria.pdf"

---

**[HU-011] - Ver agenda semanal**

Descripción:
Como médico,
quiero ver los turnos confirmados distribuidos en los siete días de la semana,
para tener una visión general de mi agenda.
Épica: [EP-03] Agenda y Calendario
Prioridad: Should
Estimación: M

Criterios de Aceptación:
1. Dado que accedo a la vista semanal, cuando cargo la semana actual, entonces veo los 7 días con sus turnos Confirmados distribuidos en el calendario.
2. Dado que hago clic en "semana anterior" o "semana siguiente", cuando navego, entonces la vista actualiza y muestra los turnos de la semana seleccionada.
3. Dado que una semana no tiene turnos confirmados, cuando accedo a ella, entonces el calendario aparece vacío sin mostrar errores.

Notas Técnicas:
- Misma lógica de filtrado que la vista diaria (estado = Confirmado), con rango de fechas extendido a 7 días.

Requisitos Funcionales:
[RF03.2] Vista de agenda semanal
[RF03.3] Mostrar solo turnos confirmados

Reglas de Negocio:
- [RN-003] La agenda solo muestra turnos en estado Confirmado.

Archivos Adjuntos:
- "HU-011 - Wireframe - Agenda Semanal.pdf"

---

### F06 – Configuración de disponibilidad

---

**[HU-012a] - Configurar días y horario de atención**

Descripción:
Como médico,
quiero definir qué días de la semana y en qué horarios estoy disponible,
para que el sistema solo ofrezca esos bloques al crear turnos.
Épica: [EP-04] Configuración del Médico
Prioridad: Should
Estimación: M

Criterios de Aceptación:
1. Dado que selecciono días de la semana y defino hora de inicio y fin por día y guardo, cuando el sistema muestra bloques disponibles para nuevos turnos, entonces los bloques reflejan esa configuración.
2. Dado que no selecciono ningún día, cuando intento guardar, entonces el sistema muestra "Debe seleccionar al menos un día de atención".
3. Dado que configuro un horario de fin anterior al de inicio para un día, cuando intento guardar, entonces el sistema muestra un error de validación de horario.

Notas Técnicas:
- Guardar la configuración por día de semana (estructura recurrente, no por fecha específica). El generador de bloques debe recalcular al guardar cambios.

Requisitos Funcionales:
[RF04.1] Definir días disponibles
[RF04.2] Configurar horario de atención

Reglas de Negocio:
- (ninguna aplica específicamente)

Archivos Adjuntos:
- "HU-012a - Wireframe - Configuración Días y Horarios.pdf"

---

**[HU-012b] - Configurar duración estándar del turno**

Descripción:
Como médico,
quiero establecer la duración estándar de cada turno en minutos,
para que el sistema divida automáticamente los horarios en bloques correctos.
Épica: [EP-04] Configuración del Médico
Prioridad: Should
Estimación: S

Criterios de Aceptación:
1. Dado que selecciono una duración (ej. 20, 30, 45, 60 minutos) y guardo, cuando el sistema genera bloques disponibles, entonces los bloques respetan la duración configurada.
2. Dado que cambio la duración, cuando guardo la nueva configuración, entonces los bloques futuros sin turno asignado se recalculan con la nueva duración; los turnos ya asignados no se alteran.
3. Dado que dejo el campo de duración vacío, cuando intento guardar, entonces el sistema muestra un error de validación.

Notas Técnicas:
- El cambio de duración solo afecta bloques futuros sin turnos asignados. Los bloques con turnos existentes no se modifican.

Requisitos Funcionales:
[RF04.3] Establecer duración de turno

Reglas de Negocio:
- (ninguna aplica específicamente)

Archivos Adjuntos:
- "HU-012b - Wireframe - Configuración Duración de Turno.pdf"

---

**[HU-013] - Bloquear franjas horarias**

Descripción:
Como médico,
quiero bloquear horarios específicos (vacaciones, reuniones, feriados),
para que no se asignen turnos en esos intervalos.
Épica: [EP-04] Configuración del Médico
Prioridad: Should
Estimación: M

Criterios de Aceptación:
1. Dado que defino un rango de fecha y hora para bloquear y guardo, cuando el sistema muestra bloques disponibles, entonces los bloques dentro del rango bloqueado no aparecen como disponibles.
2. Dado que elimino un bloqueo existente, cuando guardo el cambio, entonces los bloques antes bloqueados vuelven a estar disponibles para nuevos turnos.
3. Dado que intento bloquear un rango que ya tiene turnos asignados, cuando guardo, entonces el sistema muestra una advertencia con los turnos afectados y solicita confirmación antes de proceder.

Notas Técnicas:
- Verificar colisiones con turnos existentes al crear bloqueos. Guardar bloqueos como rangos de fecha-hora en tabla dedicada.

Requisitos Funcionales:
[RF04.4] Bloquear franjas horarias

Reglas de Negocio:
- (ninguna aplica específicamente)

Archivos Adjuntos:
- "HU-013 - Wireframe - Gestión de Bloqueos Horarios.pdf"

---

### F07 – Flujo de confirmación por WhatsApp

---

**[HU-006b] - Iniciar flujo de confirmación al crear turno**

Descripción:
Como sistema,
quiero enviar un mensaje de WhatsApp automáticamente al crear un turno,
para iniciar el flujo de confirmación con el paciente sin intervención manual.
Épica: [EP-05] Comunicación Automatizada
Prioridad: Should
Estimación: L

Criterios de Aceptación:
1. Dado que se crea un turno para un paciente con número de WhatsApp registrado, cuando el turno queda en estado Pendiente, entonces el agente de IA envía automáticamente un mensaje al paciente con fecha, hora y nombre del médico.
2. Dado que el paciente no tiene número de WhatsApp registrado, cuando se crea el turno, entonces el turno queda en Pendiente sin enviar mensaje y se registra una alerta en el panel administrativo.
3. Dado que el servicio de WhatsApp no está disponible, cuando se intenta enviar el mensaje, entonces el sistema reintenta hasta 3 veces y registra el error si persiste, sin bloquear la creación del turno.

Notas Técnicas:
- El envío de mensajes debe ser asíncrono (worker/queue) para no bloquear el endpoint de creación. Integrar con WhatsApp Business API (Meta Cloud API o Twilio).

Requisitos Funcionales:
[RF02.1] Crear turno

Reglas de Negocio:
- (ninguna aplica específicamente)

Archivos Adjuntos:
- "HU-006b - Wireframe - Notificación WhatsApp Creación de Turno.pdf"

---

**[HU-014] - Confirmar asistencia por WhatsApp**

Descripción:
Como paciente,
quiero recibir un mensaje de WhatsApp con los datos de mi turno y poder confirmar mi asistencia respondiendo,
para que el consultorio sepa que voy a asistir.
Épica: [EP-05] Comunicación Automatizada
Prioridad: Should
Estimación: L

Criterios de Aceptación:
1. Dado que recibo el mensaje de confirmación y respondo afirmativamente (ej. "Confirmo", "Sí", "Dale"), cuando el agente procesa mi respuesta, entonces el turno avanza en el flujo hacia Confirmado (o hacia validación de pago si aplica).
2. Dado que no respondo en el plazo configurado (ej. 48 horas), cuando vence el plazo, entonces el turno permanece en Pendiente y se notifica al panel del médico.
3. Dado que respondo negativamente o con una intención de cancelación, cuando el agente procesa mi respuesta, entonces el turno pasa al estado Cancelado y el horario queda libre.

Notas Técnicas:
- El agente debe interpretar variantes del lenguaje natural (sí, confirmo, dale, no, cancelar, etc.). Definir lista de intenciones positivas y negativas. Registrar todos los mensajes intercambiados.

Requisitos Funcionales:
[RF02.1] Crear turno

Reglas de Negocio:
- [RN-001] Un turno pasa a Confirmado solo cuando hay confirmación de asistencia (y pago, si aplica).

Archivos Adjuntos:
- "HU-014 - Wireframe - Flujo Conversación WhatsApp Confirmación.pdf"

---

### F08 – Recordatorios automáticos

---

**[HU-015] - Enviar recordatorio de turno por WhatsApp**

Descripción:
Como sistema,
quiero enviar un mensaje de recordatorio automático al paciente antes de su turno,
para reducir el ausentismo sin intervención manual del médico.
Épica: [EP-05] Comunicación Automatizada
Prioridad: Could
Estimación: S

Criterios de Aceptación:
1. Dado que un turno está en estado Confirmado, cuando llega el momento configurado (por defecto 24 hs antes), entonces el sistema envía un mensaje de recordatorio con fecha, hora y nombre del médico.
2. Dado que el turno es cancelado antes del envío programado, cuando llega el momento, entonces el sistema no envía el recordatorio.
3. Dado que el médico cambia el tiempo de anticipación en la configuración, cuando guarda el cambio, entonces el nuevo valor aplica a todos los recordatorios pendientes.

Notas Técnicas:
- Implementar como job programado (cron/scheduler). Verificar estado del turno justo antes de enviar. El tiempo de anticipación debe ser configurable por el médico.

Requisitos Funcionales:
- (funcionalidad implícita en el alcance del sistema, sin RF asignado en la tabla actual)

Reglas de Negocio:
- [RN-007] Los recordatorios solo se envían a turnos en estado Confirmado.

Archivos Adjuntos:
- "HU-015 - Wireframe - Configuración de Recordatorio.pdf"

---

### F09 – Validación de pago por WhatsApp

---

**[HU-016] - Validar pago por WhatsApp**

Descripción:
Como paciente,
quiero poder informar mi pago respondiendo el mensaje de WhatsApp,
para completar la confirmación de mi turno.
Épica: [EP-05] Comunicación Automatizada
Prioridad: Should
Estimación: L

Criterios de Aceptación:
1. Dado que confirmé asistencia y el turno requiere pago, cuando el agente me solicita confirmación de pago y respondo afirmativamente, entonces el turno pasa al estado Confirmado.
2. Dado que el paciente tiene obra social u otro convenio que exime el pago, cuando el agente evalúa el flujo, entonces el paso de validación de pago se omite y el turno pasa directamente a Confirmado tras la confirmación de asistencia.
3. Dado que el paciente no confirma el pago en el plazo configurado, cuando vence el plazo, entonces el turno permanece en estado intermedio y se notifica al panel del médico.

Notas Técnicas:
- La lógica de "requiere pago" debe ser configurable por paciente o tipo de turno. El agente no valida comprobantes; solo registra la confirmación verbal del paciente.

Requisitos Funcionales:
[RF02.1] Crear turno

Reglas de Negocio:
- [RN-001] Un turno pasa a Confirmado solo cuando hay confirmación de asistencia y pago (si aplica).

Archivos Adjuntos:
- "HU-016 - Wireframe - Flujo Conversación WhatsApp Pago.pdf"

---

### F10 – Autenticación y roles de usuario

---

**[HU-017] - Iniciar sesión en el sistema**

Descripción:
Como médico o personal administrativo,
quiero iniciar sesión con mis credenciales,
para acceder al sistema de forma segura.
Épica: [EP-06] Autenticación y Control de Acceso
Prioridad: Must
Estimación: M

Criterios de Aceptación:
1. Dado que ingreso usuario y contraseña válidos, cuando envío el formulario, entonces el sistema me autentica y me redirige al panel principal según mi rol.
2. Dado que ingreso credenciales incorrectas, cuando envío el formulario, entonces el sistema muestra "Usuario o contraseña incorrectos" sin indicar cuál campo falló.
3. Dado que permanezco inactivo durante el período configurado, cuando el sistema detecta la inactividad, entonces cierra la sesión automáticamente y me redirige al login.

Notas Técnicas:
- Usar JWT o sesión con cookie segura (HttpOnly, Secure). Implementar rate limiting en el endpoint de login para prevenir ataques de fuerza bruta.

Requisitos Funcionales:
- (requisito implícito de seguridad, sin RF asignado en la tabla actual)

Reglas de Negocio:
- (ninguna aplica específicamente)

Archivos Adjuntos:
- "HU-017 - Wireframe - Pantalla de Login.pdf"

---

**[HU-018] - Acceso diferenciado por rol**

Descripción:
Como médico,
quiero que el personal administrativo no pueda acceder al historial clínico ni a la configuración del sistema,
para proteger la privacidad de los datos médicos.
Épica: [EP-06] Autenticación y Control de Acceso
Prioridad: Must
Estimación: M

Criterios de Aceptación:
1. Dado que inicio sesión como médico, cuando navego por el sistema, entonces tengo acceso completo a pacientes (con historial), turnos, agenda, configuración y comunicación.
2. Dado que inicio sesión como personal administrativo, cuando navego, entonces puedo acceder a pacientes (sin historial clínico), turnos y agenda; las secciones restringidas no aparecen en el menú.
3. Dado que soy personal administrativo e intento acceder directamente a una URL restringida (ej. historial clínico), cuando el sistema evalúa mi rol, entonces recibo un error 403 "Acceso no autorizado".

Notas Técnicas:
- Implementar control de acceso basado en roles (RBAC) tanto en frontend (ocultar secciones) como en backend (validar permisos por endpoint). El frontend solo oculta; el backend debe rechazar con 403.

Requisitos Funcionales:
- (requisito implícito de seguridad, sin RF asignado en la tabla actual)

Reglas de Negocio:
- [RN-006] Solo el médico puede acceder al historial clínico de los pacientes.

Archivos Adjuntos:
- "HU-018 - Wireframe - Panel Médico vs Panel Administrativo.pdf"

---

## 3.3 División de Historias

### Criterios de división aplicados

Los criterios se tomaron del **Story Splitting Flowchart** (Richard Lawrence, traducción UTN DS26 - C04). El flowchart propone recorrer los siguientes criterios en orden hasta encontrar uno que permita dividir la historia:

| # | Criterio | Pregunta guía |
|---|----------|---------------|
| 1 | **Pasos del flujo de trabajo** | ¿La HU cubre varios pasos de un proceso que podrían entregarse en etapas? |
| 2 | **Variaciones de reglas de negocio** | ¿Hay distintas reglas que generan comportamientos diferenciados? |
| 3 | **Camino feliz / camino alternativo** | ¿Se puede separar el escenario exitoso de los escenarios de error o excepción? |
| 4 | **Variaciones de entrada** | ¿Diferentes tipos de entrada generan flujos distintos e independientes? |
| 5 | **Variaciones de datos** | ¿Distintos conjuntos de datos producen comportamientos entregables por separado? |
| 6 | **Operaciones (CRUD)** | ¿Se pueden separar las operaciones Crear, Leer, Actualizar y Eliminar? |
| 7 | **Diferir rendimiento** | ¿Se puede entregar primero una versión funcional y optimizar después? |
| 8 | **Separar un spike** | ¿Hay incertidumbre técnica que justifique una historia de investigación previa? |

---

### Análisis de todas las historias

Cada historia del backlog fue evaluada contra los 8 criterios.

| HU | Criterio 1 | Criterio 2 | Criterio 3 | Criterio 4 | Criterio 5 | Criterio 6 | Criterio 7 | Criterio 8 | Resultado |
|----|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
| HU-001 | No | No | No | No | No | No | No | No | Sin división |
| HU-002 | No | No | No | No | No | No | No | No | Sin división |
| HU-003 | No | No | No | No | No | No | No | No | Sin división |
| HU-004 | No | No | No | No | No | No | No | No | Sin división |
| HU-005 | No | No | No | No | No | No | No | No | Sin división |
| **HU-006** | **Sí** | – | – | – | – | – | – | – | **Dividida → HU-006a + HU-006b** |
| **HU-007** | No | **Sí** | – | – | – | – | – | – | **Dividida → HU-007a + HU-007b** |
| HU-008 | No | No | No | No | No | No | No | No | Sin división |
| HU-009 | No | No | No | No | No | No | No | No | Sin división |
| HU-010 | No | No | No | No | No | No | No | No | Sin división |
| HU-011 | No | No | No | No | No | No | No | No | Sin división |
| **HU-012** | No | No | No | No | **Sí** | – | – | – | **Dividida → HU-012a + HU-012b** |
| HU-013 | No | No | No | No | No | No | No | No | Sin división |
| HU-014 | No | No | **Sí** | – | – | – | – | – | Candidata* |
| HU-015 | No | No | No | No | No | No | No | No | Sin división |
| HU-016 | No | **Sí** | – | – | – | – | – | – | Candidata* |
| HU-017 | No | No | No | No | No | No | No | No | Sin división |
| HU-018 | No | No | No | No | No | No | No | No | Sin división |

*Candidatas a división futura si el tamaño de sprint lo requiere (ver notas al final).

---

### Historias divididas

#### HU-006 → HU-006a + HU-006b
**Criterio aplicado: Pasos del flujo de trabajo**

Crear el turno en el sistema (lógica interna de base de datos) y disparar el flujo de confirmación por WhatsApp (integración con sistema externo) son dos pasos consecutivos con responsabilidades distintas. HU-006b puede desarrollarse, testearse y desactivarse de forma completamente independiente de HU-006a. El primer paso es un prerequisito del segundo, lo que confirma la separación por etapas del proceso.

| Historia resultante | Descripción resumida | Estimación |
|--------------------|---------------------|------------|
| HU-006a | Crear turno para un paciente (lógica interna) | L |
| HU-006b | Iniciar flujo de confirmación por WhatsApp al crear turno | L |

---

#### HU-007 → HU-007a + HU-007b
**Criterio aplicado: Variaciones de reglas de negocio**

La cancelación tiene dos comportamientos distintos según el actor que la ejecuta: si la realiza el **médico**, el sistema debe notificar al paciente por WhatsApp; si la realiza el **personal administrativo**, no se envía notificación. Ambas reglas de negocio son independientes y pueden implementarse y entregarse en momentos distintos del desarrollo, siendo HU-007a la funcionalidad base y HU-007b la que agrega la integración con WhatsApp.

| Historia resultante | Descripción resumida | Estimación |
|--------------------|---------------------|------------|
| HU-007a | Cancelar turno (operación base, sin notificación) | S |
| HU-007b | Notificar cancelación al paciente por WhatsApp cuando cancela el médico | S |

---

#### HU-012 → HU-012a + HU-012b
**Criterio aplicado: Variaciones de datos**

La configuración de días/horarios y la configuración de duración del turno son dos conjuntos de datos independientes que el médico puede actualizar por separado y que el sistema procesa con lógica diferente. La duración del turno afecta la generación de bloques horarios, mientras que los días/horarios definen cuándo esos bloques existen. Cada uno puede entregarse, validarse y usarse sin depender del otro.

| Historia resultante | Descripción resumida | Estimación |
|--------------------|---------------------|------------|
| HU-012a | Configurar días de la semana y horario de atención | M |
| HU-012b | Configurar duración estándar de cada turno | S |

---

### Candidatas a división futura

| HU | Criterio identificado | Posible división |
|----|-----------------------|-----------------|
| HU-014 (Confirmar asistencia por WhatsApp) | Camino feliz / camino alternativo | HU-014a: respuesta positiva del paciente / HU-014b: no respuesta o cancelación |
| HU-016 (Validar pago por WhatsApp) | Variaciones de reglas de negocio | HU-016a: validación de pago obligatorio / HU-016b: exención de pago por obra social |

Estas historias no se dividieron en la iteración actual dado que su tamaño (L) es aceptable para un sprint. Se recomienda revisarlas en la planificación del Sprint 4 antes de comenzar su implementación.

---

### Backlog priorizado (post-división)

| ID | Historia | Feature | Prioridad | Estimación |
|----|----------|---------|-----------|------------|
| HU-017 | Iniciar sesión en el sistema | F10 | Must | M |
| HU-018 | Acceso diferenciado por rol | F10 | Must | M |
| HU-001 | Registrar nuevo paciente | F01 | Must | M |
| HU-003 | Buscar paciente | F01 | Must | S |
| HU-002 | Editar datos de un paciente | F01 | Should | S |
| HU-006a | Crear turno para un paciente | F03 | Must | L |
| HU-007a | Cancelar turno | F03 | Must | S |
| HU-009 | Consultar el estado de un turno | F04 | Must | S |
| HU-010 | Ver agenda diaria | F05 | Must | M |
| HU-007b | Notificar cancelación al paciente por WhatsApp | F03 | Should | S |
| HU-008 | Reprogramar un turno | F03 | Should | L |
| HU-011 | Ver agenda semanal | F05 | Should | M |
| HU-012a | Configurar días y horario de atención | F06 | Should | M |
| HU-012b | Configurar duración estándar del turno | F06 | Should | S |
| HU-013 | Bloquear franjas horarias | F06 | Should | M |
| HU-004 | Registrar nota clínica en una consulta | F02 | Should | M |
| HU-005 | Ver historial clínico de un paciente | F02 | Should | M |
| HU-006b | Iniciar flujo de confirmación al crear turno | F07 | Should | L |
| HU-014 | Confirmar asistencia por WhatsApp | F07 | Should | L |
| HU-016 | Validar pago por WhatsApp | F09 | Should | L |
| HU-015 | Enviar recordatorio de turno por WhatsApp | F08 | Could | S |

---

## 3.4 Calendario de Planificación

Con el backlog armado, distribuimos las historias en un calendario que refleja la estructura del curso. El desarrollo se organiza en etapas secuenciales:

| Bloque | Período | Qué se implementa |
|--------|---------|-------------------|
| **Bloque 2: Frontend** | Mayo a Julio | La interfaz de usuario completa con datos mock. Formularios, navegación, validaciones front. |
| **Bloque 3: Backend** | Julio a Septiembre | La API, base de datos, autenticación. Todo el servidor, probado con Postman. |
| **Bloque 4: Integración** | Septiembre a Noviembre | Conectar front con back real. Autorización, deploy, testing, ajustes finales. |

Las historias se escriben una sola vez pero se implementan en fases. Cada historia tiene tareas asociadas que indican en qué bloque se trabaja cada parte:

> **Ejemplo: HU-006a — Crear turno para un paciente**
> - **Bloque Front**: Pantalla de selección de paciente y bloque horario, formulario de creación, validaciones de UI, datos mock.
> - **Bloque Back**: Endpoint POST /api/turnos, lógica de verificación de disponibilidad, transacción con lock, persistencia en BD.
> - **Integración**: Conectar formulario al endpoint real, disparar flujo WhatsApp (HU-006b), manejar errores y estados de respuesta.

Los primeros 2–3 sprints de cada bloque se planifican con historias priorizadas y objetivos definidos.

---

### FRONTEND *(Mayo – Julio)*

| Sprint (2 semanas) | Épica | Feature |
|--------------------|-------|---------|
| FR-1 | EP06 – Autenticación y Control de Acceso | F10 – Autenticación y roles de usuario |
| FR-1 | EP01 – Gestión de Pacientes | F01 – Registro y consulta de pacientes |
| FR-2 | EP01 – Gestión de Pacientes | F02 – Historial clínico |
| FR-2 | EP02 – Gestión de Turnos | F03 – Operaciones sobre turnos |
| FR-2 | EP02 – Gestión de Turnos | F04 – Ciclo de vida y estados del turno |
| FR-3 | EP03 – Agenda y Calendario | F05 – Visualización de agenda |
| FR-3 | EP04 – Configuración del Médico | F06 – Configuración de disponibilidad |

---

### BACKEND *(Julio – Septiembre)*

| Sprint (2 semanas) | Épica | Feature |
|--------------------|-------|---------|
| BK-1 | EP06 – Autenticación y Control de Acceso | F10 – Autenticación y roles de usuario |
| BK-1 | EP01 – Gestión de Pacientes | F01 – Registro y consulta de pacientes |
| BK-2 | EP01 – Gestión de Pacientes | F02 – Historial clínico |
| BK-2 | EP02 – Gestión de Turnos | F03 – Operaciones sobre turnos |
| BK-3 | EP02 – Gestión de Turnos | F04 – Ciclo de vida y estados del turno |
| BK-3 | EP03 – Agenda y Calendario | F05 – Visualización de agenda |
| BK-3 | EP04 – Configuración del Médico | F06 – Configuración de disponibilidad |
| BK-4 | EP05 – Comunicación Automatizada | F07 – Flujo de confirmación por WhatsApp |
| BK-4 | EP05 – Comunicación Automatizada | F08 – Recordatorios automáticos |
| BK-4 | EP05 – Comunicación Automatizada | F09 – Validación de pago por WhatsApp |

---

### INTEGRACIÓN *(Septiembre – Noviembre)*

| Sprint (2 semanas) | Épica | Feature |
|--------------------|-------|---------|
| INT-1 | EP06 – Autenticación y Control de Acceso | F10 – Autenticación y roles de usuario |
| INT-1 | EP01 – Gestión de Pacientes | F01 – Registro y consulta de pacientes |
| INT-1 | EP01 – Gestión de Pacientes | F02 – Historial clínico |
| INT-2 | EP02 – Gestión de Turnos | F03 – Operaciones sobre turnos |
| INT-2 | EP02 – Gestión de Turnos | F04 – Ciclo de vida y estados del turno |
| INT-2 | EP03 – Agenda y Calendario | F05 – Visualización de agenda |
| INT-2 | EP04 – Configuración del Médico | F06 – Configuración de disponibilidad |
| INT-3 | EP05 – Comunicación Automatizada | F07 – Flujo de confirmación por WhatsApp |
| INT-3 | EP05 – Comunicación Automatizada | F08 – Recordatorios automáticos |
| INT-3 | EP05 – Comunicación Automatizada | F09 – Validación de pago por WhatsApp |
