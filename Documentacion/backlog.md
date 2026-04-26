# Proyecto IMOS - Backlog

## Fase 1: Preparación y Análisis Inicial

### 1.1 Alcance, módulos y límites
(Responsable: Castellani Martina)

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
(Responsable: Basoalto Ezequiel)

### 2.2 Requisitos funcionales
(Responsable: Román Augusto)

### 2.3 Reglas de negocio
(Responsable: Terruli Tomás)

### 2.4 Modelos Complementarios
(Responsable: Figueroa Rodrigo)
