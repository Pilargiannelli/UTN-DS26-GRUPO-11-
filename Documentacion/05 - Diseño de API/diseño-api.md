## Fase 3: Diseño de API

### 3.1 Verificación del modelo de dominio

Se recorrió el frontend pantalla por pantalla contrastando los datos que efectivamente se usan contra las entidades y atributos definidos en **"02 - Modelado de Dominio"**. La mayoría de las entidades coinciden (`Usuario`, `Paciente`, `Medico`, `Secretaria`, `Turno`, `Agenda`, `HistoriaClinica`, `EntradaClinica`), pero aparecieron atributos que el front ya usa y que todavía no estaban modelados:

| Entidad | Atributos usados en el front y faltantes en el modelo |
|---------|----------------------------------------------------|
| `Paciente` | `sexo`, `direccion`, `ciudad`, `obraSocial`, `plan` (el modelo solo tenía `fechaDeNacimiento`, `nroAfiliado`, `telefono`) |
| `Usuario` | `username` (usado como login/handle, además de `email`), `foto` (avatar de perfil) |
| `Turno` | `especialidad` y `obraSocial` como datos de conveniencia mostrados en las tablas de turnos (se derivan de `Medico`/`Paciente`, pero el front los maneja como campos planos del turno) |

**Ajuste propuesto:** sumar esos atributos a `Paciente` y `Usuario` en el diagrama de clases, y dejar aclarado en `Turno` que `especialidad`/`obraSocial` son datos desnormalizados para listado, no atributos propios del dominio.

### 3.2 Operaciones por pantalla

Se recorrió la app pantalla por pantalla anotando qué operación necesita hacer con los datos y sobre qué entidad del modelo actúa.

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
