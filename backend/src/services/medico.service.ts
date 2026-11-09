import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { SALT_ROUNDS } from "../config/env";
import { Rol } from "../generated/prisma/enums";
import { ErrorNegocio } from "../errors/ErrorNegocio";

export interface MedicoCreate {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  especialidad: string;
  matricula: string;
}

const includeMedico = {
  usuario: { select: { id: true, username: true, nombre: true, apellido: true, email: true, dni: true } },
} as const;

// Valida duplicados de DNI, email, username y matrícula antes de crear
async function assertSinDuplicados(datos: MedicoCreate, username?: string) {
  const existente = await prisma.usuario.findFirst({
    where: {
      OR: [{ dni: datos.dni }, { email: datos.email }, ...(username ? [{ username }] : [])],
    },
    select: { dni: true, email: true },
  });
  if (existente?.dni === datos.dni) throw new ErrorNegocio(409, "El DNI ya se encuentra registrado");
  if (existente?.email === datos.email) throw new ErrorNegocio(409, "El email ya se encuentra registrado");
  if (existente) throw new ErrorNegocio(409, "El nombre de usuario ya está en uso");

  const matriculaExistente = await prisma.medico.findUnique({
    where: { matricula: datos.matricula },
  });
  if (matriculaExistente) {
    throw new ErrorNegocio(409, "La matrícula ya se encuentra registrada");
  }
}

// Crea Usuario (rol MEDICO) + Medico en una sola operación anidada y atómica,
// siguiendo la misma lógica de crearPaciente[cite: 24].
export async function crearMedico(datos: MedicoCreate, credenciales?: { username?: string; password: string }) {
  const username = credenciales?.username ?? datos.dni;
  await assertSinDuplicados(datos, username);

  const passwordHash = await bcrypt.hash(credenciales?.password ?? datos.dni, SALT_ROUNDS);
  const { especialidad, matricula, ...datosUsuario } = datos;

  const usuario = await prisma.usuario.create({
    data: {
      ...datosUsuario,
      username,
      passwordHash,
      rol: Rol.MEDICO,
      medico: {
        create: {
          especialidad,
          matricula,
        },
      },
    },
  });

  return prisma.medico.findUniqueOrThrow({ where: { usuarioId: usuario.id }, include: includeMedico });
}

// GET /api/medicos/:id
export async function buscarPorId(medicoId: number) {
  const medico = await prisma.medico.findUnique({ where: { id: medicoId }, include: includeMedico });
  if (!medico) throw new ErrorNegocio(404, "Médico no encontrado");
  return medico;
}