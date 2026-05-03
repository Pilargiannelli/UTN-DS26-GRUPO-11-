# Proyecto IMOS - Backlog

## Fase 1: Preparación y Análisis Inicial

### 1.1 Alcance, módulos y límites

### ¿Qué problema resuelve? 

El consultorio de traumatología de IMOS Saladillo gestiona turnos y pacientes de forma completamente manual: WhatsApp individual, llamadas, papel y planillas. Esto genera una tasa alta de ausentismo, falta de estados formales para los turnos, historial clínico fragmentado y una carga operativa insostenible para el médico y la secretaria.

### ¿Quiénes son los usuarios?

Médico traumatólogo: gestiona la agenda, configura horarios y consulta historial clínico.

Secretaria/personal administrativo: carga pacientes, administra turnos manualmente cuando es necesario.

Paciente: actor externo. Interactúa únicamente por WhatsApp (no accede al sistema web).

### ¿Qué PUEDE hacer el sistema?

Registrar, editar y consultar pacientes con historial clínico básico (diagnóstico, evolución, observaciones).

Crear, modificar, cancelar y reprogramar turnos con estados definidos: pendiente, confirmado, cancelado, reprogramado.

Mostrar una vista de agenda tipo calendario (diaria y semanal).

Configurar la disponibilidad del médico: días, duración de turnos, bloqueos de horarios.

Automatizar la comunicación por WhatsApp mediante un agente de IA: confirmación de asistencia, validación de pago y recordatorios previos al turno.

Aplicar lógica de confirmación: un turno solo pasa a "confirmado" cuando el paciente confirma asistencia y pago (si corresponde).

### ¿Qué NO puede hacer el sistema? (límites explícitos)

No genera recetas digitales, certificados médicos ni historia clínica electrónica completa.

No incluye módulo de facturación, cobro en línea ni integración con obras sociales o prepagas.

No tiene versión móvil nativa (iOS/Android); es exclusivamente web responsive.

No soporta múltiples médicos ni especialidades en esta versión.

No incluye videoconsultas ni telemedicina.

No tiene estadísticas ni reportes avanzados de gestión.

No se comunica por canales distintos a WhatsApp (sin SMS, email ni Telegram).

---

## 2. Sistemas Externos con los que Interactúa

| Sistema externo | Tipo de interacción | Tecnología probable |
|----------------|---------------------|---------------------|
| WhatsApp Business | Envío/recepción de mensajes automatizados con pacientes | API oficial de WhatsApp (Meta Cloud API o Twilio) |
| Agente de IA | Procesa conversaciones con pacientes, interpreta respuestas y toma decisiones (confirmar, recordar, pedir pago) | LLM externo (ej. OpenAI, Anthropic API) o modelo propio |
| Sistema de autenticación | Control de acceso al panel web para médico y secretaria | Propio o servicio externo (OAuth, Auth0, etc.) |
| Servidor de archivos / BD | Almacenamiento de historial clínico, datos de pacientes y turnos | Propio (base de datos relacional + almacenamiento) |

---

## 3. Preguntas para el Cliente (Zonas Grises)

Estas son las dudas que deben resolverse antes de avanzar al diseño detallado:

Flujo de confirmación de turno: ¿El paciente primero confirma asistencia y luego pago, o puede hacerlo en cualquier orden? ¿Qué sucede si confirma asistencia pero no el pago?

Validación de pago: ¿Cómo valida el paciente que pagó? ¿Envía una captura de pantalla por WhatsApp, o simplemente responde "pagué"? ¿Quién valida esa información?

Turnos sin pago: ¿Hay pacientes que no pagan antes del turno (obras sociales, convenios)? ¿Para ellos se omite la validación de pago?

Gestión de la secretaria: ¿La secretaria puede crear turnos directamente sin que pasen por el flujo de WhatsApp? ¿Tiene los mismos permisos que el médico?

Número de WhatsApp: ¿El consultorio ya tiene (o puede obtener) un número exclusivo para el sistema automatizado? ¿O se reutiliza el número personal del médico?

Recordatorios: ¿Con cuánta anticipación deben enviarse los recordatorios? ¿Uno o más recordatorios por turno? ¿El médico puede configurar este tiempo?

Historial clínico: ¿Existen datos de pacientes previos para migrar? ¿En qué formato están (papel, Excel)? ¿Quién realiza la carga inicial?

Cancelaciones por el médico: Si el médico cancela un turno, ¿el sistema notifica automáticamente al paciente por WhatsApp?

Acceso multiusuario simultáneo: ¿El médico y la secretaria usarán el sistema al mismo tiempo? ¿Desde dispositivos distintos?

Idioma del agente de IA: ¿Las respuestas automáticas son solo en español? ¿Deben tener un tono formal o informal?

---

## 4. Diagrama Contextual

![Diagrama AMI](diagrama-contextual.png)

### 1.2 Glosario de términos

El siguiente glosario reúne los términos clave del dominio del sistema. Su propósito es eliminar ambigüedades dentro del equipo de desarrollo y servir como base para el modelo de dominio (Fase 2). Las definiciones están contextualizadas en el funcionamiento real del sistema y validadas contra el documento de visión y alcance.

| Término | Definición | Sinónimos | Módulo |
|---|---|---|---|
| Paciente | Persona registrada en el sistema que tiene o ha tenido turnos en el consultorio de traumatología de IMOS. El sistema almacena sus datos personales y su historial clínico básico. | – | Pacientes |
| Historial clínico | Registro acumulado de las consultas de un paciente: diagnósticos, evolución del tratamiento y observaciones por visita. No incluye recetas ni certificados médicos. | Historia clínica | Pacientes |
| Consulta | Cada visita registrada de un paciente al médico. Queda asentada en el historial clínico con fecha, diagnóstico y observaciones. | Visita | Pacientes |
| Diagnóstico | Descripción del problema médico identificado durante una consulta. Se registra como parte de la entrada correspondiente en el historial clínico. | – | Pacientes |
| Evolución | Seguimiento del estado clínico del paciente a lo largo de sucesivas consultas. Permite al médico ver cómo progresó un tratamiento. | Seguimiento | Pacientes |
| Turno | Cita programada entre un paciente y el médico para una fecha y hora determinadas. Es la unidad central del sistema y posee un estado que varía durante su ciclo de vida. | Cita, Consulta | Turnos |
| Estado del turno | Situación en la que se encuentra un turno en un momento dado. Los estados posibles son: Pendiente, Confirmado, Cancelado y Reprogramado. | – | Turnos |
| Turno pendiente | Turno creado pero aún no confirmado por el paciente. No figura en la agenda definitiva del médico hasta que se complete la confirmación. | Turno en espera | Turnos |
| Turno confirmado | Turno que el paciente confirmó explícitamente (y validó el pago, si corresponde). Solo en este estado el turno se incorpora a la agenda definitiva del médico. | – | Turnos |
| Turno cancelado | Turno que fue anulado por el paciente o el personal antes de que se llevara a cabo la consulta. | – | Turnos |
| Turno reprogramado | Turno que fue modificado para una nueva fecha u hora, generando un nuevo turno en estado Pendiente y dejando el original marcado como Reprogramado. | – | Turnos |
| Confirmación | Acción mediante la cual el paciente indica, a través de WhatsApp, que asistirá a su turno. Es condición necesaria para que el turno pase al estado Confirmado. | Confirmación de asistencia | Turnos |
| Ausentismo | Fenómeno por el cual un paciente no se presenta a su turno sin haberlo cancelado previamente. Es el principal problema que el sistema busca reducir. | No presentismo | Turnos |
| Reprogramación | Operación que permite mover un turno existente a una nueva fecha u hora. El sistema genera un nuevo turno y actualiza el estado del original. | – | Turnos |
| Agenda | Vista consolidada de los turnos confirmados del médico, organizada en formato calendario diario y semanal. Solo muestra turnos en estado Confirmado. | Calendario | Agenda |
| Bloque horario | Franja de tiempo disponible para asignar un turno, definida por la configuración del médico. Su duración es fija y configurable (por ejemplo, 30 minutos por turno). | Slot, Franja horaria | Agenda |
| Vista diaria | Presentación de la agenda que muestra todos los turnos confirmados correspondientes a un día específico. | – | Agenda |
| Vista semanal | Presentación de la agenda que muestra los turnos confirmados distribuidos a lo largo de los siete días de la semana seleccionada. | – | Agenda |
| Horario de atención | Conjunto de días y franjas horarias en los que el médico está disponible para recibir pacientes. Define qué bloques horarios pueden asignarse a turnos. | Disponibilidad | Configuración |
| Duración del turno | Tiempo en minutos que se reserva para cada consulta. Determina la cantidad de bloques horarios disponibles por día. | – | Configuración |
| Bloqueo de horario | Marcación de un bloque horario como no disponible, impidiendo que se generen turnos en ese intervalo (vacaciones, reuniones, feriados). | Horario bloqueado | Configuración |
| Agente de IA | Componente del sistema que gestiona de forma autónoma la comunicación con los pacientes por WhatsApp. Interpreta mensajes, envía respuestas y ejecuta acciones como confirmar turnos o solicitar pagos. | Bot, Asistente virtual | Comunicación |
| Recordatorio | Mensaje automático enviado al paciente por WhatsApp antes de la fecha del turno, con el objetivo de reducir el ausentismo. | Notificación previa | Comunicación |
| Flujo de confirmación | Secuencia de mensajes intercambiados entre el agente de IA y el paciente a través de WhatsApp para validar su asistencia y, si aplica, su pago, hasta que el turno quede en estado Confirmado. | – | Comunicación |
| Canal de comunicación | Medio a través del cual el sistema se contacta con los pacientes. En esta versión, el único canal soportado es WhatsApp. | – | Comunicación |
| WhatsApp Business API | Servicio externo utilizado para enviar y recibir mensajes de WhatsApp de forma programática. El agente de IA opera sobre este canal para gestionar los flujos de confirmación y recordatorio. | API de WhatsApp | Comunicación |
| Médico | Usuario principal del sistema. Gestiona su agenda, accede al historial clínico de los pacientes y configura sus horarios de atención. | Médico traumatólogo | Usuarios |
| Personal administrativo | Usuario secundario del sistema. Puede registrar pacientes y gestionar turnos, pero no tiene acceso al historial clínico. | Secretaria, Admin | Usuarios |
| Rol | Perfil de acceso asignado a cada usuario del sistema que determina qué funcionalidades puede ver y operar. Los roles definidos son: Médico y Personal Administrativo. | Perfil de usuario | Usuarios |


------------------------------------------

## Fase 2: Modelado de Dominio

### 2.1 Modelo de dominio
![Diagrama de Clases - Clínica IMOS](./ModDomIMOSV_1.png)

**Justificación del Modelo:**

Se modelaron las entidades del sistema a partir del documento de visión y 
alcance de IMOS. La clase 'Turno' actúa como eje central, gestionando el 
ciclo de vida de cada cita mediante la enumeración 'TurnoEstado'. La jerarquía 
'Usuario → Medico / Secretaria' centraliza los datos de acceso y 
separa responsabilidades por rol. La 'Agenda' del médico define la 
disponibilidad horaria, mientras que 'HistoriaClinica' y 'EntradaClinica'
registran la evolución clínica de cada paciente. Finalmente, 'AsistenteIA' 
encapsula toda la comunicación automática por WhatsApp, desacoplando esa 
lógica del personal del consultorio.

### 2.2 Requisitos funcionales
| ID | REQUERIMIENTO | DESCRIPCIÓN | MÓDULO |
|----|---------------|-------------|--------|
| RF01.1 | Registrar paciente | Permite dar de alta un nuevo paciente con sus datos personales | Gestión de Pacientes |
| RF01.2 | Editar paciente | Permite modificar los datos personales de un paciente ya registrado en el sistema | Gestión de Pacientes |
| RF01.3 | Buscar paciente | Permite buscar y consultar pacientes registrados | Gestión de Pacientes |
| RF01.4 | Registrar nota clínica | Permite registrar notas por consulta | Gestión de Pacientes |
| RF01.5 | Visualizar historial clínico | Permite ver el historial clínico completo de un paciente con todas sus consultas previas | Gestión de Pacientes |
| RF01.6 | Asociar nota a consulta | Cada nota clínica queda vinculada a una consulta específica | Gestión de Pacientes |
| RF02.1 | Crear turno | Permite registrar un nuevo turno para un paciente en una fecha y hora disponible | Gestión de Turnos |
| RF02.2 | Modificar turno | Permite editar los datos de un turno existente | Gestión de Turnos |
| RF02.3 | Cancelar turno | Permite cancelar un turno | Gestión de Turnos |
| RF02.4 | Reprogramar turno | Permite mover un turno a un nuevo horario o fecha | Gestión de Turnos |
| RF03.1 | Vista de agenda diaria | Muestra los turnos del día actual en formato calendario | Agenda y Calendario |
| RF03.2 | Vista de agenda semanal | Muestra los turnos de la semana en formato calendario | Agenda y Calendario |
| RF03.3 | Mostrar solo turnos confirmados | La agenda definitiva solo exhibe turnos en estado "confirmado" | Agenda y Calendario |
| RF04.1 | Definir días disponibles | El médico puede indicar qué días de la semana está disponible para atención | Disponibilidad del Médico |
| RF04.2 | Configurar horario de atención | El médico puede establecer la hora de inicio y fin de atención por día | Disponibilidad del Médico |
| RF04.3 | Establecer duración de turno | Permite definir la duración estándar de cada turno | Disponibilidad del Médico |
| RF04.4 | Bloquear franjas horarias | Permite bloquear horarios específicos para que no se asignen turnos | Disponibilidad del Médico |

### 2.3 Reglas de negocio
| Id     | Regla                              | Descripcion                                                                 |
|--------|------------------------------------|-----------------------------------------------------------------------------|
| RN-001 | Respeto de disponibilidad          | Los pacientes solo pueden solicitar turnos dentro de los días y horarios definidos por el médico. |
| RN-002 | No superposición de turnos         | No se podrán registrar dos turnos confirmados en el mismo horario para el mismo médico. |
| RN-003 | Registro obligatorio de paciente   | Para solicitar un turno, el paciente debe estar previamente registrado en el sistema con sus datos básicos. |
| RN-004 | Control de acceso por rol          | El acceso a funcionalidades del sistema debe estar restringido según el rol del usuario (médico, secretaria, paciente). |
| RN-005 | Tiempo límite de confirmación      | Un turno en estado pendiente debe confirmarse dentro de un tiempo límite de 48hs, caso contrario se cancela automáticamente. |
| RN-006 | Cancelación anticipada mínima      | El paciente podrá cancelar el turno antes de la confirmación del mismo. |
| RN-007 | Asociación obligatoria consulta–turno | No puede registrarse una consulta médica sin que exista un turno asociado. |
| RN-008 | Validación de horario futuro       | No se pueden solicitar turnos en fechas u horarios pasados. |
| RN-009 | Exclusividad del rol médico        | Solo el médico puede registrar diagnósticos y observaciones clínicas. |
| RN-0010 | Cierre de agenda por período de ausencia | El médico puede definir períodos de ausencia (vacaciones, licencias, congresos) en los cuales la agenda queda cerrada automáticamente. Durante este período no se pueden solicitar ni asignar turnos, y los ya confirmados deben ser notificados y reprogramados. |
| RN-0011 | Auditoría de cambios              | Toda modificación sobre turnos o datos de pacientes debe registrar fecha, hora y usuario responsable. |

### 2.4 Modelos Complementarios
(Responsable: Figueroa Rodrigo)
![TurnoEstado][def]

[def]: </Documentacion/02 - Modelado de Dominio/TurnoEstado v3.jpg>

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

### 3.2 Historias de Usuario

#### **[HU-001] Registrar nuevo paciente**
#### Descripción
**Como** personal administrativo,  
**quiero** registrar un nuevo paciente con sus datos personales,  
**para** que quede disponible en el sistema y se le puedan asignar turnos.  

**Épica:** [EP-01] Gestión de Pacientes  
**Prioridad:** Must  
**Estimación:** M  

#### Criterios de Aceptación
1. **Dado** que soy personal administrativo autenticado con datos válidos completos, **cuando** guardo el formulario, **entonces** el paciente queda registrado y disponible para búsqueda y asignación de turnos.
2. **Dado** que ingreso un DNI que ya existe en el sistema, **cuando** intento guardar, **entonces** se muestra "El DNI ya se encuentra registrado" y no se crea el duplicado.
3. **Dado** que dejo campos obligatorios vacíos (nombre, apellido, DNI o teléfono), **cuando** intento guardar, **entonces** el sistema marca los campos faltantes y no procede con el registro.

#### Notas Técnicas
- Validar unicidad del DNI antes de insertar. Aplicar validación de formato de número de teléfono WhatsApp (código de país incluido).

#### Requisitos Funcionales
- [RF01.1] Registrar paciente

#### Reglas de Negocio
- (ninguna aplica específicamente)

#### Archivos Adjuntos
- "HU-001 - Wireframe - Formulario Registro de Paciente.pdf"

#### **[HU-002] - Editar datos de un paciente**
#### Descripción
**Como** personal administrativo,  
**quiero** modificar los datos personales de un paciente ya registrado,  
**para** mantener la información actualizada.

**Épica:** [EP-01] Gestión de Pacientes  
**Prioridad:** Should  
**Estimación:** S

#### Criterios de Aceptación
1. **Dado** que accedo al perfil de un paciente existente, **cuando** edito sus datos y guardo, **entonces** los cambios se reflejan inmediatamente en el sistema.
2. **Dado** que accedo al formulario de edición, **cuando** lo abro, **entonces** el campo DNI aparece deshabilitado y no puede modificarse.
3. **Dado** que dejo un campo obligatorio vacío durante la edición, **cuando** intento guardar, **entonces** el sistema muestra un error de validación y no guarda el cambio.

#### Notas Técnicas
- El campo DNI debe estar deshabilitado en el frontend y rechazado si se envía modificado por el backend.

#### Requisitos Funcionales
- [RF01.2] Editar paciente

#### Reglas de Negocio
- (ninguna aplica específicamente)

#### Archivos Adjuntos
- "HU-002 - Wireframe - Formulario Edición de Paciente.pdf"

#### **[HU-003] - Buscar paciente**
#### Descripción
**Como** médico o personal administrativo,  
**quiero** buscar pacientes por nombre o DNI,  
**para** encontrarlos rápidamente sin recorrer la lista completa.

**Épica:** [EP-01] Gestión de Pacientes  
**Prioridad:** Must  
**Estimación:** S

#### Criterios de Aceptación
1. **Dado** que ingreso al menos 2 caracteres en el buscador, **cuando** escribo, **entonces** el sistema muestra los pacientes cuyo nombre, apellido o DNI coincidan.
2. **Dado** que ingreso un criterio que no coincide con ningún paciente, **cuando** termino de escribir, **entonces** se muestra el mensaje "No se encontraron pacientes".
3. **Dado** que hago clic en un resultado de búsqueda, **cuando** selecciono un paciente, **entonces** se navega al perfil del paciente seleccionado.

#### Notas Técnicas
- Búsqueda en tiempo real con debounce de ~300ms para evitar requests excesivos al backend.

#### Requisitos Funcionales
- [RF01.3] Buscar paciente

#### Reglas de Negocio
- (ninguna aplica específicamente)

#### Archivos Adjuntos
- "HU-003 - Wireframe - Buscador de Pacientes.pdf"

#### **[HU-004] - Registrar nota clínica en una consulta**
#### Descripción
**Como** médico,  
**quiero** registrar una nota con diagnóstico, evolución y observaciones para cada consulta,  
**para** llevar un historial estructurado del paciente.

**Épica:** [EP-01] Gestión de Pacientes  
**Prioridad:** Should  
**Estimación:** M

#### Criterios de Aceptación
1. **Dado** que soy el médico autenticado, **cuando** registro una nota clínica con fecha, diagnóstico y observaciones, **entonces** la nota queda vinculada a esa consulta y visible en el historial del paciente.
2. **Dado** que soy personal administrativo, **cuando** intento acceder al formulario de nota clínica, **entonces** el sistema deniega el acceso con un error de autorización.
3. **Dado** que dejo el campo diagnóstico vacío, **cuando** intento guardar la nota, **entonces** el sistema muestra un error de validación y no guarda.

#### Notas Técnicas
- La nota se asocia a la relación paciente-consulta (fecha + paciente_id). Campos de texto libre sin restricción de longitud estricta.

#### Requisitos Funcionales
- [RF01.4] Registrar nota clínica
- [RF01.6] Asociar nota a consulta

#### Reglas de Negocio
- [RN-002] Solo el médico puede registrar y editar notas clínicas.

#### Archivos Adjuntos
- "HU-004 - Wireframe - Formulario Nota Clínica.pdf"

#### **[HU-005] - Ver historial clínico de un paciente**
#### Descripción
**Como** médico,  
**quiero** ver el historial clínico completo de un paciente con todas sus consultas previas,  
**para** revisar sus antecedentes antes de atenderlo.

**Épica:** [EP-01] Gestión de Pacientes  
**Prioridad:** Should  
**Estimación:** M

#### Criterios de Aceptación
1. **Dado** que soy el médico autenticado, **cuando** accedo al historial de un paciente, **entonces** veo la lista de consultas ordenadas de más reciente a más antigua, con fecha, diagnóstico, evolución y observaciones.
2. **Dado** que un paciente no tiene consultas registradas, **cuando** accedo a su historial, **entonces** se muestra el mensaje "Sin consultas registradas".
3. **Dado** que soy personal administrativo, **cuando** intento acceder al historial clínico de cualquier paciente, **entonces** el sistema deniega el acceso con un error de autorización.

#### Notas Técnicas
- Paginación recomendada si el historial supera 20 entradas. Ordenamiento por fecha DESC.

#### Requisitos Funcionales
- [RF01.5] Visualizar historial clínico

#### Reglas de Negocio
- [RN-006] Solo el médico puede acceder al historial clínico de los pacientes.

#### Archivos Adjuntos
- "HU-005 - Wireframe - Vista Historial Clínico.pdf"

#### **[HU-006a] - Crear turno para un paciente**
#### Descripción
**Como** personal administrativo,  
**quiero** crear un turno para un paciente seleccionando un bloque horario disponible,  
**para** agendar su consulta en el sistema.

**Épica:** [EP-02] Gestión de Turnos  
**Prioridad:** Must  
**Estimación:** L

#### Criterios de Aceptación
1. **Dado** que selecciono un paciente y un bloque horario disponible, **cuando** guardo el turno, **entonces** el turno queda registrado en estado Pendiente y el bloque deja de estar disponible.
2. **Dado** que el bloque horario seleccionado ya está ocupado, **cuando** intento guardar, **entonces** el sistema muestra "El horario seleccionado ya no está disponible" y no crea el turno.
3. **Dado** que el bloque horario está bloqueado por el médico, **cuando** intento seleccionarlo, **entonces** el sistema no lo muestra como opción disponible.

#### Notas Técnicas
- Verificar disponibilidad del bloque en el backend antes de confirmar la escritura (condición de carrera si dos usuarios crean turno simultáneamente). Usar transacción con lock.

#### Requisitos Funcionales
- [RF02.1] Crear turno

#### Reglas de Negocio
- [RN-004] No se pueden asignar turnos en bloques ocupados o bloqueados.

#### Archivos Adjuntos
- "HU-006a - Wireframe - Formulario Creación de Turno.pdf"

#### **[HU-006b] - Iniciar flujo de confirmación al crear turno**
#### Descripción
**Como** sistema,  
**quiero** enviar un mensaje de WhatsApp automáticamente al crear un turno,  
**para** iniciar el flujo de confirmación con el paciente sin intervención manual.

**Épica:** [EP-05] Comunicación Automatizada  
**Prioridad:** Should  
**Estimación:** L

#### Criterios de Aceptación
1. **Dado** que se crea un turno para un paciente con número de WhatsApp registrado, **cuando** el turno queda en estado Pendiente, **entonces** el agente de IA envía automáticamente un mensaje al paciente con fecha, hora y nombre del médico.
2. **Dado** que el paciente no tiene número de WhatsApp registrado, **cuando** se crea el turno, **entonces** el turno queda en Pendiente sin enviar mensaje y se registra una alerta en el panel administrativo.
3. **Dado** que el servicio de WhatsApp no está disponible, **cuando** se intenta enviar el mensaje, **entonces** el sistema reintenta hasta 3 veces y registra el error si persiste, sin bloquear la creación del turno.

#### Notas Técnicas
- El envío de mensajes debe ser asíncrono (worker/queue) para no bloquear el endpoint de creación. Integrar con WhatsApp Business API (Meta Cloud API o Twilio).

#### Requisitos Funcionales
- [RF02.1] Crear turno

#### Reglas de Negocio
- (ninguna aplica específicamente)

#### Archivos Adjuntos
- "HU-006b - Wireframe - Notificación WhatsApp Creación de Turno.pdf"

#### **[HU-007] - Cancelar un turno**
#### Descripción
**Como** médico o personal administrativo,  
**quiero** cancelar un turno existente,  
**para** liberar ese horario **cuando** el paciente no va a asistir.

**Épica:** [EP-02] Gestión de Turnos  
**Prioridad:** Must  
**Estimación:** M

#### Criterios de Aceptación
1. **Dado** que selecciono un turno en estado Pendiente o Confirmado, **cuando** ejecuto la cancelación, **entonces** el turno pasa al estado Cancelado y el bloque horario queda disponible para nuevos turnos.
2. **Dado** que el médico cancela un turno Confirmado, **cuando** se confirma la cancelación, **entonces** el sistema envía automáticamente una notificación al paciente por WhatsApp.
3. **Dado** que el turno ya está en estado Cancelado o Reprogramado, **cuando** intento cancelarlo, **entonces** el sistema no permite la acción y muestra un mensaje de estado inválido.

#### Notas Técnicas
- La notificación al paciente se dispara de forma asíncrona para no bloquear la respuesta al usuario. Registrar el evento de cancelación con fecha y autor.

#### Requisitos Funcionales
- [RF02.3] Cancelar turno

#### Reglas de Negocio
- [RN-001] Solo se pueden cancelar turnos en estado Pendiente o Confirmado.

#### Archivos Adjuntos
- "HU-007 - Wireframe - Modal Confirmación Cancelación.pdf"

#### **[HU-008] - Reprogramar un turno**
#### Descripción
**Como** médico o personal administrativo,  
**quiero** mover un turno a una nueva fecha u hora,  
**para** adaptarme a cambios en la disponibilidad del paciente o del médico.

**Épica:** [EP-02] Gestión de Turnos  
**Prioridad:** Should  
**Estimación:** L

#### Criterios de Aceptación
1. **Dado** que selecciono un turno en estado Pendiente o Confirmado, **cuando** elijo una nueva fecha/hora disponible y confirmo, **entonces** el turno original pasa a Reprogramado y se crea un nuevo turno en estado Pendiente.
2. **Dado** que se crea el nuevo turno, **cuando** se completa la reprogramación, **entonces** el sistema inicia automáticamente el flujo de confirmación por WhatsApp para el nuevo turno.
3. **Dado** que el bloque seleccionado para la nueva fecha ya está ocupado, **cuando** intento confirmar la reprogramación, **entonces** el sistema muestra "El horario seleccionado no está disponible" y no realiza ningún cambio.

#### Notas Técnicas
- La operación debe ser atómica: actualizar estado del turno original y crear el nuevo en la misma transacción de DB.

#### Requisitos Funcionales
- [RF02.4] Reprogramar turno

#### Reglas de Negocio
- [RN-005] Al reprogramar, el turno original pasa a Reprogramado y se crea uno nuevo en Pendiente.
- [RN-004] No se pueden asignar turnos en bloques ocupados o bloqueados.

#### Archivos Adjuntos
- "HU-008 - Wireframe - Formulario Reprogramación de Turno.pdf"

#### **[HU-009] - Consultar el estado de un turno**
#### Descripción
**Como** médico o personal administrativo,  
**quiero** ver el estado actual de cada turno en la lista de turnos,  
**para** saber en qué etapa se encuentra sin hacer seguimiento manual.

**Épica:** [EP-02] Gestión de Turnos  
**Prioridad:** Must  
**Estimación:** S

#### Criterios de Aceptación
1. **Dado** que accedo a la lista de turnos, **cuando** los veo listados, **entonces** cada turno muestra su estado con un indicador visual diferenciado: Pendiente (gris), Confirmado (verde), Cancelado (rojo), Reprogramado (naranja).
2. **Dado** que el estado de un turno cambia (por WhatsApp o acción manual), **cuando** recargo la vista, **entonces** el nuevo estado se refleja correctamente.
3. **Dado** que aplico un filtro por estado, **cuando** selecciono un estado específico, **entonces** solo se muestran los turnos con ese estado.

#### Notas Técnicas
- Los indicadores de estado no deben basarse únicamente en color (agregar etiqueta de texto para accesibilidad). Considerar polling liviano o refresco automático.

#### Requisitos Funcionales
- [RF02.1] Crear turno
- [RF02.2] Modificar turno
- [RF02.3] Cancelar turno
- [RF02.4] Reprogramar turno

#### Reglas de Negocio
- (ninguna aplica específicamente)

#### Archivos Adjuntos
- "HU-009 - Wireframe - Lista de Turnos con Estados.pdf"

#### **[HU-010] - Ver agenda diaria**
#### Descripción
**Como** médico,  
**quiero** ver todos mis turnos confirmados del día en formato calendario,  
**para** planificar mi jornada de trabajo.

**Épica:** [EP-03] Agenda y Calendario  
**Prioridad:** Must  
**Estimación:** M

#### Criterios de Aceptación
1. **Dado** que accedo a la vista diaria del día actual, **cuando** la cargo, **entonces** veo los turnos Confirmados organizados por franjas horarias con nombre del paciente y horario de cada uno.
2. **Dado** que el día no tiene turnos confirmados, **cuando** accedo a la agenda diaria, **entonces** se muestra el mensaje "Sin turnos confirmados para hoy".
3. **Dado** que navego entre días, **cuando** selecciono una fecha diferente, **entonces** la agenda muestra los turnos Confirmados de ese día.

#### Notas Técnicas
- Solo renderizar turnos con estado = Confirmado. El componente de calendario debe soportar navegación día a día.

#### Requisitos Funcionales
- [RF03.1] Vista de agenda diaria
- [RF03.3] Mostrar solo turnos confirmados

#### Reglas de Negocio
- [RN-003] La agenda solo muestra turnos en estado Confirmado.

#### Archivos Adjuntos
- "HU-010 - Wireframe - Agenda Diaria.pdf"

#### **[HU-011] - Ver agenda semanal**
#### Descripción
**Como** médico,  
**quiero** ver los turnos confirmados distribuidos en los siete días de la semana,  
**para** tener una visión general de mi agenda.

**Épica:** [EP-03] Agenda y Calendario  
**Prioridad:** Should  
**Estimación:** M

#### Criterios de Aceptación
1. **Dado** que accedo a la vista semanal, **cuando** cargo la semana actual, **entonces** veo los 7 días con sus turnos Confirmados distribuidos en el calendario.
2. **Dado** que hago clic en "semana anterior" o "semana siguiente", **cuando** navego, **entonces** la vista actualiza y muestra los turnos de la semana seleccionada.
3. **Dado** que una semana no tiene turnos confirmados, **cuando** accedo a ella, **entonces** el calendario aparece vacío sin mostrar errores.

#### Notas Técnicas
- Misma lógica de filtrado que la vista diaria (estado = Confirmado), con rango de fechas extendido a 7 días.

#### Requisitos Funcionales
- [RF03.2] Vista de agenda semanal
- [RF03.3] Mostrar solo turnos confirmados

#### Reglas de Negocio
- [RN-003] La agenda solo muestra turnos en estado Confirmado.

#### Archivos Adjuntos
- "HU-011 - Wireframe - Agenda Semanal.pdf"

#### **[HU-012a] - Configurar días y horario de atención**
#### Descripción
**Como** médico,  
**quiero** definir qué días de la semana y en qué horarios estoy disponible,  
**para** que el sistema solo ofrezca esos bloques al crear turnos.

**Épica:** [EP-04] Configuración del Médico  
**Prioridad:** Should  
**Estimación:** M

#### Criterios de Aceptación
1. **Dado** que selecciono días de la semana y defino hora de inicio y fin por día y guardo, **cuando** el sistema muestra bloques disponibles para nuevos turnos, **entonces** los bloques reflejan esa configuración.
2. **Dado** que no selecciono ningún día, **cuando** intento guardar, **entonces** el sistema muestra "Debe seleccionar al menos un día de atención".
3. **Dado** que configuro un horario de fin anterior al de inicio para un día, **cuando** intento guardar, **entonces** el sistema muestra un error de validación de horario.

#### Notas Técnicas
- Guardar la configuración por día de semana (estructura recurrente, no por fecha específica). El generador de bloques debe recalcular al guardar cambios.

#### Requisitos Funcionales
[RF04.1] Definir días disponibles
[RF04.2] Configurar horario de atención

#### Reglas de Negocio
- (ninguna aplica específicamente)

#### Archivos Adjuntos
- "HU-012a - Wireframe - Configuración Días y Horarios.pdf"

#### **[HU-012b] - Configurar duración estándar del turno**
#### Descripción
**Como** médico,  
**quiero** establecer la duración estándar de cada turno en minutos,  
**para** que el sistema divida automáticamente los horarios en bloques correctos.

**Épica:** [EP-04] Configuración del Médico  
**Prioridad:** Should  
**Estimación:** S

#### Criterios de Aceptación
1. **Dado** que selecciono una duración (ej. 20, 30, 45, 60 minutos) y guardo, **cuando** el sistema genera bloques disponibles, **entonces** los bloques respetan la duración configurada.
2. **Dado** que cambio la duración, **cuando** guardo la nueva configuración, **entonces** los bloques futuros sin turno asignado se recalculan con la nueva duración; los turnos ya asignados no se alteran.
3. **Dado** que dejo el campo de duración vacío, **cuando** intento guardar, **entonces** el sistema muestra un error de validación.

#### Notas Técnicas
- El cambio de duración solo afecta bloques futuros sin turnos asignados. Los bloques con turnos existentes no se modifican.

#### Requisitos Funcionales
[RF04.3] Establecer duración de turno

#### Reglas de Negocio
- (ninguna aplica específicamente)

#### Archivos Adjuntos
- "HU-012b - Wireframe - Configuración Duración de Turno.pdf"

#### **[HU-013] - Bloquear franjas horarias**
#### Descripción
**Como** médico,  
**quiero** bloquear horarios específicos (vacaciones, reuniones, feriados),  
**para** que no se asignen turnos en esos intervalos.

**Épica:** [EP-04] Configuración del Médico  
**Prioridad:** Should  
**Estimación:** M

#### Criterios de Aceptación
1. **Dado** que defino un rango de fecha y hora para bloquear y guardo, **cuando** el sistema muestra bloques disponibles, **entonces** los bloques dentro del rango bloqueado no aparecen como disponibles.
2. **Dado** que elimino un bloqueo existente, **cuando** guardo el cambio, **entonces** los bloques antes bloqueados vuelven a estar disponibles para nuevos turnos.
3. **Dado** que intento bloquear un rango que ya tiene turnos asignados, **cuando** guardo, **entonces** el sistema muestra una advertencia con los turnos afectados y solicita confirmación antes de proceder.

#### Notas Técnicas
- Verificar colisiones con turnos existentes al crear bloqueos. Guardar bloqueos como rangos de fecha-hora en tabla dedicada.

#### Requisitos Funcionales
[RF04.4] Bloquear franjas horarias

#### Reglas de Negocio
- (ninguna aplica específicamente)

#### Archivos Adjuntos
- "HU-013 - Wireframe - Gestión de Bloqueos Horarios.pdf"

#### **[HU-014] - Confirmar asistencia por WhatsApp**
#### Descripción
**Como** paciente,  
**quiero** recibir un mensaje de WhatsApp con los datos de mi turno y poder confirmar mi asistencia respondiendo,  
**para** que el consultorio sepa que voy a asistir.

**Épica:** [EP-05] Comunicación Automatizada  
**Prioridad:** Should  
**Estimación:** L

#### Criterios de Aceptación
1. **Dado** que recibo el mensaje de confirmación y respondo afirmativamente (ej. "Confirmo", "Sí", "Dale"), **cuando** el agente procesa mi respuesta, **entonces** el turno avanza en el flujo hacia Confirmado (o hacia validación de pago si aplica).
2. **Dado** que no respondo en el plazo configurado (ej. 48 horas), **cuando** vence el plazo, **entonces** el turno permanece en Pendiente y se notifica al panel del médico.
3. **Dado** que respondo negativamente o con una intención de cancelación, **cuando** el agente procesa mi respuesta, **entonces** el turno pasa al estado Cancelado y el horario queda libre.

#### Notas Técnicas
- El agente debe interpretar variantes del lenguaje natural (sí, confirmo, dale, no, cancelar, etc.). Definir lista de intenciones positivas y negativas. Registrar todos los mensajes intercambiados.

#### Requisitos Funcionales
[RF02.1] Crear turno

#### Reglas de Negocio
- [RN-001] Un turno pasa a Confirmado solo cuando hay confirmación de asistencia (y pago, si aplica).

#### Archivos Adjuntos
- "HU-014 - Wireframe - Flujo Conversación WhatsApp Confirmación.pdf"

#### **[HU-015] - Enviar recordatorio de turno por WhatsApp**
#### Descripción
**Como** sistema,  
**quiero** enviar un mensaje de recordatorio automático al paciente antes de su turno,  
**para** reducir el ausentismo sin intervención manual del médico.

**Épica:** [EP-05] Comunicación Automatizada  
**Prioridad:** Could  
**Estimación:** S

#### Criterios de Aceptación
1. **Dado** que un turno está en estado Confirmado, **cuando** llega el momento configurado (por defecto 24 hs antes), **entonces** el sistema envía un mensaje de recordatorio con fecha, hora y nombre del médico.
2. **Dado** que el turno es cancelado antes del envío programado, **cuando** llega el momento, **entonces** el sistema no envía el recordatorio.
3. **Dado** que el médico cambia el tiempo de anticipación en la configuración, **cuando** guarda el cambio, **entonces** el nuevo valor aplica a todos los recordatorios pendientes.

#### Notas Técnicas
- Implementar **como** job programado (cron/scheduler). Verificar estado del turno justo antes de enviar. El tiempo de anticipación debe ser configurable por el médico.

#### Requisitos Funcionales
- (funcionalidad implícita en el alcance del sistema, sin RF asignado en la tabla actual)

#### Reglas de Negocio
- [RN-007] Los recordatorios solo se envían a turnos en estado Confirmado.

#### Archivos Adjuntos
- "HU-015 - Wireframe - Configuración de Recordatorio.pdf"

#### **[HU-016] - Validar pago por WhatsApp**
#### Descripción
**Como** paciente,  
**quiero** poder informar mi pago respondiendo el mensaje de WhatsApp,  
**para** completar la confirmación de mi turno.

**Épica:** [EP-05] Comunicación Automatizada  
**Prioridad:** Should  
**Estimación:** L

#### Criterios de Aceptación
1. **Dado** que confirmé asistencia y el turno requiere pago, **cuando** el agente me solicita confirmación de pago y respondo afirmativamente, **entonces** el turno pasa al estado Confirmado.
2. **Dado** que el paciente tiene obra social u otro convenio que exime el pago, **cuando** el agente evalúa el flujo, **entonces** el paso de validación de pago se omite y el turno pasa directamente a Confirmado tras la confirmación de asistencia.
3. **Dado** que el paciente no confirma el pago en el plazo configurado, **cuando** vence el plazo, **entonces** el turno permanece en estado intermedio y se notifica al panel del médico.

#### Notas Técnicas
- La lógica de "requiere pago" debe ser configurable por paciente o tipo de turno. El agente no valida comprobantes; solo registra la confirmación verbal del paciente.

#### Requisitos Funcionales
[RF02.1] Crear turno

#### Reglas de Negocio
- [RN-001] Un turno pasa a Confirmado solo cuando hay confirmación de asistencia y pago (si aplica).

#### Archivos Adjuntos
- "HU-016 - Wireframe - Flujo Conversación WhatsApp Pago.pdf"

#### **[HU-017] - Iniciar sesión en el sistema**
#### Descripción
**Como** médico o personal administrativo,  
**quiero** iniciar sesión con mis credenciales,  
**para** acceder al sistema de forma segura.

**Épica:** [EP-06] Autenticación y Control de Acceso  
**Prioridad:** Must  
**Estimación:** M

#### Criterios de Aceptación
1. **Dado** que ingreso usuario y contraseña válidos, **cuando** envío el formulario, **entonces** el sistema me autentica y me redirige al panel principal según mi rol.
2. **Dado** que ingreso credenciales incorrectas, **cuando** envío el formulario, **entonces** el sistema muestra "Usuario o contraseña incorrectos" sin indicar cuál campo falló.
3. **Dado** que permanezco inactivo durante el período configurado, **cuando** el sistema detecta la inactividad, **entonces** cierra la sesión automáticamente y me redirige al login.

#### Notas Técnicas
- Usar JWT o sesión con cookie segura (HttpOnly, Secure). Implementar rate limiting en el endpoint de login para prevenir ataques de fuerza bruta.

#### Requisitos Funcionales
- (requisito implícito de seguridad, sin RF asignado en la tabla actual)

#### Reglas de Negocio
- (ninguna aplica específicamente)

#### Archivos Adjuntos
- "HU-017 - Wireframe - Pantalla de Login.pdf"

#### **[HU-018] - Acceso diferenciado por rol**
#### Descripción
**Como** médico,  
**quiero** que el personal administrativo no pueda acceder al historial clínico ni a la configuración del sistema,  
**para** proteger la privacidad de los datos médicos.

**Épica:** [EP-06] Autenticación y Control de Acceso  
**Prioridad:** Must  
**Estimación:** M

Criterios de Aceptación:
1. **Dado** que inicio sesión como médico, **cuando** navego por el sistema, **entonces** tengo acceso completo a pacientes (con historial), turnos, agenda, configuración y comunicación.
2. **Dado** que inicio sesión como personal administrativo, **cuando** navego, **entonces** puedo acceder a pacientes (sin historial clínico), turnos y agenda; las secciones restringidas no aparecen en el menú.
3. **Dado** que soy personal administrativo e intento acceder directamente a una URL restringida (ej. historial clínico), **cuando** el sistema evalúa mi rol, **entonces** recibo un error 403 "Acceso no autorizado".

#### Notas Técnicas
- Implementar control de acceso basado en roles (RBAC) tanto en frontend (ocultar secciones) como en backend (validar permisos por endpoint). El frontend solo oculta; el backend debe rechazar con 403.

#### Requisitos Funcionales
- (requisito implícito de seguridad, sin RF asignado en la tabla actual)

#### Reglas de Negocio
- [RN-006] Solo el médico puede acceder al historial clínico de los pacientes.

#### Archivos Adjuntos
- "HU-018 - Wireframe - Panel Médico vs Panel Administrativo.pdf"

## 3.3 Division de Historias

 En esta sección, desglosamos aquellas historias que merecen ser abarcadas con un nivel mayor de detalle. Al inicio de cada una, reescribimos la  historia de usuario original para mayor entendimiento del caso.

 ### **[HU-006a] - Crear turno para un paciente**
 #### Descripción
 **Como** personal administrativo,  
 **quiero** crear un turno para un paciente seleccionando un bloque horario disponible,  
 **para** agendar su consulta en el sistema.

 Se desglosa al requerir lógica de calendario y persistencia.
 #### [HU-006.1] - Visualizar bloques disponibles
Épica: [EP-02] Gestión de Turnos

 Prioridad: Must | Estimación: M

 Descripción: Como administrativo, quiero ver solo los huecos libres del médico, para no ofrecer horarios ocupados.

 Criterios de Aceptación:

 Dado que el médico configuró su agenda, cuando busco una fecha, entonces solo se muestran bloques que coinciden con su horario de atención y no  tienen turnos asignados.

 #### [HU-006.2] - Reservar y persistir turno
 Épica: [EP-02] Gestión de Turnos

 Prioridad: Must | Estimación: S

 Descripción: Como administrativo, quiero guardar la reserva, para que el bloque quede bloqueado en el sistema.
 #### Nota
    Al utilizar una transacción de Base de Datos podemos evitar que dos personas elijan el mismo bloque al mismo tiempo.

 ### **[HU-016] - Validar pago por WhatsApp**
 #### Descripción
 **Como** paciente,  
 **quiero** poder informar mi pago respondiendo el mensaje de WhatsApp,  
 **para** completar la confirmación de mi turno.

 Se desglosa ya que la IA no puede verificar que el comprobar si la transferencia es o no real. Se separa la notificación de la validación humana.
 #### [HU-016.1] - Recepción de confirmación de pago
 Épica: [EP-05] Comunicación Automatizada
 
 Prioridad: Should | Estimación: M
 
 Descripción: Como sistema, quiero registrar cuando el paciente dice que ya pagó por WhatsApp, para avisar al administrativo.
 #### [HU-016.2] - Validación administrativa de pago
 Épica: [EP-05] Comunicación Automatizada

 Prioridad: Should | Estimación: S
 
 Descripción: Como administrativo, quiero marcar un turno como "Pagado" tras revisar la cuenta bancaria, para que el turno pase a estado Confirmado.

 ### **[HU-018] - Acceso diferenciado por rol**
 #### Descripción
 **Como** médico,  
 **quiero** que el personal administrativo no pueda acceder al historial clínico ni a la configuración del sistema,  
 **para** proteger la privacidad de los datos médicos.

 Se desglosa para separar parte visual de parte seguridad (front y back por separado)
 #### [HU-018.1] - Restricción de Interfaz (Frontend)
 Épica: [EP-06] Autenticación y Control de Acceso

 Prioridad: Must | Estimación: S

 Descripción: Como administrativo, quiero que el botón de "Historial Clínico" no sea visible en mi panel, para evitar confusiones.

 #### [HU-018.2] - Seguridad de Endpoints (Backend)
 Épica: [EP-06] Autenticación y Control de Acceso

 Prioridad: Must | Estimación: M