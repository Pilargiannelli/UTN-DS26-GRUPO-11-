# Proyecto IMOS - Backlog

## Fase 1: Preparación y Análisis Inicial

### 1.1 Alcance, módulos y límites
(Responsable: Castellani Martina)

### 1.2 Glosario de términos
(Responsable: Giannelli Pilar)

------------------------------------------

## Fase 2: Modelado de Dominio

### 2.1 Modelo de dominio
(Responsable: Basoalto Ezequiel)

### 2.2 Requisitos funcionales
(Responsable: Román Augusto)

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
