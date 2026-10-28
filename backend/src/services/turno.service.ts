import { prisma } from "../config/prisma";
import { Rol, TurnoEstado } from "../generated/prisma/enums";
import type { TokenPayload } from "../middlewares/auth.middleware";
import { ErrorNegocio } from "../errors/ErrorNegocio";
import type { TurnoCreate, TurnoSolicitud, TurnoUpdate } from "../validations/turno.validation";

// GET /api/turnos manda el nombre del médico y del paciente: sin este include
// el front sólo recibe medicoId/pacienteId (la Filmina 18 de C19 avisa
// exactamente este caso: el contrato real no es el que el front asumía).
const includeRelaciones = {
  medico: {
    include: {
      usuario: { select: { nombre: true, apellido: true, email: true } },
    },
  },
  paciente: {
    include: {
      usuario: { select: { nombre: true, apellido: true, email: true, dni: true } },
    },
  },
} as const;

// Un solo mensaje para "no existe" y "no es tuyo": responder 403 al turno
// ajeno revelaría que ese id existe.
const NO_ENCONTRADO = "Turno no encontrado";

// Estados en los que el paciente todavía puede cancelar (RN-006: antes de la
// confirmación del consultorio).
const CANCELABLES_POR_PACIENTE: TurnoEstado[] = [TurnoEstado.Pendiente, TurnoEstado.Reprogramado];

// Un turno cuya fecha ya pasó no se cancela ni se confirma: no hay horario
// que liberar ni consulta que confirmar.
function assertNoPaso(fechaHora: Date, mensaje: string) {
  if (fechaHora < new Date()) throw new ErrorNegocio(409, mensaje);
}

// Estados que ocupan el horario del médico. Un turno Cancelado lo libera.
const ESTADOS_QUE_OCUPAN: TurnoEstado[] = [TurnoEstado.Pendiente, TurnoEstado.Confirmado, TurnoEstado.Reprogramado];

// RN-002: un médico no puede tener dos turnos activos en el mismo horario.
// Es regla de negocio (C17): la aplica el service y responde 409.
// excluirId: al editar un turno, no chocar consigo mismo.
async function assertHorarioLibre(medicoId: number, fechaHora: Date, excluirId?: number) {
  const ocupado = await prisma.turno.findFirst({
    where: {
      medicoId,
      fechaHora,
      estado: { in: ESTADOS_QUE_OCUPAN },
      ...(excluirId !== undefined && { NOT: { id: excluirId } }),
    },
    select: { id: true },
  });
  if (ocupado) throw new ErrorNegocio(409, "El médico ya tiene un turno en ese horario");
}

interface Identidad {
  medicoId?: number;
  pacienteId?: number;
  secretariaId?: number;
}

// El token trae el id de Usuario (sub); los turnos se relacionan con el id de
// Medico / Paciente / Secretaria. Esta función hace esa traducción.
async function obtenerIdentidad(usuario: TokenPayload): Promise<Identidad> {
  if (usuario.rol === Rol.MEDICO) {
    const medico = await prisma.medico.findUnique({ where: { usuarioId: usuario.sub } });
    return { medicoId: medico?.id };
  }
  if (usuario.rol === Rol.PACIENTE) {
    const paciente = await prisma.paciente.findUnique({ where: { usuarioId: usuario.sub } });
    return { pacienteId: paciente?.id };
  }
  const secretaria = await prisma.secretaria.findUnique({ where: { usuarioId: usuario.sub } });
  return { secretariaId: secretaria?.id };
}

// Titularidad (matriz de permisos, sección 11): la Secretaria ve todos los
// turnos; el Médico y el Paciente, sólo los propios. Vive acá, en el service,
// y no en authorize: authorize sólo conoce el rol, no de quién es el turno.
function assertTitularidad(
  turno: { medicoId: number; pacienteId: number },
  usuario: TokenPayload,
  identidad: Identidad
) {
  const esDueno =
    usuario.rol === Rol.SECRETARIA ||
    (usuario.rol === Rol.MEDICO && turno.medicoId === identidad.medicoId) ||
    (usuario.rol === Rol.PACIENTE && turno.pacienteId === identidad.pacienteId);

  if (!esDueno) throw new ErrorNegocio(404, NO_ENCONTRADO);
}

// GET /api/turnos devuelve un conjunto distinto según el rol (matriz de
// permisos, sección 8): no es una denegación sino un filtrado por identidad.
export async function findAllParaUsuario(usuario: TokenPayload) {
  if (usuario.rol === Rol.SECRETARIA) {
    return prisma.turno.findMany({ include: includeRelaciones });
  }

  const { medicoId, pacienteId } = await obtenerIdentidad(usuario);
  if (usuario.rol === Rol.MEDICO) {
    if (!medicoId) return [];
    return prisma.turno.findMany({ where: { medicoId }, include: includeRelaciones });
  }

  // PACIENTE
  if (!pacienteId) return [];
  return prisma.turno.findMany({ where: { pacienteId }, include: includeRelaciones });
}

export async function findByIdParaUsuario(id: number, usuario: TokenPayload) {
  const turno = await prisma.turno.findUnique({ where: { id }, include: includeRelaciones });
  if (!turno) throw new ErrorNegocio(404, NO_ENCONTRADO);

  assertTitularidad(turno, usuario, await obtenerIdentidad(usuario));
  return turno;
}

// POST /api/turnos. El body ya pasó por el schema que corresponde al rol
// (turnoSolicitudSchema para el paciente, turnoCreateSchema para el resto).
export async function crearParaUsuario(datos: TurnoCreate | TurnoSolicitud, usuario: TokenPayload) {
  const identidad = await obtenerIdentidad(usuario);
  await assertHorarioLibre(datos.medicoId, datos.fechaHora);

  if (usuario.rol === Rol.PACIENTE) {
    if (!identidad.pacienteId) {
      throw new ErrorNegocio(403, "Tu usuario no tiene un perfil de paciente");
    }
    // pacienteId sale del token: aunque el body mande otro, el turno es suyo
    return prisma.turno.create({
      data: {
        medicoId: datos.medicoId,
        fechaHora: datos.fechaHora,
        pacienteId: identidad.pacienteId,
        estado: TurnoEstado.Pendiente,
      },
      include: includeRelaciones,
    });
  }

  const datosStaff = datos as TurnoCreate;
  return prisma.turno.create({
    data: {
      ...datosStaff,
      // La secretaria que lo carga sale del token, no del body
      secretariaId: usuario.rol === Rol.SECRETARIA ? identidad.secretariaId : datosStaff.secretariaId,
    },
    include: includeRelaciones,
  });
}

// PATCH /api/turnos/:id/cancelar. Cancelar es un cambio de estado, no un
// borrado: el turno queda en el historial ("Pasadas") y se pueden contar las
// cancelaciones.
export async function cancelarParaUsuario(id: number, usuario: TokenPayload) {
  const turno = await findByIdParaUsuario(id, usuario);

  assertNoPaso(turno.fechaHora, "El turno ya pasó; no se puede cancelar");
  if (turno.estado === TurnoEstado.Cancelado) {
    throw new ErrorNegocio(409, "El turno ya está cancelado");
  }
  if (usuario.rol === Rol.PACIENTE && !CANCELABLES_POR_PACIENTE.includes(turno.estado)) {
    throw new ErrorNegocio(409, "El turno ya fue confirmado; comunicate con el consultorio");
  }

  return prisma.turno.update({
    where: { id },
    data: { estado: TurnoEstado.Cancelado },
    include: includeRelaciones,
  });
}

// PUT /api/turnos/:id (MEDICO y SECRETARIA; el médico, sólo los suyos)
export async function updateParaUsuario(id: number, datos: TurnoUpdate, usuario: TokenPayload) {
  const turno = await findByIdParaUsuario(id, usuario);
  if (datos.estado && datos.estado !== turno.estado) {
    assertNoPaso(turno.fechaHora, "El turno ya pasó; no se puede cambiar su estado");
  }

  // El PUT es parcial: la superposición se chequea con cómo quedaría el
  // turno (lo que vino en el body sobre lo que ya tenía)
  const quedaria = {
    medicoId: datos.medicoId ?? turno.medicoId,
    fechaHora: datos.fechaHora ?? turno.fechaHora,
    estado: datos.estado ?? turno.estado,
  };
  if (ESTADOS_QUE_OCUPAN.includes(quedaria.estado)) {
    await assertHorarioLibre(quedaria.medicoId, quedaria.fechaHora, id);
  }

  return prisma.turno.update({ where: { id }, data: datos, include: includeRelaciones });
}

// GET /api/turnos/ocupados: los horarios tomados de un médico en un rango.
// Devuelve solo las fechas, sin datos del paciente: por eso lo puede pedir
// el PACIENTE para armar los horarios disponibles en PedirTurno.
export async function horariosOcupados(medicoId: number, desde: Date, hasta: Date) {
  const turnos = await prisma.turno.findMany({
    where: { medicoId, fechaHora: { gte: desde, lt: hasta }, estado: { in: ESTADOS_QUE_OCUPAN } },
    select: { fechaHora: true },
    orderBy: { fechaHora: "asc" },
  });
  return turnos.map((t) => t.fechaHora);
}

// DELETE /api/turnos/:id (MEDICO y SECRETARIA; el médico, sólo los suyos)
export async function removeParaUsuario(id: number, usuario: TokenPayload) {
  await findByIdParaUsuario(id, usuario);
  await prisma.turno.delete({ where: { id } });
}
