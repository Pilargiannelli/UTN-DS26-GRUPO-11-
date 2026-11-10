## Diseño de API

### Operaciones por pantalla

Relevamiento hecho al diseñar la API, con los nombres de pantalla de ese momento. Los endpoints
vigentes están en la [tabla de endpoints](#tabla-de-endpoints).

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

Endpoints implementados en el backend (`backend/src/routes/`), todos bajo el prefijo `/api`.
Los que requieren sesión reciben el token en el header `Authorization: Bearer <token>`. Qué
rol puede usar cada uno está en la [matriz de permisos](../06%20-%20Seguridad/matriz-permisos.md).
Hay ejemplos de cada petición, con sus casos de error, en `backend/api.http`.

Códigos de error comunes a todas las rutas:

| Código | Cuándo |
|--------|--------|
| 400 | El body, el parámetro `:id` o la query no pasan la validación (Zod). La respuesta trae el detalle por campo |
| 401 | Falta el token, está vencido o mal firmado |
| 403 | El token es válido pero el rol no habilita la operación |
| 404 | El recurso no existe, o pertenece a otro usuario (así no se revela qué ids existen) |
| 409 | Choca con una regla de negocio o con un dato único (DNI, email, matrícula, horario ocupado) |

#### Salud

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/health` | Comprobar que la API responde (sirve para "despertar" el backend deployado antes de usarlo). No consulta la base | — | 200 | — |

#### Autenticación y cuenta

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| POST | `/api/auth/registro` | Crear cuenta de paciente ("Crear cuenta"). Crea el usuario y su ficha de paciente juntos | Datos del paciente + `password` (+ `username` opcional) | 201 | 400, 409 |
| POST | `/api/auth/login` | Iniciar sesión. Devuelve `{ token, usuario }` | `{ email, password }` | 200 | 400, 401, 429 |
| GET | `/api/auth/yo` | Datos del usuario logueado (se usa al recargar la página) | — | 200 | 401 |
| PATCH | `/api/auth/yo` | Corregir mi nombre, apellido y email (Mi cuenta) | `{ nombre, apellido, email }` | 200 | 400, 401, 409 |
| PATCH | `/api/auth/password` | Cambiar mi contraseña | `{ passwordActual, passwordNueva }` | 204 | 400, 401 |

- El login responde 429 después de 10 intentos fallidos en 15 minutos desde la misma IP.
- La contraseña nueva (registro y cambio) necesita al menos 8 caracteres, una mayúscula, una
  minúscula y un número.
- En `PATCH /api/auth/yo` y `PATCH /api/auth/password` el usuario sale del token: nadie puede
  modificar la cuenta de otro.

#### Catálogos

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/especialidades` | Listar especialidades (PedirTurno, alta de médico) | — | 200 | — |
| GET | `/api/obras-sociales` | Listar obras sociales (formularios de paciente) | — | 200 | — |
| POST | `/api/obras-sociales` | Agregar una obra social | `{ nombre }` | 201 | 400, 401, 403, 409 |

#### Usuarios, médicos y pacientes

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/usuarios` | Listar todos los usuarios | — | 200 | 401, 403 |
| GET | `/api/medicos` | Cartilla de médicos (nombre, especialidad, matrícula) | — | 200 | — |
| POST | `/api/medicos` | Dar de alta un médico | `{ nombre, apellido, dni, email, especialidad, matricula }` | 201 | 400, 401, 403, 409 |
| GET | `/api/pacientes` | Listar pacientes con su cobertura (al médico también le llega la fecha de la última consulta) | — | 200 | 401, 403 |
| GET | `/api/pacientes/:id` | Ver la ficha de un paciente | — | 200 | 400, 401, 403, 404 |
| POST | `/api/pacientes` | Dar de alta un paciente | Datos del paciente | 201 | 400, 401, 403, 409 |
| PUT | `/api/pacientes/:id` | Editar los datos del paciente y su obra social | Datos del paciente | 200 | 400, 401, 403, 404, 409 |

- **Datos del paciente:** `{ nombre, apellido, dni, email, telefono, sexo, fechaNacimiento, cobertura? }`,
  con `cobertura = { obraSocialId, nroAfiliado, plan }`. En el `PUT`, mandar el body sin
  `cobertura` significa "sin obra social".
- El médico y el paciente que da de alta la secretaria entran con su **email** y su **DNI**
  como contraseña inicial.
- La búsqueda por nombre o DNI se hace en el front, sobre el listado.

#### Turnos

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/turnos` | Listar turnos: la secretaria recibe todos, el médico los de su agenda y el paciente los suyos. Con esta lista el front arma la agenda diaria y semanal | — | 200 | 401 |
| GET | `/api/turnos/ocupados?medicoId=&desde=&hasta=` | Horarios ya tomados de un médico en un rango. Devuelve solo fechas, sin datos del paciente; el front calcula los horarios libres de PedirTurno | — | 200 | 400, 401 |
| GET | `/api/turnos/:id` | Ver el detalle de un turno | — | 200 | 400, 401, 404 |
| POST | `/api/turnos` | Crear un turno. El paciente manda solo `{ medicoId, fechaHora }` y el turno nace Pendiente; el personal manda además `pacienteId` y, si quiere, `estado` (Pendiente o Confirmado) | Ver operación | 201 | 400, 401, 403, 409 |
| PATCH | `/api/turnos/:id/cancelar` | Cancelar un turno. Pasa a Cancelado y queda en el historial | — | 200 | 400, 401, 404, 409 |
| PUT | `/api/turnos/:id` | Editar, confirmar o reprogramar. Es parcial: solo cambia lo que viene en el body | `{ fechaHora?, estado?, medicoId?, pacienteId? }` | 200 | 400, 401, 403, 404, 409 |
| DELETE | `/api/turnos/:id` | Borrar un turno | — | 204 | 400, 401, 403, 404 |

Reglas que valida la API:

- La fecha del turno es futura, de lunes a viernes, en punto o y media (400).
- Un médico no puede tener dos turnos activos (Pendiente, Confirmado o Reprogramado) en el mismo
  horario (409).
- Un turno que ya pasó no se cancela ni cambia de estado (409).
- El paciente solo cancela turnos Pendientes o Reprogramados; si ya está confirmado, recibe 409 y
  tiene que comunicarse con el consultorio.

#### Historia clínica

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
|--------|------|------------------------|------|-------|---------|
| GET | `/api/pacientes/:id/historia-clinica` | Ver la historia clínica: alergias, antecedentes y consultas, de la más nueva a la más vieja. Si el paciente todavía no tiene, devuelve listas vacías | — | 200 | 400, 401, 403, 404 |
| PUT | `/api/pacientes/:id/historia-clinica` | Editar alergias y antecedentes | `{ alergias: string[], antecedentes: string[] }` | 200 | 400, 401, 403, 404 |
| POST | `/api/pacientes/:id/historia-clinica/entradas` | Registrar una consulta | `{ diagnostico, evolucion, observaciones? }` | 201 | 400, 401, 403, 404 |

Las consultas no se editan ni se borran (Ley 26.529: la historia clínica es inalterable). Si
hubo un error, se registra una consulta nueva.

### Cambios respecto del diseño original

La primera versión de esta tabla se armó antes de programar. Estos endpoints del diseño
cambiaron o no se implementaron:

| Endpoint del diseño | Qué pasó |
|---------------------|----------|
| `POST /api/usuarios`, `GET` y `PUT /api/usuarios/:id` | El alta se hace en un solo paso: `/api/auth/registro`, `POST /api/pacientes` y `POST /api/medicos` crean el usuario y su ficha juntos. Los datos propios se leen con `GET /api/auth/yo` y se editan con `PATCH /api/auth/yo` |
| `PUT /api/usuarios/:id/password` | Reemplazado por `PATCH /api/auth/password`: el usuario sale del token |
| `GET /api/agenda?medicoId=&fecha=` y `&semana=` | La agenda diaria y semanal se arma en el front con `GET /api/turnos` |
| `GET /api/agenda/bloques-disponibles` | Reemplazado por `GET /api/turnos/ocupados`: el front calcula los horarios libres |
| `GET /api/pacientes/:id/historia-clinica/entradas` | Las consultas vienen dentro de `GET /api/pacientes/:id/historia-clinica` |
| `GET /api/pacientes?tieneHistoriaClinica=true` | No hizo falta: el listado de pacientes ya trae la fecha de la última consulta |
| `GET /api/medicos/:id`, `PUT /api/medicos/:id`, `DELETE /api/medicos/:id` | No implementados |
| `PUT /api/medicos/:id/bloqueos` | No implementado: la disponibilidad no se configura (turnos de lunes a viernes, cada 30 minutos) |
| `DELETE /api/pacientes/:id` | No implementado |
| `DELETE /api/turnos/:id` para cancelar | Cancelar es `PATCH /api/turnos/:id/cancelar`; `DELETE` borra el turno |
