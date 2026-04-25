# Fase 1: Preparación y Análisis Inicial — Proyecto AMI

## 1. Definición del Sistema

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