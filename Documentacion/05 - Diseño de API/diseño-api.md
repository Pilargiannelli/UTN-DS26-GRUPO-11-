## Diseño de API

### Operaciones por pantalla

#### Autenticación y cuenta

| Pantalla | Recurso | Entidad |
|----------|---------|---------|
| Login | Autenticar usuario (usuario/email + contraseña) | Usuario |
| RegistroPaciente | Cargar datos personales del paciente (paso 1 de alta) | Paciente |
| RegistroDeMédico | Cargar datos personales del médico (paso 1 de alta) | Medico |
| RegistroUsuario | Crear usuario y contraseña (paso 2 de alta) | Usuario |
| CambiarPassword / CambioPassword | Cambiar contraseña | Usuario |

#### Gestión de pacientes

| Pantalla | Recurso | Entidad |
|----------|---------|---------|
| BuscarPaciente | Listar pacientes | Paciente |
| BuscarPaciente | Buscar / filtrar paciente por nombre | Paciente |
| BuscarPaciente | Registrar nuevo paciente | Paciente |
| VerUsuario (rol paciente) | Ver perfil del paciente | Paciente |
| VerUsuario (rol paciente, admin) | Editar datos del paciente | Paciente |

#### Gestión de médicos

| Pantalla | Recurso | Entidad |
|----------|---------|---------|
| BuscarMédico | Listar médicos | Medico |
| BuscarMédico | Buscar / filtrar médico por nombre | Medico |
| BuscarMédico | Registrar nuevo médico | Medico |
| VerUsuario (rol médico) | Ver perfil del médico | Medico |
| VerUsuario (rol médico, admin) | Editar datos del médico | Medico |

#### Gestión de turnos (Secretaría)

| Pantalla | Recurso | Entidad |
|----------|---------|---------|
| GestionTurnos | Listar turnos | Turno |
| GestionTurnos | Ver contadores (total, pendientes, confirmados, cancelados) | Turno |
| GestionTurnos | Crear turno | Turno |
| GestionTurnos | Editar turno | Turno |
| GestionTurnos | Reprogramar turno | Turno |
| GestionTurnos | Cancelar turno | Turno |
| Home (admin / médico) | Ver lista de turnos reservados | Turno |
| Home (admin / médico) | Ver contador de turnos del día | Turno |

#### Agenda del médico

| Pantalla | Recurso | Entidad |
|----------|---------|---------|
| OrdenDelDia | Ver agenda diaria de turnos | Turno |
| OrdenDelDia | Ver agenda semanal de turnos | Turno |
| OrdenDelDia | Navegar entre día/semana (anterior, siguiente, hoy) | Agenda |

#### Turnos del paciente

| Pantalla | Recurso | Entidad |
|----------|---------|---------|
| MisTurnos | Listar mis turnos (próximos y pasados) | Turno |
| DetalleTurno | Ver detalle de un turno | Turno |
| PedirTurno | Elegir especialidad | Medico |
| PedirTurno | Elegir médico disponible por especialidad | Medico |
| PedirTurno | Elegir fecha y horario disponible | Agenda |
| PedirTurno | Crear turno (solicitar consulta) | Turno |
| CancelarTurno | Cancelar turno | Turno |

#### Historia clínica

| Pantalla | Recurso | Entidad |
|----------|---------|---------|
| HistorialClinico | Listar pacientes con historia clínica | HistoriaClinica |
| HistorialClinico | Buscar paciente por usuario | Paciente |
| HistorialClinico | Ver entradas clínicas de un paciente | EntradaClinica |
| VerUsuario / HistorialMedicoCard | Ver historial médico (consultas) | HistoriaClinica |
| VerUsuario / HistorialMedicoCard | Agregar nueva consulta (entrada clínica) | EntradaClinica |
| VerUsuario / HistorialMedicoCard | Editar alergias | HistoriaClinica |
| VerUsuario / HistorialMedicoCard | Editar antecedentes | HistoriaClinica |

#### Perfil

| Pantalla | Recurso | Entidad |
|----------|---------|---------|
| VerUsuario | Ver perfil propio / de otro usuario | Usuario |
| CambiarPassword | Cambiar mi contraseña | Usuario |

### Tabla de endpoints

#### Usuario / Autenticación

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| POST | `/api/auth/login` | Autenticar usuario (usuario/email + contraseña) | `{ usuario, contraseña }` | 200 | 401, 400 |
| POST | `/api/usuarios` | Crear usuario y contraseña (paso 2 de alta) | Usuario sin id | 201 | 400, 409 |
| GET | `/api/usuarios/:id` | Ver perfil propio / de otro usuario | — | 200 | 404 |
| PUT | `/api/usuarios/:id` | Editar datos del usuario | Usuario sin contraseña | 200 | 404, 400 |
| PUT | `/api/usuarios/:id/password` | Cambiar mi contraseña | `{ passwordActual, passwordNueva }` | 200 | 404, 400, 401 |

#### Paciente

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/pacientes` | Listar pacientes / Buscar-filtrar por nombre (`?nombre=`) | — | 200 | 500 |
| GET | `/api/pacientes/:id` | Ver perfil del paciente | — | 200 | 404 |
| POST | `/api/pacientes` | Registrar nuevo paciente | Paciente sin id | 201 | 400, 409 |
| PUT | `/api/pacientes/:id` | Editar datos del paciente (DNI no editable) | Paciente sin DNI | 200 | 404, 400 |
| DELETE | `/api/pacientes/:id` | Dar de baja un paciente | — | 204 | 404 |

#### Medico

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/medicos` | Listar médicos / Buscar-filtrar por nombre o especialidad | — | 200 | 500 |
| GET | `/api/medicos/:id` | Ver perfil del médico | — | 200 | 404 |
| POST | `/api/medicos` | Registrar nuevo médico | Medico sin id | 201 | 400, 409 |
| PUT | `/api/medicos/:id` | Editar datos / Configurar días, horario y duración de turno | Medico (datos + disponibilidad) | 200 | 404, 400 |
| DELETE | `/api/medicos/:id` | Dar de baja un médico | — | 204 | 404 |
| PUT | `/api/medicos/:id/bloqueos` | Bloquear franjas horarias (vacaciones, licencias, congresos) | `{ desde, hasta, motivo }` | 200 | 404, 400 |

#### Turno

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/turnos` | Listar turnos / Ver contadores (total, pendientes, confirmados, cancelados) / Mis turnos | — | 200 | 500 |
| GET | `/api/turnos/:id` | Ver detalle de un turno | — | 200 | 404 |
| POST | `/api/turnos` | Crear turno (solicitar consulta) | Turno sin id | 201 | 400 |
| PUT | `/api/turnos/:id` | Editar / Reprogramar turno | Turno (fecha, hora, estado) | 200 | 404, 400 |
| DELETE | `/api/turnos/:id` | Cancelar turno | — | 204 | 404 |

#### Agenda

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/agenda?medicoId=:id&fecha=YYYY-MM-DD` | Ver agenda diaria del médico / navegar día anterior-siguiente-hoy | — | 200 | 404 |
| GET | `/api/agenda?medicoId=:id&semana=YYYY-MM-DD` | Ver agenda semanal del médico | — | 200 | 404 |
| GET | `/api/agenda/bloques-disponibles?medicoId=:id&fecha=YYYY-MM-DD` | Elegir fecha y horario disponible (PedirTurno) | — | 200 | 404 |

*Nota: Agenda no tiene alta/baja propia — su disponibilidad se configura desde `PUT /api/medicos/:id` (tabla de Medico).*

#### HistoriaClinica / EntradaClinica

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/pacientes?tieneHistoriaClinica=true` | Listar pacientes con historia clínica | — | 200 | 500 |
| GET | `/api/pacientes/:id/historia-clinica` | Ver historial médico (alergias, antecedentes, resumen) | — | 200 | 404 |
| PUT | `/api/pacientes/:id/historia-clinica` | Editar alergias / Editar antecedentes | `{ alergias, antecedentes }` | 200 | 404, 400 |
| GET | `/api/pacientes/:id/historia-clinica/entradas` | Ver entradas clínicas de un paciente (consultas) | — | 200 | 404 |
| POST | `/api/pacientes/:id/historia-clinica/entradas` | Agregar nueva consulta (entrada clínica) | EntradaClinica sin id | 201 | 400, 404 |
