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
