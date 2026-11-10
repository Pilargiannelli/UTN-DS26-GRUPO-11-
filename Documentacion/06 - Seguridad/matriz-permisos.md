# Matriz de permisos

## 1. Propósito

Este documento define, para cada endpoint de la API, qué roles pueden ejecutarlo y qué
respuesta corresponde cuando el acceso es denegado. La matriz se estableció antes de la
implementación y se actualizó para reflejar los endpoints que finalmente tiene la API. Es la
fuente de verdad para:

- la aplicación de los middlewares `authenticate` y `authorize` en las rutas;
- los casos de error documentados en `api.http` (401, 403, 409).

Los endpoints listados corresponden a la tabla definida en
[05 - Diseño de API](../05%20-%20Diseño%20de%20API/diseño-api.md), que también detalla los
endpoints del diseño original que cambiaron o no se implementaron.

## 2. Roles del dominio

El sistema define tres roles, derivados de los actores identificados en el
[análisis inicial](../01%20-%20Análisis%20inicial/analisis-inicial.md). 

| Rol | Actor | Alcance |
|-----|-------|---------|
| Invitado | Usuario no autenticado. No constituye un valor del enumerado: representa la ausencia de identidad | Registro, login y consulta de la cartilla de médicos y de los catálogos |
| PACIENTE | Persona que se atiende en el consultorio | Sus propios datos personales, sus turnos y su historia clínica |
| SECRETARIA | Personal administrativo | Alta y edición de pacientes y médicos, gestión de todos los turnos y de las obras sociales. Sin acceso a la historia clínica |
| MEDICO | Médico, responsable del consultorio | Sus turnos (agenda), consulta y edición de pacientes, historia clínica |

Consideraciones sobre la definición de roles:

- **SECRETARIA no accede a la historia clínica.** La restricción proviene del glosario del
  análisis inicial, que define al personal administrativo como usuario que "puede registrar
  pacientes y gestionar turnos, pero no tiene acceso al historial clínico". Esta regla
  constituye la principal distinción entre ambos roles del personal.
- **El rol no se recibe en el cuerpo de la petición.** El registro público siempre crea un
  PACIENTE, y el esquema de validación descarta un `rol` que venga en el body, de modo que
  ningún usuario pueda autoasignarse un rol de mayor privilegio.

## 3. Convenciones de lectura

| Símbolo | Significado |
|---------|-------------|
| ✅ | Operación permitida |
| ✅ propio | Operación permitida únicamente sobre el recurso propio. El rol habilita el acceso, pero se requiere además la verificación de titularidad descripta en la sección 11 |
| 401 | No autenticado: el token está ausente, vencido o mal firmado |
| 403 | Autenticado sin permisos suficientes: el token es válido pero el rol no habilita la operación |

## 4. Autenticación y cuenta

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| POST | /api/auth/registro | ✅ | ✅ | ✅ | ✅ |
| POST | /api/auth/login | ✅ | ✅ | ✅ | ✅ |
| GET | /api/auth/yo | 401 | ✅ propio | ✅ propio | ✅ propio |
| PATCH | /api/auth/yo | 401 | ✅ propio | ✅ propio | ✅ propio |
| PATCH | /api/auth/password | 401 | ✅ propio | ✅ propio | ✅ propio |

El registro y el login son públicos por necesidad funcional: si requirieran un token, no
existiría forma de obtener el primero. El registro da de alta un usuario con rol PACIENTE.
Para frenar la fuerza bruta, el login responde 429 después de 10 intentos fallidos en 15
minutos desde la misma IP.

Las operaciones sobre la cuenta no reciben un id: el usuario sale del token. Por eso ningún
rol, incluido MEDICO, puede ver ni modificar los datos o la contraseña de otro usuario.

## 5. Catálogos y usuarios

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/especialidades | ✅ | ✅ | ✅ | ✅ |
| GET | /api/obras-sociales | ✅ | ✅ | ✅ | ✅ |
| POST | /api/obras-sociales | 401 | 403 | ✅ | 403 |
| GET | /api/usuarios | 401 | 403 | ✅ | ✅ |

Las especialidades y las obras sociales son catálogos sin datos personales: se necesitan en
el formulario de "Crear cuenta", antes de tener sesión. Agregar una obra social es una tarea
administrativa y queda para la secretaria.

## 6. Paciente

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/pacientes | 401 | 403 | ✅ | ✅ |
| GET | /api/pacientes/:id | 401 | 403 | ✅ | ✅ |
| POST | /api/pacientes | 401 | 403 | ✅ | 403 |
| PUT | /api/pacientes/:id | 401 | ✅ propio | ✅ | ✅ |

El listado de pacientes constituye la base de datos del consultorio, por lo que un paciente
autenticado no puede consultar la nómina de los demás. La respuesta es 403 y no 401, dado que
la identidad es conocida y el impedimento es de permisos. La ficha por id también es una
pantalla del personal: el paciente obtiene sus propios datos con `GET /api/auth/yo`.

El alta mediante POST corresponde a la carga administrativa que realiza la secretaria
(HU-001: "como personal administrativo"); el médico atiende pacientes ya registrados. El
autorregistro se resuelve por `/api/auth/registro`. Las dos crean juntos el `Usuario` (rol
PACIENTE) y su ficha de `Paciente`, para que no quede ningún paciente sin ficha. En el alta
por el personal, el paciente entra con su email y su DNI como contraseña inicial.

## 7. Médico

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/medicos | ✅ | ✅ | ✅ | ✅ |
| POST | /api/medicos | 401 | 403 | ✅ | 403 |

La consulta de la cartilla es pública. Exigir autenticación para conocer qué profesional
atiende y en qué especialidad no aporta protección alguna e impide que el paciente evalúe la
oferta antes de registrarse. No expone datos personales: nombre, especialidad y matrícula
constituyen información profesional.

El alta de médicos es una tarea administrativa y la realiza la secretaria. El médico entra
con su email y su DNI como contraseña inicial.

## 8. Turno

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/turnos | 401 | ✅ propio | ✅ | ✅ propio |
| GET | /api/turnos/ocupados | 401 | ✅ | ✅ | ✅ |
| GET | /api/turnos/:id | 401 | ✅ propio | ✅ | ✅ propio |
| POST | /api/turnos | 401 | ✅ | ✅ | ✅ |
| PATCH | /api/turnos/:id/cancelar | 401 | ✅ propio | ✅ | ✅ propio |
| PUT | /api/turnos/:id | 401 | 403 | ✅ | ✅ propio |
| DELETE | /api/turnos/:id | 401 | 403 | ✅ | ✅ propio |

Un turno ajeno ("propio" no se cumple) responde **404**, no 403: así no se revela que ese
id existe. La titularidad se verifica en `turno.service`, no en `authorize`.

Cuando el PACIENTE pide un turno (`POST`), solo envía `medicoId` y `fechaHora`: el
`pacienteId` sale del token y el turno nace en estado Pendiente.

`GET /api/turnos` devuelve un conjunto distinto según el rol: el paciente obtiene sus propios
turnos (pantalla MisTurnos) y el médico los correspondientes a su agenda. No se trata de una
denegación sino de un filtrado por identidad. El rol SECRETARIA accede a la totalidad de los
turnos, conforme a sus funciones administrativas. Con esa lista el front arma la agenda
diaria y semanal.

`GET /api/turnos/ocupados` devuelve únicamente los horarios tomados de un médico, sin datos
del paciente. Por eso lo puede pedir el PACIENTE: lo necesita para ver los horarios libres en
la pantalla PedirTurno.

El paciente puede cancelar su turno pero no reprogramarlo. Cancelar es un cambio de estado
(`PATCH /cancelar` → Cancelado) y no un borrado: el turno se conserva en el historial y se
pueden contar las cancelaciones. El paciente solo cancela turnos Pendientes o Reprogramados
(RN-006); si ya fue confirmado recibe 409 y debe comunicarse con el consultorio. El borrado
físico (`DELETE`) queda para el personal. La reprogramación modifica un bloque de la agenda
del profesional, por lo que se canaliza a través del personal.

## 9. Historia clínica

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/pacientes/:id/historia-clinica | 401 | ✅ propio | 403 | ✅ |
| PUT | /api/pacientes/:id/historia-clinica | 401 | 403 | 403 | ✅ |
| POST | /api/pacientes/:id/historia-clinica/entradas | 401 | 403 | 403 | ✅ |

El rol SECRETARIA recibe 403 en las tres operaciones, en aplicación de la restricción
establecida en la sección 2. El paciente puede consultar su historia clínica (Ley 26.529: es
su titular) pero no modificarla: diagnósticos, evolución, alergias y antecedentes son
registrados por el médico. Las consultas no se editan ni se borran.

## 10. Salud

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/health | ✅ | ✅ | ✅ | ✅ |

Responde `{ "status": "ok" }` sin consultar la base. Sirve para comprobar que el backend
deployado está despierto.

## 11. Verificación de titularidad del recurso

Las celdas marcadas como "✅ propio" no quedan resueltas por el middleware `authorize`, ya que
este únicamente evalúa el rol contenido en el token y habilita, por lo tanto, a cualquier
usuario que lo posea. Sin una verificación adicional, un paciente autenticado podría solicitar
la historia clínica de otro paciente y obtener una respuesta exitosa.

La comprobación requerida consiste en comparar el identificador del usuario autenticado con el
titular del recurso solicitado. Dicha comparación se realiza en la capa de servicios, que es
la que dispone del recurso y de sus relaciones; no puede resolverse en un middleware genérico,
que desconoce la entidad involucrada en cada ruta. En consecuencia, cada celda "✅ propio" de
esta matriz se corresponde con una validación de titularidad en el servicio respectivo:

| Endpoint | Dónde se verifica | Si no es propio |
|----------|-------------------|-----------------|
| Turnos (`GET /:id`, `PATCH /cancelar`, `PUT`, `DELETE`) | `turno.service` | 404 |
| `GET /api/turnos` | `turno.service` (filtra por médico o paciente) | Lista filtrada |
| `PUT /api/pacientes/:id` | `paciente.service` | 404 |
| `GET /api/pacientes/:id/historia-clinica` | `historiaClinica.service` | 404 |
| `/api/auth/yo`, `/api/auth/password` | `auth.controller` (el id sale del token) | No aplica |
