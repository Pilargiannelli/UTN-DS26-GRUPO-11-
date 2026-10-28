# Matriz de permisos extendida — Autorización en el TP (tarjeta C20)

## 1. Propósito y alcance

Este documento amplía la [matriz de permisos](matriz-permisos.md) original —que fue redactada
como diseño previo a la implementación y cubre la visión completa del TP— con la columna
**"Qué hace la UI"** que pide la tarjeta **[AG-C20] Autorización en el TP**.

A diferencia del documento base, este releva **lo efectivamente implementado** en el código a
la fecha (24/09/2026): qué endpoints existen realmente en `backend/src/routes`, qué middlewares
aplican en cada uno, y qué pantalla o componente del frontend consume cada operación. Donde la
UI llama a un endpoint que todavía no existe en el backend, o a una pantalla que no está cableada
a la API, se deja constancia explícita con los símbolos "—" y "⚠️" (ver sección 4) en lugar de
documentar un permiso que no se puede verificar.

No reemplaza a `matriz-permisos.md`: ese documento sigue siendo la fuente de verdad sobre el
diseño de permisos previsto para todo el TP (incluye recursos como Historia Clínica o Agenda que
otros equipos todavía no implementaron). Este documento es la fuente de verdad sobre **qué hay
hoy en el repositorio**, con su correlato de interfaz.

## 2. Roles reales del sistema

Los roles surgen del enum `Rol` de Prisma (`backend/src/generated/prisma/enums.ts`) y de su
espejo en el frontend, `RolUsuario` (`frontend/src/types/UsuarioSesion.ts:2`):

| Rol | Definido en | Uso en la UI |
|-----|-------------|--------------|
| Invitado | Ausencia de token. No es un valor del enum | Ve el login, la cartilla de médicos y el autorregistro |
| `PACIENTE` | `Rol.PACIENTE` | Vista de paciente en Home (`HomePaciente`), sidebar reducido, "Mis turnos" |
| `SECRETARIA` | `Rol.SECRETARIA` | Sidebar administrativo, gestión de turnos y pacientes |
| `MEDICO` | `Rol.MEDICO` | Igual que SECRETARIA + Historial clínico, Orden del día, alta de médicos |

El rol se obtiene del token JWT decodificado (`TokenPayload.rol`,
[auth.middleware.ts:6-9](../../backend/src/middlewares/auth.middleware.ts)) y se expone en el
frontend a través de `AuthContext` como `usuario.rol`, con el helper `tieneRol(rol)`
([AuthContext.tsx:41-43](../../frontend/src/context/AuthContext.tsx)).

## 3. Mecanismo de autorización implementado

### Backend

- `authenticate` ([auth.middleware.ts:19-33](../../backend/src/middlewares/auth.middleware.ts)):
  valida el JWT del header `Authorization: Bearer`. Sin token → 401. Token vencido o mal firmado
  → 401.
- `authorize(...roles)` ([auth.middleware.ts:35-49](../../backend/src/middlewares/auth.middleware.ts)):
  se aplica después de `authenticate`; compara el rol del token contra la lista de roles
  permitidos. Rol no habilitado → 403.
- La verificación de "recurso propio" (por ejemplo, que un paciente sólo vea sus propios turnos)
  se resuelve en la capa de servicios, no en un middleware, según lo documentado en la sección 11
  de `matriz-permisos.md`.

### Frontend

- `AuthContext` + `useAuth()` ([AuthContext.tsx](../../frontend/src/context/AuthContext.tsx),
  [useAuth.ts](../../frontend/src/hooks/useAuth.ts)): al montar la app, rehidrata la sesión
  llamando a `GET /api/auth/yo` con el token guardado en `localStorage`
  (`AuthContext.tsx:45-68`). Si el endpoint responde con error (token vencido o inválido), se
  ejecuta `logout()` y la sesión se limpia.
- `PrivateRoute` ([PrivateRoute.tsx](../../frontend/src/components/PrivateRoute.tsx)): componente
  de ruta que resuelve, en orden, 1) si todavía se está rehidratando la sesión (spinner), 2) si
  no hay usuario autenticado → redirige a `/` (equivalente visual del 401), 3) si se exige un
  conjunto de roles y el usuario no tiene ninguno → redirige a `/no-autorizado` (equivalente
  visual del 403).
- `NoAutorizado` ([NoAutorizado.tsx](../../frontend/src/pages/NoAutorizado.tsx)): página con
  estilo propio (`Alert` de Bootstrap) que se muestra ante un 403 de ruta.
- Cierre de sesión ante token vencido: `api.ts` dispara un evento `sesion-expirada` cuando una
  respuesta del backend es 401 y había token guardado; `AuthContext` escucha ese evento y llama a
  `logout()` (`AuthContext.tsx:70-86`).

## 4. Convenciones de lectura

| Símbolo | Significado |
|---------|-------------|
| ✅ | Operación permitida por el backend (`authorize` habilita el rol) |
| ✅ propio | Permitida sólo sobre el recurso propio, verificado en el servicio |
| 401 | Backend responde 401: no autenticado |
| 403 | Backend responde 403: autenticado sin el rol requerido |
| — | El backend no expone ese endpoint todavía; la celda no aplica |
| ⚠️ | La UI existe y llama al endpoint, pero el endpoint no está implementado en el backend (404) |

## 5. Matriz extendida por dominio

### 5.1 Autenticación

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| POST | `/api/auth/registro` | ✅ | ✅ | ✅ | ✅ | `/crear-cuenta` → `AutoregistroPaciente` | Formulario de alta pública. El usuario creado siempre nace con rol `PACIENTE` (no se envía el rol desde el form) |
| POST | `/api/auth/login` | ✅ | ✅ | ✅ | ✅ | `/` → `Login.tsx` (`apiFetch("/auth/login")`) | Formulario de login; guarda el token y el usuario devuelto en `AuthContext` |
| GET | `/api/auth/yo` | 401 | ✅ | ✅ | ✅ | Ningún componente lo invoca directamente: lo llama `AuthContext` al montar la app | Rehidratación de sesión: reconstruye `usuario` a partir del token guardado, sin pedirle credenciales de nuevo |

### 5.2 Usuarios / cartilla

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| GET | `/api/medicos` | ✅ | ✅ | ✅ | ✅ | `/buscar-medico` (pública) → `BuscarMedico` + `ListarUsuarios`; también consumida por `PedirTurno` y `RegistroMédicoForm` para poblar combos | Cartilla pública de médicos. `BuscarMedico` habilita el botón "Registrar nuevo médico" (`BotonAgregar`) sólo si `tieneRol("MEDICO")`, aunque el botón navega a una ruta protegida igual |
| GET | `/api/pacientes` | 401 | 403 | ✅ | ✅ | `/buscar-paciente` (`PrivateRoute roles=["SECRETARIA","MEDICO"]`) → `BuscarPaciente`; también reusado por `HistorialClinico` (`useHistorialMedico`) y por `NuevoTurnoModal` para elegir paciente | Listado interno de pacientes. `BuscarPaciente` además hace su propia verificación en el componente: si `tieneRol("PACIENTE")` muestra un mensaje de "no autorizado" en vez de la lista, aunque esa ruta ya está bloqueada a nivel `PrivateRoute` |
| GET | `/api/usuarios` | 401 | 403 | ✅ | ✅ | No hay pantalla que lo consuma actualmente | Sin UI asociada todavía |
| POST | `/api/pacientes` | 401 | 403 | ✅ | 403 | `RegistroPacienteForm` (dentro de `/registrar-paciente`, `PrivateRoute roles=["SECRETARIA"]`) llama `apiFetch("/pacientes", { method: "POST" })` | Alta de paciente por la secretaria (HU-001). El botón "+" de Pacientes solo se muestra con `tieneRol("SECRETARIA")`; el médico recibe 403 si llama a la API |
| POST | `/api/medicos` | — | — | — | — | `RegistroMédicoForm` (dentro de `/registrar-medico`, `PrivateRoute roles=["MEDICO"]`) llama `apiFetch("/medicos", { method: "POST" })` | ⚠️ Mismo caso: no hay `POST /api/medicos` implementado; el formulario existe y la ruta está protegida, pero el alta real todavía no funciona |
| POST | `/api/usuarios` | — | — | — | — | `UserForm` (dentro de `/registrar-usuario`, `PrivateRoute roles=["SECRETARIA","MEDICO"]`) llama `apiFetch("/usuarios", { method: "POST" })` con `rol: "PACIENTE"` fijo | ⚠️ Tampoco existe `POST /api/usuarios`; misma situación que los dos anteriores |
| PUT | `/api/usuarios/:id` | — | — | — | — | `VerUsuario.tsx` tiene un modo edición en la UI (`isEditing`), pero no llama a ningún endpoint | Sin conexión al backend: la edición de perfil es sólo visual por ahora |
| PUT | `/api/usuarios/:id/password` | — | — | — | — | `/cambiar-password` (`PrivateRoute`, cualquier rol) → `CambiarPassword.tsx` | La pantalla existe (ruta protegida por login) pero no dispara ningún `apiFetch`: es un formulario sin conectar |

### 5.3 Turnos

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| GET | `/api/turnos` | 401 | ✅ propio | ✅ | ✅ propio | `/mis-turnos` (`useTurnosPaciente`), `/home` → `GestionTurnos` (`useTurnosMedico` / listado general) | El back filtra por identidad (sección 8 de la matriz base); la UI no vuelve a filtrar, sólo pinta lo que recibe |
| GET | `/api/turnos/:id` | 401 | 403 | ✅ | ✅ | `/turnos/:id` → `DetalleTurno.tsx` | La ruta está protegida por `PrivateRoute` (cualquier rol logueado), pero el componente no llama a la API: hoy no funcionaría para un paciente igual, porque el backend le devolvería 403 |
| POST | `/api/turnos` | 401 | 403 | ✅ | ✅ | `/pedir-turno` (`PrivateRoute`, cualquier rol) → `PedirTurno.tsx`; también `NuevoTurnoModal` dentro de `GestionTurnos` | La ruta `/pedir-turno` es accesible para cualquier rol autenticado, incluido `PACIENTE`, pero el backend sólo permite `SECRETARIA`/`MEDICO`: un paciente que confirma un turno recibe 403 del back (comportamiento documentado en el propio código, `PedirTurno.tsx:42-46`). No hay ocultamiento de UI para ese caso, sólo el rechazo del backend |
| PUT | `/api/turnos/:id` | 401 | 403 | ✅ | ✅ | Sin pantalla de edición conectada | `TurnosTable` calcula `puedeEditarOReprogramar` para `SECRETARIA`/`MEDICO`, pero no hay una acción de edición cableada a `PUT /turnos/:id` todavía |
| DELETE | `/api/turnos/:id` | 401 | 403 | ✅ | ✅ | `/turnos/:id/cancelar` (`PrivateRoute`, cualquier rol) → `CancelarTurno.tsx` | El componente sólo navega de vuelta a `/mis-turnos`: no llama todavía a `DELETE /api/turnos/:id`. Ojo: la ruta frontend acepta a cualquier rol logueado (incluido `PACIENTE`), pero `turno.routes.ts` sólo autoriza `MEDICO` y `SECRETARIA` en este endpoint —a diferencia de lo previsto en la sección 8 de `matriz-permisos.md`, hoy un `PACIENTE` no puede cancelar ni siquiera su propio turno; recibiría 403 en cuanto se conecte la llamada |

### 5.4 Obras sociales

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| GET | `/api/obras-sociales` | ✅ | ✅ | ✅ | ✅ | `PacienteFormFields` / `RegistroPacienteForm` (combo de obra social) | Catálogo público, sólo se usa para poblar un `<select>` |
| POST | `/api/obras-sociales` | 401 | 403 | ✅ | 403 | Link "+ Nueva Obra Social" en el `Header`, visible únicamente si `tieneRol("SECRETARIA")` (`Header.tsx:61-67`), apunta a `/obras-sociales/nueva` | Esta es la operación de escritura con link escondido, ruta protegida y 403 en el back que pide el punto 4 de la tarjeta AG-C20 en su parte de backend/UI del Header. **Con una salvedad**: la ruta `/obras-sociales/nueva` no está declarada en `App.tsx`, por lo que hoy no existe la pantalla de destino ni una entrada `PrivateRoute` propia — el link queda "escondido para quien no es SECRETARIA" pero no hay página ni protección de ruta detrás todavía |

### 5.5 Especialidades

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO | Ruta / componente frontend | Qué hace la UI |
|--------|----------|:--------:|:--------:|:----------:|:------:|------------------------------|-----------------|
| GET | `/api/especialidades` | ✅ | ✅ | ✅ | ✅ | `PedirTurno`, `MedicoFormFields` (combos) | Catálogo público sin restricciones, usado sólo para poblar selects |

## 6. Renderizado condicional relevado en el código

| Dónde | Condición | Qué oculta/muestra |
|-------|-----------|---------------------|
| `Header.tsx:61-67` | `tieneRol("SECRETARIA")` | Link "+ Nueva Obra Social" |
| `Header.tsx:34-39` (`useRolView`) | rol del usuario | Sidebar pensado con distintas secciones por rol (admin: Turnos, Pacientes, Médicos; médico: + Agenda, Historial Clínico; paciente: sólo Inicio), **pero no se renderiza nunca**: `useRolView` indexa por `rol` tal cual lo guarda `AuthContext` (`"SECRETARIA"`, `"MEDICO"`, `"PACIENTE"`, en mayúsculas), y `Header.tsx` define las claves en minúscula y con otro nombre (`admin`, `medico`, `paciente`). Ninguna coincide, así que `vistaPorRol` siempre da `null` (ver sección 7) |
| `Home.tsx:16-20` | rol del usuario, vía `useRolView` | `GestionTurnos` para `SECRETARIA`/`MEDICO`, `HomePaciente` para `PACIENTE` |
| `BuscarMedico.tsx:6-8` | `tieneRol("MEDICO")` | Habilita el botón de alta de médico en `ListarUsuarios` |
| `BuscarPaciente.tsx:9` | `tieneRol("PACIENTE")` | Reemplaza el listado por un mensaje de acceso denegado (defensa adicional a la de `PrivateRoute`, ya que esta pantalla ya está detrás de `roles={["SECRETARIA","MEDICO"]}`) |
| `HistorialClinico.tsx:16` | `tieneRol("SECRETARIA")` | Reemplaza el historial por un mensaje de acceso denegado (esta pantalla ya está detrás de `roles={["MEDICO"]}` en `App.tsx`, por lo que una `SECRETARIA` ni siquiera llega a montarla; la verificación queda como defensa en profundidad) |
| `TurnosTable.tsx:49-53` | `tieneRol("SECRETARIA")` o `tieneRol("MEDICO")` | Muestra filtros y las acciones de crear/editar/reprogramar turno |
| `GestionTurnos.tsx:25-28` | `usuario?.rol === "MEDICO"` | Cambia el saludo del panel ("Dr. Apellido" vs. nombre de secretaría) |

## 7. Resumen de brechas entre UI y backend

Relevadas para que el equipo priorice qué falta cablear, no como crítica a ningún integrante:

1. **Altas sin endpoint**: `POST /api/pacientes`, `POST /api/medicos` y `POST /api/usuarios` son
   llamados desde sus respectivos formularios pero no existen en `backend/src/routes`. Las
   pantallas y sus rutas protegidas están correctamente implementadas; falta la contraparte del
   backend.
2. **Pantallas sin conectar**: `CambiarPassword`, `VerUsuario` (edición), `DetalleTurno` y
   `CancelarTurno` están protegidas por `PrivateRoute` pero no disparan ningún `apiFetch` todavía.
3. **`/pedir-turno` accesible a `PACIENTE` sin protección de rol**: la ruta sólo exige estar
   logueado; el rechazo de un alta de turno hecha por un paciente ocurre en el backend (403), no
   en la UI. Ya está señalado en un comentario del propio código
   (`PedirTurno.tsx:42-46`).
4. **`/obras-sociales/nueva` sin ruta declarada**: el link del Header apunta a una URL que no
   tiene entrada en `App.tsx`, por lo que no hay página ni `PrivateRoute` detrás todavía, aunque
   el 401/403 del backend (`POST /api/obras-sociales`) sí está implementado.
5. **Sidebar del Header roto por claves inconsistentes**: `Header.tsx` llama
   `useRolView({ admin, medico, paciente })`, pero `useRolView` indexa por el valor real del rol
   (`"SECRETARIA"`, `"MEDICO"`, `"PACIENTE"`). Al no coincidir ninguna clave, el sidebar del
   Header nunca se muestra para ningún rol. No es un problema de autorización (nadie ve algo que
   no debería), pero sí una funcionalidad de UI condicionada por rol que hoy no funciona. El
   mismo patrón en `Home.tsx` sí usa las claves correctas (`SECRETARIA`, `MEDICO`, `PACIENTE`) y
   funciona.
6. **`DELETE /api/turnos/:id` no coincide con el diseño**: la sección 8 de `matriz-permisos.md`
   prevé que el `PACIENTE` pueda cancelar su propio turno ("✅ propio"), pero
   `turno.routes.ts:32` sólo incluye `Rol.MEDICO` y `Rol.SECRETARIA` en el `authorize` de esa
   ruta. Hoy un paciente autenticado recibiría 403 al intentar cancelar un turno propio. Se deja
   señalado para que el equipo decida si es un ajuste pendiente del backend o un cambio de
   alcance deliberado.
