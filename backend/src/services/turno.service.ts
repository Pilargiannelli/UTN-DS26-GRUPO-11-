import { prisma } from "../config/prisma";
import { Turno } from "../types/turno.types";
import { Rol } from "../generated/prisma/enums";
import type { TokenPayload } from "../middlewares/auth.middleware";

// El array en memoria y el proximoId se van: ahora los datos viven en PostgreSQL.

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

// GET /api/turnos devuelve un conjunto distinto según el rol (matriz de
// permisos, sección 8): la Secretaria ve todos, el Médico y el Paciente sólo
// los propios. No es una denegación sino un filtrado por identidad, y esa
// verificación de titularidad vive acá, en el servicio (sección 11 de la
// matriz), no en el middleware authorize.
export async function findAllParaUsuario(usuario: TokenPayload) {
  if (usuario.rol === Rol.SECRETARIA) {
    return prisma.turno.findMany({ include: includeRelaciones });
  }

  if (usuario.rol === Rol.MEDICO) {
    const medico = await prisma.medico.findUnique({ where: { usuarioId: usuario.sub } });
    if (!medico) return [];
    return prisma.turno.findMany({
      where: { medicoId: medico.id },
      include: includeRelaciones,
    });
  }

  // PACIENTE
  const paciente = await prisma.paciente.findUnique({ where: { usuarioId: usuario.sub } });
  if (!paciente) return [];
  return prisma.turno.findMany({
    where: { pacienteId: paciente.id },
    include: includeRelaciones,
  });
}

export async function findById(id: number): Promise<Turno | null> {
  return prisma.turno.findUnique({ where: { id } });
}

export async function create(datos: Omit<Turno, "id">) {
  return prisma.turno.create({ data: datos, include: includeRelaciones });
}

export async function update(id: number, datos: Omit<Turno, "id">): Promise<Turno | null> {
  const existe = await prisma.turno.findUnique({ where: { id } });
  if (!existe) return null;
  return prisma.turno.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<boolean> {
  const existe = await prisma.turno.findUnique({ where: { id } });
  if (!existe) return false;
  await prisma.turno.delete({ where: { id } });
  return true;
}
