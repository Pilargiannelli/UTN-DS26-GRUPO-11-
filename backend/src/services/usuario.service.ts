import { prisma } from "../config/prisma";

export async function listarUsuarios() {
  return prisma.usuario.findMany({
    select: {
      id: true,
      email: true,
      rol: true,
      nombre: true,
      apellido: true,
      dni: true,
    },
  });
}

export async function listarMedicos() {
  return prisma.medico.findMany({
    include: {
      usuario: {
        select: {
          nombre: true,
          apellido: true,
          email: true,
        },
      },
    },
  });
}

export async function listarPacientes() {
  return prisma.paciente.findMany({
    include: {
      usuario: {
        select: {
          nombre: true,
          apellido: true,
          email: true,
          dni: true,
        },
      },
    },
  });
}