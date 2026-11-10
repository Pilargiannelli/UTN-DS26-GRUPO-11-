# Matriz de permisos extendida — Autorización en el TP (tarjeta C20)

## 1. Propósito y alcance

Este documento amplía la [matriz de permisos](matriz-permisos.md) con la columna
**"Qué hace la UI"** que pide la tarjeta **[AG-C20] Autorización en el TP**: para cada
endpoint, qué pantalla o componente del frontend lo usa y cómo se protege del lado de la
interfaz.

La primera versión relevó el código al 24/09/2026, cuando varias pantallas todavía no estaban
conectadas a la API. Esta versión refleja el estado del repositorio para la entrega final
(noviembre 2026). Las brechas de aquel relevamiento y cómo se resolvió cada una están en la
sección 7.

La matriz base sigue siendo la fuente de verdad sobre qué rol puede llamar a cada endpoint; este
documento agrega el correlato de interfaz.

## 2. Roles reales del sistema

Los roles surgen del enum `Rol` de Prisma (`backend/src/generated/prisma/enums.ts`) y de su
espejo en el frontend, `RolUsuario` (`frontend/src/types/UsuarioSesion.ts`):

| Rol | Definido en | Uso en la UI |
|-----|-------------|--------------|
| Invitado | Ausencia de token. No es un valor del enum | Landing, login y "Crear cuenta" |
| `PACIENTE` | `Rol.PACIENTE` | Inicio del paciente, Mis turnos, Pedir turno, cartilla de profesionales, Mi cuenta |
| `SECRETARIA` | `Rol.SECRETARIA` | Gestión de turnos, Agenda de cada médico (elige el médico), Pacientes, Profesionales, alta de pacientes y médicos, alta de obras sociales |
| `MEDICO` | `Rol.MEDICO` | Gestión de sus turnos, su Agenda, Pacientes con la ficha clínica (historia clínica y consultas) |

El rol se obtiene del token JWT decodificado (`TokenPayload.rol`, en
[auth.middleware.ts](../../backend/src/middlewares/auth.middleware.ts)) y se expone en el
frontend a través de `AuthContext` como `usuario.rol`, con el helper `tieneRol(rol)`
([AuthContext.tsx](../../frontend/src/context/AuthContext.tsx)).

## 3. Mecanismo de autorización implementado

### Backend

- `authenticate` ([auth.middleware.ts](../../backend/src/middlewares/auth.middleware.ts)):
  valida el JWT del header `Authorization: Bearer`. Sin token → 401. Token vencido o mal firmado
  → 401.
- `authorize(...roles)`: se aplica después de `authenticate`; compara el rol del token contra la
  lista de roles permitidos. Rol no habilitado → 403.
- La verificación de "recurso propio" (por ejemplo, que un paciente sólo vea sus propios turnos)
  se resuelve en la capa de servicios, no en un middleware, según lo documentado en la sección 11
  de `matriz-permisos.md`. Un recurso ajeno responde 404.

### Frontend

- `AuthContext` + `useAuth()` ([AuthContext.tsx](../../frontend/src/context/AuthContext.tsx),
  [useAuth.ts](../../frontend/src/hooks/useAuth.ts)): al montar la app, rehidrata la sesión
  llamando a `GET /api/auth/yo` con el token guardado en `localStorage`. Si el endpoint responde
  con error (token vencido o inválido), se ejecuta `logout()` y la sesión se limpia.
- `PrivateRoute` ([PrivateRoute.tsx](../../frontend/src/components/PrivateRoute.tsx)): componente
  de ruta que resuelve, en orden, 1) si todavía se está rehidratando la sesión (spinner), 2) si
  no hay usuario autenticado → redirige a `/login` (equivalente visual del 401), 3) si se exige
  un conjunto de roles y el usuario no tiene ninguno → redirige a `/no-autorizado` (equivalente
  visual del 403).
- `NoAutorizado` ([NoAutorizado.tsx](../../frontend/src/pages/NoAutorizado.tsx)): página que se
  muestra ante un 403 de ruta.
- Menú por rol ([menuPorRol.ts](../../frontend/src/components/Layout/menuPorRol.ts)): cada rol ve
  solo los links a rutas que tiene permitidas.
- Cierre de sesión ante token vencido: `api.ts` dispara un evento `sesion-expirada` cuando una
  respuesta del backend es 401 y había token guardado; `AuthContext` escucha ese evento y llama a
  `logout()`.

### Rutas del frontend por rol (`App.tsx`)

| Protección | Rutas |
|------------|-------|
| Públicas | `/` (Landing), `/login`, `/crear-cuenta`, `/no-autorizado` |
| Cualquier usuario logueado | `/home`, `/buscar-medico`, `/ver-perfil`, `/mi-cuenta`, `/mis-turnos`, `/turnos/:id`, `/turnos/:id/cancelar`, `/pedir-turno` |
| `SECRETARIA` | `/registrar-paciente`, `/registrar-medico` |
| `SECRETARIA` o `MEDICO` | `/buscar-paciente`, `/pacientes/:id`, `/gestion-turnos`, `/orden-del-dia` (Agenda) |
| `MEDICO` | `/pacientes/:id/historial`, `/pacientes/:id/turnos` |

## 4. Convenciones de lectura

| Símbolo | Significado |
|---------|-------------|
| ✅ | Operación permitida por el backend (`authorize` habilita el rol) |
| ✅ propio | Permitida sólo sobre el recurso propio, verificado en el servicio |
| 401 | Backend responde 401: no autenticado |
| 403 | Backend responde 403: autenticado sin el rol requerido |

## 5. Matriz extendida por dominio

### 5.1 Autenticación y cuenta

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| POST | `/api/auth/registro` | ✅ | ✅ | ✅ | ✅ | `/crear-cuenta` → `AutoregistroPaciente` (`RegistroPacienteForm` en modo autorregistro) | Formulario de alta pública. El usuario creado siempre nace con rol `PACIENTE` (el form no envía rol y el back lo descartaría) |
| POST | `/api/auth/login` | ✅ | ✅ | ✅ | ✅ | `/login` → `Login.tsx` | Formulario de login; guarda el token y el usuario devuelto en `AuthContext` |
| GET | `/api/auth/yo` | 401 | ✅ propio | ✅ propio | ✅ propio | `AuthContext`, al montar la app | Rehidratación de sesión: reconstruye `usuario` a partir del token guardado, sin pedirle credenciales de nuevo |
| PATCH | `/api/auth/yo` | 401 | ✅ propio | ✅ propio | ✅ propio | `/mi-cuenta` → `DatosCuentaForm` | Cada usuario corrige su nombre, apellido y email |
| PATCH | `/api/auth/password` | 401 | ✅ propio | ✅ propio | ✅ propio | `/mi-cuenta` → `CambiarPasswordForm` | Cambio de contraseña propia, con la contraseña actual |

### 5.2 Pacientes, médicos y usuarios

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| GET | `/api/medicos` | ✅ | ✅ | ✅ | ✅ | `/buscar-medico` → `ListarUsuarios`; también `PedirTurno`, `NuevoTurnoModal`, la Agenda de la secretaria (selector de médico) y `TurnosPaciente` | Cartilla de profesionales. Al paciente le muestra el botón "Pedir turno" en cada médico; a la secretaria, el alta de médico |
| POST | `/api/medicos` | 401 | 403 | ✅ | 403 | `/registrar-medico` (`PrivateRoute roles=["SECRETARIA"]`) → `RegistroMedicoForm` | Alta de médico por la secretaria. El botón de alta en la cartilla solo se muestra con `tieneRol("SECRETARIA")` |
| GET | `/api/pacientes` | 401 | 403 | ✅ | ✅ | `/buscar-paciente` (`PrivateRoute roles=["SECRETARIA","MEDICO"]`) → `BuscarPaciente` + `ListarUsuarios`; también `NuevoTurnoModal` y `TurnosDeHoy` | Listado interno de pacientes. Al médico le muestra la última consulta y el acceso a la historia clínica. `BuscarPaciente` repite el control: si `tieneRol("PACIENTE")` muestra un mensaje de acceso denegado |
| GET | `/api/pacientes/:id` | 401 | 403 | ✅ | ✅ | `/pacientes/:id` → `FichaPaciente`; `/pacientes/:id/turnos` → `TurnosPaciente` | Ficha del paciente: el médico ve el panel clínico (`PanelPacienteMedico`); la secretaria, los datos para administrar |
| POST | `/api/pacientes` | 401 | 403 | ✅ | 403 | `/registrar-paciente` (`PrivateRoute roles=["SECRETARIA"]`) → `RegistroPacienteForm` | Alta de paciente por la secretaria (HU-001). El botón de alta solo se muestra con `tieneRol("SECRETARIA")` |
| PUT | `/api/pacientes/:id` | 401 | ✅ propio | ✅ | ✅ | Ficha y perfil del paciente → `PacienteFormFields` | Edición de datos y obra social. La secretaria edita la ficha de cualquier paciente; el paciente, solo la suya |
| GET | `/api/usuarios` | 401 | 403 | ✅ | ✅ | Ninguna pantalla lo usa | Sin UI asociada |

### 5.3 Turnos

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| GET | `/api/turnos` | 401 | ✅ propio | ✅ | ✅ propio | `/mis-turnos` y el Inicio del paciente (`useTurnosPaciente`); `/home`, `/gestion-turnos` y la Agenda (`useTurnosMedico`, `GestionTurnos`) | El back filtra por identidad (sección 8 de la matriz base); la UI no vuelve a filtrar por permisos. La Agenda de la secretaria filtra por el médico elegido |
| GET | `/api/turnos/ocupados` | 401 | ✅ | ✅ | ✅ | `/pedir-turno` (`useDisponibilidad`) | Con los horarios tomados, `PedirTurno` muestra solo los horarios libres del médico |
| GET | `/api/turnos/:id` | 401 | ✅ propio | ✅ | ✅ propio | `/turnos/:id` → `DetalleTurno`; `/turnos/:id/cancelar` → `CancelarTurno` | Detalle del turno, con su estado y, si ya fue atendido, lo que indicó el médico. Un turno ajeno da 404 y la pantalla lo informa |
| POST | `/api/turnos` | 401 | ✅ | ✅ | ✅ | `/pedir-turno` → `PedirTurno` (paciente); `NuevoTurnoModal` dentro de Gestión de turnos y de la ficha (personal) | El paciente elige especialidad, médico y horario; el turno nace Pendiente. El personal elige también el paciente |
| PATCH | `/api/turnos/:id/cancelar` | 401 | ✅ propio | ✅ | ✅ propio | `CancelarTurno` (paciente); `TurnosTable` (personal) | Cancela el turno (queda en el historial). Al paciente solo le ofrece cancelar si el turno está Pendiente o Reprogramado y no pasó |
| PUT | `/api/turnos/:id` | 401 | 403 | ✅ | ✅ propio | `TurnosTable` dentro de Gestión de turnos | Confirmar un turno pendiente. Las acciones solo se muestran a `SECRETARIA` y `MEDICO`. La UI no tiene pantalla de reprogramación: el endpoint la admite cambiando `fechaHora` |
| DELETE | `/api/turnos/:id` | 401 | 403 | ✅ | ✅ propio | Ninguna pantalla lo usa | La UI cancela en lugar de borrar, para conservar el historial |

### 5.4 Historia clínica

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| GET | `/api/pacientes/:id/historia-clinica` | 401 | ✅ propio | 403 | ✅ | Médico: `/pacientes/:id` (`PanelPacienteMedico`) y `/pacientes/:id/historial` (`HistorialConsultas`). Paciente: Inicio, Mis turnos e historial (`useMiHistoria`) | El médico ve alergias, antecedentes y consultas. El paciente ve las indicaciones de cada consulta junto al turno en que se atendió |
| PUT | `/api/pacientes/:id/historia-clinica` | 401 | 403 | 403 | ✅ | `/pacientes/:id` → `ListaEditable` (alergias y antecedentes) | Edición de alergias y antecedentes, solo en el panel del médico |
| POST | `/api/pacientes/:id/historia-clinica/entradas` | 401 | 403 | 403 | ✅ | `/pacientes/:id` → `NuevaEntradaForm` | "Registrar consulta". Las consultas guardadas no tienen botón de editar ni borrar |

### 5.5 Catálogos

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| GET | `/api/especialidades` | ✅ | ✅ | ✅ | ✅ | `PedirTurno` (paso 1), alta de médico | Catálogo público, usado para elegir especialidad |
| GET | `/api/obras-sociales` | ✅ | ✅ | ✅ | ✅ | `RegistroPacienteForm`, `PacienteFormFields` | Catálogo público, usado para elegir obra social (también en "Crear cuenta") |
| POST | `/api/obras-sociales` | 401 | 403 | ✅ | 403 | `AgregarObraSocial`, dentro de los formularios de paciente | Agregar una obra social sin salir del formulario. Solo se muestra con `tieneRol("SECRETARIA")` y nunca en el autorregistro |

## 6. Renderizado condicional relevado en el código

| Dónde | Condición | Qué oculta/muestra |
|-------|-----------|---------------------|
| `menuPorRol.ts` + `Header.tsx` | rol del usuario | El menú de cada rol (sección 2). Cada link apunta a una ruta que ese rol tiene permitida |
| `Home.tsx` (`useRolView`) | rol del usuario | `GestionTurnos` para `SECRETARIA`/`MEDICO`, `HomePaciente` para `PACIENTE` |
| `OrdenDelDia.tsx` | `tieneRol("SECRETARIA")` | La secretaria elige el médico cuya agenda quiere ver; el médico ve la suya |
| `ListarUsuarios.tsx` | rol del usuario | Médico: columna "Última consulta" y acceso a la historia clínica. Paciente: botón "Pedir turno" en la cartilla. Secretaria: altas |
| `FichaPaciente.tsx` | `tieneRol("MEDICO")` | Panel clínico para el médico; vista administrativa para la secretaria |
| `VerUsuario.tsx` | rol y si es el perfil propio | Edición de datos (secretaria o el propio paciente), turnos del paciente (personal) e historia clínica (médico o el propio paciente) |
| `PacienteFormFields.tsx`, `RegistroPacienteForm.tsx` | `tieneRol("SECRETARIA")` | Botón para agregar una obra social |
| `TurnosTable.tsx` | `tieneRol("SECRETARIA")` o `tieneRol("MEDICO")` | Crear, confirmar y cancelar turnos |
| `BuscarPaciente.tsx` | `tieneRol("PACIENTE")` | Mensaje de acceso denegado (defensa adicional a la de `PrivateRoute`) |
| `Landing.tsx` | sesión iniciada como `PACIENTE` | Acceso directo a pedir turno |

## 7. Brechas relevadas el 24/09 y su estado

| Brecha del relevamiento anterior | Estado |
|----------------------------------|--------|
| `POST /api/pacientes`, `POST /api/medicos` y `POST /api/usuarios` llamados desde formularios sin endpoint | Resuelto. Existen `POST /api/pacientes` y `POST /api/medicos` (solo `SECRETARIA`). `POST /api/usuarios` se descartó: el alta crea el usuario y su ficha juntos |
| `CambiarPassword`, edición de `VerUsuario`, `DetalleTurno` y `CancelarTurno` sin conectar a la API | Resuelto. Usan `PATCH /api/auth/password`, `PATCH /api/auth/yo`, `PUT /api/pacientes/:id`, `GET /api/turnos/:id` y `PATCH /api/turnos/:id/cancelar` |
| `/pedir-turno` accesible al paciente, pero el back rechazaba su turno con 403 | Resuelto. El paciente puede pedir turnos: manda `medicoId` y `fechaHora`, y el `pacienteId` sale del token |
| Link "+ Nueva Obra Social" sin ruta declarada | Resuelto. El alta se hace con `AgregarObraSocial` dentro de los formularios de paciente, visible solo para la secretaria |
| Sidebar del Header roto por claves de rol inconsistentes | Resuelto. El menú sale de `menuPorRol.ts`, indexado por el valor real del rol |
| `DELETE /api/turnos/:id` impedía al paciente cancelar su turno | Resuelto. Cancelar es `PATCH /api/turnos/:id/cancelar`, habilitado para el paciente sobre sus turnos |

Observaciones que quedan:

- `GET /api/usuarios` y `DELETE /api/turnos/:id` existen en el backend pero ninguna pantalla los
  usa.
- `EditorTags.tsx` usa `useRolView` con la clave `medico` en minúscula, que no coincide con el
  valor real del rol (`MEDICO`). Por eso el botón "Editar" de alergias y antecedentes de
  `HistorialMedicoCard` no se muestra. No es un problema de autorización (nadie ve algo que no
  debería) y el médico edita alergias y antecedentes desde su panel (`ListaEditable`).
- `/buscar-medico` pide sesión iniciada, aunque `GET /api/medicos` es público.
