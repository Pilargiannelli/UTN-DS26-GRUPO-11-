import { prisma } from "../config/prisma";
import { Rol } from "../generated/prisma/enums";

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

// Para el MEDICO suma la fecha de la última consulta de cada paciente (el
// listado le sirve para entrar a la historia clínica). La SECRETARIA no la
// recibe: es un dato de la historia clínica (matriz de permisos §10).
export async function listarPacientes(rol?: Rol) {
  const pacientes = await prisma.paciente.findMany({
    include: {
      historiaClinica: {
        select: { entradas: { select: { fecha: true }, orderBy: { fecha: "desc" }, take: 1 } },
      },
      usuario: {
        select: {
          nombre: true,
          apellido: true,
          email: true,
          dni: true,
        },
      },
      // La obra social se muestra en el perfil y se edita desde ahí
      coberturas: { include: { obraSocial: true } },
    },
  });

  return pacientes.map(({ historiaClinica, ...paciente }) => ({
    ...paciente,
    ...(rol === Rol.MEDICO && { ultimaConsulta: historiaClinica?.entradas[0]?.fecha ?? null }),
  }));
}