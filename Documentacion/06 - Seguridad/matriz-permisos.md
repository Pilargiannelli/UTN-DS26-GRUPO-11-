# Matriz de permisos

## 1. Propósito

Este documento define, para cada endpoint de la API, qué roles pueden ejecutarlo y qué
respuesta corresponde cuando el acceso es denegado. La matriz se establece previamente a la
implementación y constituye la fuente de verdad para:

- la aplicación de los middlewares `authenticate` y `authorize` en las rutas;
- los casos de error documentados en `api.http` (401, 403, 409).

Los endpoints listados corresponden a la tabla definida en
[05 - Diseño de API](../05%20-%20Diseño%20de%20API/diseño-api.md).

## 2. Roles del dominio

El sistema define tres roles, derivados de los actores identificados en el
[análisis inicial](../01%20-%20Análisis%20inicial/analisis-inicial.md). 

| Rol | Actor | Alcance |
|-----|-------|---------|
| Invitado | Usuario no autenticado. No constituye un valor del enumerado: representa la ausencia de identidad | Registro, login y consulta de la cartilla de médicos |
| PACIENTE | Persona que se atiende en el consultorio | Sus propios datos personales, sus turnos y su historia clínica |
| SECRETARIA | Personal administrativo | Gestión completa de pacientes y turnos. Sin acceso a la historia clínica |
| MEDICO | Médico traumatólogo, responsable del consultorio | Alcance de SECRETARIA, más historia clínica, agenda y configuración de disponibilidad |

Consideraciones sobre la definición de roles:

- **SECRETARIA no accede a la historia clínica.** La restricción proviene del glosario del
  análisis inicial, que define al personal administrativo como usuario que "puede registrar
  pacientes y gestionar turnos, pero no tiene acceso al historial clínico". Esta regla
  constituye la principal distinción entre ambos roles del personal.
- **El rol no se recibe en el cuerpo de la petición.** Se asigna en la base de datos mediante
  `@default(PACIENTE)`, de modo que ningún usuario pueda autoasignarse un rol de mayor
  privilegio durante el registro.

## 3. Convenciones de lectura

| Símbolo | Significado |
|---------|-------------|
| ✅ | Operación permitida |
| ✅ propio | Operación permitida únicamente sobre el recurso propio. El rol habilita el acceso, pero se requiere además la verificación de titularidad descripta en la sección 11 |
| 401 | No autenticado: el token está ausente, vencido o mal firmado |
| 403 | Autenticado sin permisos suficientes: el token es válido pero el rol no habilita la operación |

## 4. Autenticación

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| POST | /api/auth/registro | ✅ | ✅ | ✅ | ✅ |
| POST | /api/auth/login | ✅ | ✅ | ✅ | ✅ |
| GET | /api/auth/yo | 401 | ✅ | ✅ | ✅ |

El registro y el login son públicos por necesidad funcional: si requirieran un token, no
existiría forma de obtener el primero. El registro da de alta un usuario con rol PACIENTE.

## 5. Usuario

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/usuarios/:id | 401 | ✅ propio | ✅ | ✅ |
| PUT | /api/usuarios/:id | 401 | ✅ propio | ✅ | ✅ |
| PUT | /api/usuarios/:id/password | 401 | ✅ propio | ✅ propio | ✅ propio |

El cambio de contraseña se restringe al titular de la cuenta en los tres roles. Ningún rol,
incluido MEDICO, puede modificar la contraseña de otro usuario.

## 6. Paciente

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/pacientes | 401 | 403 | ✅ | ✅ |
| GET | /api/pacientes/:id | 401 | ✅ propio | ✅ | ✅ |
| POST | /api/pacientes | 401 | 403 | ✅ | ✅ |
| PUT | /api/pacientes/:id | 401 | ✅ propio | ✅ | ✅ |
| DELETE | /api/pacientes/:id | 401 | 403 | 403 | ✅ |

El listado de pacientes constituye la base de datos del consultorio, por lo que un paciente
autenticado no puede consultar la nómina de los demás. La respuesta es 403 y no 401, dado que
la identidad es conocida y el impedimento es de permisos.

El alta mediante POST corresponde a la carga administrativa que realiza el personal; el
autorregistro se resuelve por `/api/auth/registro`. Las dos crean juntos el `Usuario` (rol
PACIENTE) y su ficha de `Paciente`, para que no quede ningún paciente sin ficha. En el alta
por el personal, el usuario y la contraseña inicial son el DNI del paciente. La baja, por tratarse de una operación
irreversible sobre datos clínicos asociados, se reserva al rol MEDICO.

## 7. Médico

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/medicos | ✅ | ✅ | ✅ | ✅ |
| GET | /api/medicos/:id | ✅ | ✅ | ✅ | ✅ |
| POST | /api/medicos | 401 | 403 | 403 | ✅ |
| PUT | /api/medicos/:id | 401 | 403 | 403 | ✅ propio |
| DELETE | /api/medicos/:id | 401 | 403 | 403 | ✅ |
| PUT | /api/medicos/:id/bloqueos | 401 | 403 | 403 | ✅ propio |

La consulta de la cartilla es pública. Exigir autenticación para conocer qué profesional
atiende y en qué especialidad no aporta protección alguna e impide que el paciente evalúe la
oferta antes de registrarse. Es la única lectura pública de la API y no expone datos
personales: nombre, especialidad y matrícula constituyen información profesional.

La configuración de disponibilidad y los bloqueos horarios son atribución exclusiva del
profesional sobre su propia agenda. El personal administrativo gestiona turnos, pero no
define los horarios de atención del médico.

## 8. Turno

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/turnos | 401 | ✅ propio | ✅ | ✅ propio |
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
turnos, conforme a sus funciones administrativas.

El paciente puede cancelar su turno pero no reprogramarlo. Cancelar es un cambio de estado
(`PATCH /cancelar` → Cancelado) y no un borrado: el turno se conserva en el historial y se
pueden contar las cancelaciones. El paciente solo cancela turnos Pendientes o Reprogramados
(RN-006); si ya fue confirmado recibe 409 y debe comunicarse con el consultorio. El borrado
físico (`DELETE`) queda para el personal. La reprogramación modifica un
bloque de la agenda del profesional y genera un nuevo turno en estado Pendiente, por lo que
se canaliza a través del personal administrativo.

## 9. Agenda

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/agenda?medicoId=&fecha= | 401 | 403 | ✅ | ✅ propio |
| GET | /api/agenda?medicoId=&semana= | 401 | 403 | ✅ | ✅ propio |
| GET | /api/agenda/bloques-disponibles | 401 | ✅ | ✅ | ✅ |

Ambos recursos exponen información distinta y por eso reciben permisos distintos. La agenda
devuelve los turnos junto con el paciente asignado a cada uno, es decir, datos de terceros, y
por ello se deniega al rol PACIENTE. El recurso de bloques disponibles devuelve únicamente
franjas horarias libres, sin datos personales, y resulta necesario para la pantalla
PedirTurno.

## 10. Historia clínica

| Método | Endpoint | Invitado | PACIENTE | SECRETARIA | MEDICO |
|--------|----------|:--------:|:--------:|:----------:|:------:|
| GET | /api/pacientes/:id/historia-clinica | 401 | ✅ propio | 403 | ✅ |
| PUT | /api/pacientes/:id/historia-clinica | 401 | 403 | 403 | ✅ |
| GET | /api/pacientes/:id/historia-clinica/entradas | 401 | ✅ propio | 403 | ✅ |
| POST | /api/pacientes/:id/historia-clinica/entradas | 401 | 403 | 403 | ✅ |

El rol SECRETARIA recibe 403 en las cuatro operaciones, en aplicación de la restricción
establecida en la sección 2. El paciente puede consultar su historia clínica pero no
modificarla: diagnósticos, evolución, alergias y antecedentes son registrados por el médico.

## 11. Verificación de titularidad del recurso

Las celdas marcadas como "✅ propio" no quedan resueltas por el middleware `authorize`, ya que
este únicamente evalúa el rol contenido en el token y habilita, por lo tanto, a cualquier
usuario que lo posea. Sin una verificación adicional, un paciente autenticado podría solicitar
la historia clínica de otro paciente y obtener una respuesta exitosa.

La comprobación requerida consiste en comparar el identificador del usuario autenticado con el
titular del recurso solicitado. Dicha comparación se realiza en la capa de servicios, que es
la que dispone del recurso y de sus relaciones; no puede resolverse en un middleware genérico,
que desconoce la entidad involucrada en cada ruta. En consecuencia, cada celda "✅ propio" de
esta matriz se corresponde con una validación de titularidad en el servicio respectivo.

